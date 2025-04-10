import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import { PageData } from './crawler';

export interface SitemapOptions {
  hostname: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
  includeImages?: boolean;
  pretty?: boolean; // Option to enable pretty formatting
}

/**
 * Format XML string to be more readable with proper indentation
 */
function formatXml(xml: string): string {
  let formatted = '';
  let indent = '';
  const tab = '  '; // 2 spaces for indentation
  
  xml.split(/>\s*</).forEach(node => {
    if (node.match(/^\/\w/)) {
      // Closing tag
      indent = indent.substring(tab.length);
    }
    
    formatted += indent + '<' + node + '>\n';
    
    if (node.match(/^<?\w[^>]*[^\/]$/) && !node.startsWith('?xml')) {
      // Opening tag
      indent += tab;
    }
  });
  
  // Remove extra line breaks and fix self-closing tags
  return formatted
    .replace(/\s+$/gm, '') // Remove trailing whitespace
    .replace(/<([^>]*)><\/\1>/g, '<$1/>') // Fix empty tags
    .replace(/&amp;/g, '&'); // Fix ampersands (if escaped twice)
}

/**
 * Normalize a URL to remove fragments and standardize format
 */
function normalizeUrl(url: string): string {
  try {
    // Fix common URL formatting issues
    let cleanUrl = url.trim();
    
    // Fix malformed URLs like "lockhttps://"
    if (cleanUrl.startsWith('lock') && cleanUrl.includes('http')) {
      cleanUrl = cleanUrl.replace('lock', '');
    }
    
    // Make sure URL has proper protocol
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }
    
    const urlObj = new URL(cleanUrl);
    
    // Lowercase the hostname
    urlObj.hostname = urlObj.hostname.toLowerCase();
    
    // Remove all query parameters
    urlObj.search = '';
    
    // Remove fragments
    urlObj.hash = '';
    
    // Normalize the path
    let path = urlObj.pathname;
    
    // Ensure path ends with trailing slash for consistency 
    // (except for paths with file extensions)
    const hasFileExtension = /\.[a-zA-Z0-9]{2,4}$/.test(path);
    
    if (!hasFileExtension) {
      if (!path.endsWith('/')) {
        path = path + '/';
      }
    }
    
    urlObj.pathname = path;
    
    return urlObj.toString();
  } catch (error) {
    console.error(`Error normalizing URL ${url}:`, error);
    return url;
  }
}

/**
 * Generates an XML sitemap from crawled page data
 */
export async function generateSitemap(
  pages: PageData[],
  options: SitemapOptions
): Promise<string> {
  try {
    // Make sure we have pages to process
    if (!pages || pages.length === 0) {
      throw new Error('No pages provided for sitemap generation');
    }

    // Normalize and deduplicate URLs
    const normalizedPages = new Map<string, PageData>();
    
    // First pass: normalize all URLs and group by normalized URL
    pages.forEach(page => {
      if (!page.url) return;
      
      const normalizedUrl = normalizeUrl(page.url);
      
      // Skip invalid URLs
      if (!normalizedUrl || normalizedUrl === '' || normalizedUrl === 'https://') {
        return;
      }
      
      // If we already have this URL, keep the one with more data or most recent lastmod
      if (normalizedPages.has(normalizedUrl)) {
        const existingPage = normalizedPages.get(normalizedUrl)!;
        
        // If the current page has a more recent lastmod, use it instead
        if (page.lastmod && (!existingPage.lastmod || new Date(page.lastmod) > new Date(existingPage.lastmod))) {
          // Merge with existing images if needed
          if (existingPage.images && existingPage.images.length > 0) {
            page.images = [...(page.images || []), ...existingPage.images];
          }
          normalizedPages.set(normalizedUrl, { ...page, url: normalizedUrl });
        } else {
          // Keep existing page but add new images if available
          if (page.images && page.images.length > 0) {
            const mergedImages = [...(existingPage.images || []), ...page.images];
            normalizedPages.set(normalizedUrl, { 
              ...existingPage, 
              images: mergedImages 
            });
          }
        }
      } else {
        // New URL, add to map with normalized URL
        normalizedPages.set(normalizedUrl, { ...page, url: normalizedUrl });
      }
    });
    
    // Create sitemap stream
    const sitemapStream = new SitemapStream({
      hostname: options.hostname,
    });

    // Create links for the sitemap
    const links = Array.from(normalizedPages.values()).map((page) => {
      // Initialize the link object
      const link: any = {
        url: page.url,
        lastmod: page.lastmod || options.lastmod || new Date().toISOString(),
        changefreq: page.changefreq || options.changefreq || 'weekly',
        priority: page.priority !== undefined ? page.priority : (options.priority || 0.7),
      };

      // Add images if included and available
      if (options.includeImages && page.images && page.images.length > 0) {
        // Filter out data URIs and SVG placeholders
        const validImages = page.images.filter(imageUrl => 
          typeof imageUrl === 'string' && 
          !imageUrl.startsWith('data:') && 
          !imageUrl.includes('svg+xml') &&
          !imageUrl.includes('base64')
        );
        
        // Deduplicate images
        const uniqueImages = Array.from(new Set(validImages));
        
        if (uniqueImages.length > 0) {
          link.img = uniqueImages.map((imageUrl) => ({
            url: imageUrl,
            // You could extract alt and title from the original HTML if needed
          }));
        }
      }

      return link;
    });

    // Make sure we have at least one valid link
    if (links.length === 0) {
      throw new Error('No valid links generated for sitemap');
    }

    // Return promise for sitemap
    return streamToPromise(
      Readable.from(links).pipe(sitemapStream)
    ).then((data) => {
      let xmlString = data.toString();
      
      // Apply pretty formatting if enabled
      if (options.pretty !== false) { // Default to pretty if not specified
        xmlString = formatXml(xmlString);
      }
      
      return xmlString;
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    throw error;
  }
}

/**
 * Split large sitemaps into multiple files with an index
 */
export function splitSitemap(
  pages: PageData[],
  baseUrl: string,
  maxEntriesPerFile: number = 10000
): { index: string; sitemaps: Record<string, string> } {
  // To be implemented when needed - would split large sitemaps
  // into multiple files with a sitemap index
  throw new Error('Not implemented');
}

export default {
  generateSitemap,
  splitSitemap,
}; 