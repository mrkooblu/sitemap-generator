import { NextApiRequest, NextApiResponse } from 'next';
import { generateSitemap } from '../../utils/sitemap-generator';
import { PageData, Crawler } from '../../utils/crawler';

// Declare the global crawlers map from the crawl.ts file
declare global {
  var crawlers: Map<string, { crawler: Crawler; startTime: number }>;
}

/**
 * Generate sitemap API endpoint
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(`API: [${req.method}] /api/generate-sitemap`);
  
  // Only accept POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { sessionId, options } = req.body;
    
    // Check for sessionId in both body and query params
    const effectiveSessionId = sessionId || req.query.sessionId;
    
    if (!effectiveSessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    // Check if the crawler session exists
    if (!global.crawlers || !global.crawlers.has(effectiveSessionId as string)) {
      return res.status(404).json({ error: 'Crawler session not found' });
    }

    // Get the crawler session
    const session = global.crawlers.get(effectiveSessionId as string);
    const state = session?.crawler.getState();
    
    // Get crawled URLs
    const crawledData = state?.result?.urls || [];
    
    // Ensure we have crawled data
    if (!crawledData || crawledData.length === 0) {
      // Check if crawling is still in progress
      if (!state?.isComplete) {
        return res.status(400).json({ 
          error: 'Crawling is still in progress. Please wait for it to complete or crawl more pages.',
          sessionId: effectiveSessionId
        });
      } else {
        return res.status(400).json({ 
          error: 'No pages have been crawled yet. Cannot generate sitemap.',
          sessionId: effectiveSessionId
        });
      }
    }
    
    // Prepare options for sitemap generation
    let sitemapOptions = options || {};
    
    // Enable pretty formatting by default
    sitemapOptions = {
      pretty: true,
      ...sitemapOptions
    };
    
    // Ensure we have the hostname for the sitemap
    if (!sitemapOptions.hostname) {
      // Try to extract hostname from the start URL in the crawl result
      if (state?.result?.startUrl) {
        try {
          const url = new URL(state.result.startUrl);
          sitemapOptions = {
            ...sitemapOptions,
            hostname: `${url.protocol}//${url.host}`
          };
        } catch (error) {
          return res.status(400).json({ 
            error: 'Cannot determine hostname from crawl data. Please provide a hostname in options.' 
          });
        }
      } 
      // Or try from the first URL if we have crawl data
      else if (crawledData.length > 0 && crawledData[0].url) {
        try {
          const url = new URL(crawledData[0].url);
          sitemapOptions = {
            ...sitemapOptions,
            hostname: `${url.protocol}//${url.host}`
          };
        } catch (error) {
          return res.status(400).json({ 
            error: 'Cannot determine hostname from crawl data. Please provide a hostname in options.' 
          });
        }
      } 
      // No valid hostname available
      else {
        return res.status(400).json({ 
          error: 'Hostname is required for sitemap generation.'
        });
      }
    }
    
    try {
      // Generate sitemap
      const sitemap = await generateSitemap(crawledData, sitemapOptions);
      
      // Return sitemap
      res.setHeader('Content-Type', 'application/xml');
      return res.status(200).send(sitemap);
    } catch (error) {
      console.error('Generate sitemap error:', error);
      return res.status(500).json({ error: 'Failed to generate sitemap' });
    }
  } catch (error) {
    console.error('Generate sitemap error:', error);
    return res.status(500).json({ error: 'Failed to generate sitemap' });
  }
} 