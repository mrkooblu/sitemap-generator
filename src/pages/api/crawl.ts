import { NextApiRequest, NextApiResponse } from 'next';
import Crawler, { CrawlerOptions, CrawlerProgress } from '../../utils/crawler';
import { v4 as uuidv4 } from 'uuid';

// Create a global crawlers map to store active crawler instances
declare global {
  var crawlers: Map<string, { crawler: Crawler; startTime: number }>;
}

// Initialize the global map if it doesn't exist
if (!global.crawlers) {
  global.crawlers = new Map();
}

// Clean up old crawlers (older than 1 hour)
const cleanupOldCrawlers = () => {
  const now = Date.now();
  const ONE_HOUR = 60 * 60 * 1000;
  
  global.crawlers.forEach((data, sessionId) => {
    if (now - data.startTime > ONE_HOUR) {
      console.log(`Cleaning up old crawler session: ${sessionId}`);
      global.crawlers.delete(sessionId);
    }
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`API: [${req.method}] /api/crawl`);
  
  try {
    // Clean up old crawlers on each request
    cleanupOldCrawlers();
    
    // Handle different HTTP methods
    switch (req.method) {
      case 'POST':
        await handlePostRequest(req, res);
        break;
      case 'GET':
        await handleGetRequest(req, res);
        break;
      case 'DELETE':
        await handleDeleteRequest(req, res);
        break;
      default:
        res.setHeader('Allow', ['POST', 'GET', 'DELETE']);
        res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Crawler API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**
 * Handle starting a new crawl
 */
async function handlePostRequest(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { url, options } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    // Validate URL
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }
    
    // Create session ID for this crawl
    const sessionId = generateSessionId();
    
    // Set up the crawler with provided options
    const crawlerOptions: CrawlerOptions = {
      maxDepth: options?.maxDepth || 5,
      includeImages: options?.includeImages || false,
      excludeNoindex: options?.excludeNoindex || true,
      respectRobotsTxt: options?.respectRobotsTxt || true,
      changeFrequency: options?.changeFrequency || 'weekly',
      priority: options?.priority || 0.7,
      maxPages: options?.maxPages || 1000,
    };
    
    const crawler = new Crawler(crawlerOptions);
    
    // Store the crawler instance
    global.crawlers.set(sessionId, { crawler, startTime: Date.now() });
    
    // Start crawling in the background
    crawlInBackground(sessionId, crawler, url);
    
    // Return the session ID for progress tracking
    return res.status(200).json({ 
      sessionId,
      message: 'Crawling started',
    });
  } catch (error) {
    console.error('Start crawl error:', error);
    return res.status(500).json({ error: 'Failed to start crawling process' });
  }
}

/**
 * Handle getting crawl progress
 */
async function handleGetRequest(req: NextApiRequest, res: NextApiResponse) {
  const { sessionId } = req.query;
  
  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({ error: 'Session ID is required' });
  }
  
  const crawlerSession = global.crawlers.get(sessionId);
  
  if (!crawlerSession) {
    return res.status(404).json({ error: 'Crawling session not found' });
  }
  
  // If complete, return the result
  if (crawlerSession.crawler.isComplete) {
    if (crawlerSession.crawler.error) {
      return res.status(500).json({ 
        error: crawlerSession.crawler.error, 
        isComplete: true 
      });
    }
    
    return res.status(200).json({ 
      isComplete: true,
      result: crawlerSession.crawler.result,
    });
  }
  
  // Return the current progress - use getProgress method instead of accessing private property
  const progress = crawlerSession.crawler.getProgress() || {
    urlsScanned: 0,
    totalUrls: 0,
    timeElapsed: '00:00:00',
    estimatedTimeRemaining: 'Calculating...',
    currentUrl: ''
  };
  
  return res.status(200).json({ 
    isComplete: false,
    progress,
  });
}

/**
 * Handle canceling a crawl
 */
async function handleDeleteRequest(req: NextApiRequest, res: NextApiResponse) {
  const { sessionId } = req.query;
  
  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({ error: 'Session ID is required' });
  }
  
  const crawlerSession = global.crawlers.get(sessionId);
  
  if (!crawlerSession) {
    return res.status(404).json({ error: 'Crawling session not found' });
  }
  
  // Cancel the crawler
  crawlerSession.crawler.cancel();
  crawlerSession.crawler.isComplete = true;
  crawlerSession.crawler.error = 'Crawling canceled by user';
  
  return res.status(200).json({ success: true, message: 'Crawling canceled' });
}

/**
 * Start crawling in the background
 */
async function crawlInBackground(sessionId: string, crawler: Crawler, url: string) {
  try {
    // Progress callback to update the progress
    const progressCallback = (progress: CrawlerProgress) => {
      const crawlerSession = global.crawlers.get(sessionId);
      if (crawlerSession) {
        // Use setProgress method instead of directly setting the private property
        crawlerSession.crawler.setProgress(progress);
      }
    };
    
    // Start crawling
    const result = await crawler.crawl(url, progressCallback);
    
    // Update the session with the result
    const crawlerSession = global.crawlers.get(sessionId);
    if (crawlerSession) {
      crawlerSession.crawler.isComplete = true;
      crawlerSession.crawler.result = result;
    }
  } catch (error) {
    console.error('Background crawl error:', error);
    
    // Update the session with the error
    const crawlerSession = global.crawlers.get(sessionId);
    if (crawlerSession) {
      crawlerSession.crawler.isComplete = true;
      crawlerSession.crawler.error = error instanceof Error 
        ? error.message 
        : 'Unknown error during crawling';
    }
  }
}

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `crawl-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
} 