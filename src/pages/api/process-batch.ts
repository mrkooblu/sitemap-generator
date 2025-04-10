import { NextApiRequest, NextApiResponse } from 'next';
import Crawler, { CrawlerOptions, PageData } from '../../utils/crawler';
import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Configure API route to allow larger request body size
 */
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Increase from default 1mb
    },
  },
};

/**
 * Process a batch of URLs API endpoint
 * This is optimized for serverless environments where each function call should complete quickly
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
  
  try {
    const { urls, options, baseUrl } = req.body;
    
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: 'URLs array is required' });
    }
    
    if (!baseUrl) {
      return res.status(400).json({ error: 'Base URL is required' });
    }
    
    // Process the batch of URLs
    const results = await processBatch(urls, baseUrl, options);
    
    // Return the results
    return res.status(200).json({ results });
  } catch (error) {
    console.error('Batch processing error:', error);
    return res.status(500).json({ 
      error: 'Failed to process URL batch',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Process a batch of URLs and return results
 */
async function processBatch(
  urls: string[], 
  baseUrl: string,
  options: CrawlerOptions
): Promise<{ 
  processedUrls: PageData[],
  newUrls: string[]
}> {
  // Initialize results
  const processedUrls: PageData[] = [];
  const newUrls: Set<string> = new Set();
  
  // Pre-filter URLs to avoid processing ones that should be excluded
  const filteredUrls = filterUrls(urls, baseUrl);
  
  // Process each URL in the batch
  const promises = filteredUrls.map(async (url) => {
    try {
      const response = await axios.get(url, {
        timeout: options.requestTimeout || 10000,
        headers: {
          'User-Agent': 'SitemapGenerator/1.0'
        }
      });
      
      // Only process HTML responses
      const contentType = response.headers['content-type'] || '';
      if (!contentType.includes('text/html')) {
        // Still mark as processed even if not HTML
        processedUrls.push({
          url,
          changefreq: options.changeFrequency,
          priority: options.priority
        });
        return;
      }
      
      const html = response.data;
      
      // Parse HTML
      const $ = cheerio.load(html);
      
      // Check for noindex
      if (options.excludeNoindex && hasNoindex($)) {
        // Skip this URL for results, but still mark as processed
        processedUrls.push({
          url,
          changefreq: options.changeFrequency,
          priority: options.priority
        });
        return;
      }
      
      // Extract links
      const extractedUrls: string[] = [];
      $('a[href]').each((_, element) => {
        const href = $(element).attr('href');
        if (!href) return;
        
        // Skip Cloudflare email protection links immediately
        if (href.includes('/cdn-cgi/l/email-protection')) {
          return;
        }
        
        try {
          // Resolve relative URLs
          const absoluteUrl = new URL(href, url).toString();
          extractedUrls.push(absoluteUrl);
        } catch (error) {
          // Skip invalid URLs
        }
      });
      
      // Filter extracted URLs before adding to newUrls set
      const validUrls = filterUrls(extractedUrls, baseUrl);
      for (const validUrl of validUrls) {
        newUrls.add(validUrl);
      }
      
      // Extract images if enabled
      const images: string[] = [];
      if (options.includeImages) {
        $('img[src]').each((_, element) => {
          const src = $(element).attr('src');
          if (src) {
            try {
              const absoluteSrc = new URL(src, url).toString();
              images.push(absoluteSrc);
            } catch (error) {
              // Skip invalid image URLs
            }
          }
        });
      }
      
      // Add to results
      processedUrls.push({
        url,
        lastmod: getLastModified($, response.headers),
        changefreq: options.changeFrequency,
        priority: options.priority,
        images: images.length > 0 ? images : undefined
      });
    } catch (error) {
      console.error(`Error processing ${url}:`, error);
      // Include the URL in processed list even if there was an error
      processedUrls.push({
        url,
        changefreq: options.changeFrequency,
        priority: options.priority
      });
    }
  });
  
  // Wait for all URLs to be processed
  await Promise.all(promises);
  
  // Final filtering of new URLs before returning
  const finalFilteredUrls = Array.from(newUrls).filter(url => {
    // Explicitly filter out email protection URLs one last time
    return !url.includes('/cdn-cgi/l/email-protection');
  });
  
  return {
    processedUrls,
    newUrls: finalFilteredUrls
  };
}

/**
 * Filter an array of URLs, removing those that shouldn't be included
 */
function filterUrls(urls: string[], baseUrl: string): string[] {
  return urls.filter(url => {
    // First do a simple string check before parsing URL
    if (url.includes('/cdn-cgi/l/email-protection')) {
      console.log(`Quick-filtering out Cloudflare email protection URL: ${url}`);
      return false;
    }
    
    return shouldIncludeUrl(url, baseUrl);
  });
}

/**
 * Check if a URL should be included in the crawl
 */
function shouldIncludeUrl(url: string, baseUrl: string): boolean {
  try {
    const urlObj = new URL(url);
    const baseUrlObj = new URL(baseUrl);
    
    // Same domain check
    if (urlObj.hostname !== baseUrlObj.hostname) {
      return false;
    }
    
    const path = urlObj.pathname.toLowerCase();
    
    // Explicitly check for Cloudflare email protection URLs first
    if (path.includes('/cdn-cgi/l/email-protection')) {
      console.log(`Filtering out Cloudflare email protection URL: ${url}`);
      return false;
    }
    
    // Skip URLs with fragments
    if (urlObj.hash) {
      // Create a URL without the fragment
      const urlWithoutFragment = new URL(url);
      urlWithoutFragment.hash = '';
      
      // Skip this URL if we've already included the same URL without fragment
      return urlWithoutFragment.toString() !== url;
    }
    
    // Skip common non-HTML extensions
    const nonHtmlExtensions = [
      '.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx', 
      '.xls', '.xlsx', '.zip', '.tar', '.gz', '.mp3', '.mp4', 
      '.avi', '.mov', '.wmv', '.css', '.js', '.xml'
    ];
    
    if (nonHtmlExtensions.some(ext => path.endsWith(ext))) {
      return false;
    }
    
    // Skip common paths that shouldn't be crawled
    const excludedPathPatterns = [
      '/wp-admin',
      '/wp-login',
      '/wp-json',
      '/admin',
      '/login',
      '/logout',
      '/cdn-cgi/',
      '/wp-content/uploads',
      '/search',  // Search result pages
      '/tag/',    // Tag pages in most CMS
      '/author/', // Author pages in WordPress
      '/feed/',   // RSS feeds
      '/comments/',
      '/trackback/'
    ];
    
    if (excludedPathPatterns.some(pattern => path.startsWith(pattern))) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error checking URL ${url}:`, error);
    return false;
  }
}

/**
 * Check if a page has noindex meta tag
 */
function hasNoindex($: cheerio.CheerioAPI): boolean {
  const robotsMeta = $('meta[name="robots"], meta[name="googlebot"]');
  
  let hasNoindex = false;
  robotsMeta.each((_, element) => {
    const content = $(element).attr('content')?.toLowerCase() || '';
    if (content.includes('noindex')) {
      hasNoindex = true;
      return false; // Break the loop
    }
  });
  
  return hasNoindex;
}

/**
 * Get the last modified date from meta tags or headers
 */
function getLastModified($: cheerio.CheerioAPI, headers: any): string | undefined {
  // Try to get lastmod from meta tags
  const lastMod = $('meta[name="last-modified"]').attr('content') ||
                  $('meta[property="article:modified_time"]').attr('content') ||
                  $('meta[property="og:updated_time"]').attr('content');
  
  if (lastMod) {
    return lastMod;
  }
  
  // Try to get from headers
  const lastModHeader = headers['last-modified'];
  if (lastModHeader) {
    return new Date(lastModHeader).toISOString();
  }
  
  // Default to current time
  return new Date().toISOString();
} 