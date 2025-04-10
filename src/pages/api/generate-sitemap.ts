import { NextApiRequest, NextApiResponse } from 'next';
import { generateSitemap } from '../../utils/sitemap-generator';
import { PageData } from '../../utils/crawler';

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
 * Generate sitemap API endpoint
 * Modified to work with client-coordinated approach
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
    const { urls, options } = req.body;
    
    // Ensure we have URLs
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ 
        error: 'No URLs provided. Cannot generate sitemap.',
      });
    }

    // Convert array to PageData if it's not already
    const pageData: PageData[] = urls.map((url: any) => {
      if (typeof url === 'string') {
        return {
          url,
          changefreq: options?.changeFrequency || 'weekly',
          priority: options?.priority || 0.7
        };
      }
      return url;
    });

    // Generate sitemap
    const sitemapXml = await generateSitemap(pageData, options);
    
    // Send XML response
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(sitemapXml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate sitemap',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 