import { CrawlerOptions, PageData } from './crawler';

// CrawlState interface for localStorage
export interface CrawlState {
  rootUrl: string;
  options: CrawlerOptions;
  allUrls: string[];
  processedUrls: {[url: string]: PageData};
  pendingUrls: string[];
  discovered: {[url: string]: boolean};
  currentDepth: number;
  startTime: number;
  urlsCount: {
    total: number;
    processed: number;
    pending: number;
  };
  isCancelled: boolean;
  isComplete: boolean;
  currentBatchUrls: string[];
}

// Default crawl options
const DEFAULT_OPTIONS: Partial<CrawlerOptions> = {
  maxDepth: 3,
  includeImages: false,
  excludeNoindex: true,
  respectRobotsTxt: true,
  changeFrequency: 'weekly',
  priority: 0.7,
  maxPages: 1000,
  crawlRate: 100,
  requestTimeout: 10000,
  retryCount: 2
};

// Constants
const BATCH_SIZE = 5;
const CONCURRENT_BATCHES = 3;
const STORAGE_KEY = 'crawlState';

/**
 * Initialize a new crawl
 */
export function initCrawl(rootUrl: string, options: Partial<CrawlerOptions> = {}): CrawlState {
  // First normalize the root URL
  const normalizedRootUrl = normalizeUrl(rootUrl);
  
  const defaultOptions: CrawlerOptions = {
    maxDepth: 3,
    includeImages: true,
    excludeNoindex: true,
    respectRobotsTxt: true,
    changeFrequency: 'weekly',
    priority: 0.7,
    maxPages: 2000,
    crawlRate: 0, // No rate limiting for faster crawling
    requestTimeout: 10000,
    retryCount: 1
  };
  
  // Merge options with defaults
  const mergedOptions = {
    ...defaultOptions,
    ...options
  };
  
  // Create initial state
  const state: CrawlState = {
    rootUrl: normalizedRootUrl,
    options: mergedOptions,
    allUrls: [normalizedRootUrl],
    processedUrls: {},
    pendingUrls: [normalizedRootUrl],
    discovered: { [normalizedRootUrl]: true },
    currentDepth: 0,
    startTime: Date.now(),
    urlsCount: {
      total: 1,
      processed: 0,
      pending: 1
    },
    isCancelled: false,
    isComplete: false,
    currentBatchUrls: []
  };
  
  // Save initial state to storage
  saveState(state);
  
  return state;
}

/**
 * Save crawl state to localStorage
 */
export function saveState(state: CrawlState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving crawl state:', error);
    
    // If localStorage is full, try to reduce the state size
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      // Create a reduced state with a subset of processed URLs
      const reducedState = { ...state };
      
      // If we have more than 100 processed URLs, just keep the most recent 100
      const processedUrls = Object.keys(state.processedUrls);
      if (processedUrls.length > 100) {
        reducedState.processedUrls = {};
        processedUrls.slice(-100).forEach(url => {
          reducedState.processedUrls[url] = state.processedUrls[url];
        });
      }
      
      // Try saving again
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reducedState));
      } catch (innerError) {
        console.error('Failed to save reduced state:', innerError);
      }
    }
  }
}

/**
 * Load crawl state from localStorage
 */
export function loadState(): CrawlState | null {
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (!savedState) return null;
    
    return JSON.parse(savedState) as CrawlState;
  } catch (error) {
    console.error('Error loading crawl state:', error);
    return null;
  }
}

/**
 * Clear crawl state from localStorage
 */
export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Process next batch of URLs
 */
export async function processNextBatch(state: CrawlState): Promise<CrawlState> {
  if (state.isCancelled || state.isComplete || state.pendingUrls.length === 0) {
    return state;
  }
  
  // Calculate how many batches we can process
  const urlsToProcess = Math.min(
    state.pendingUrls.length,
    BATCH_SIZE * CONCURRENT_BATCHES,
    state.options.maxPages ? state.options.maxPages - Object.keys(state.processedUrls).length : Infinity
  );
  
  if (urlsToProcess <= 0) {
    // We've reached the max pages limit
    state.isComplete = true;
    saveState(state);
    return state;
  }
  
  // Get next batch of URLs
  const batchUrls = state.pendingUrls.slice(0, urlsToProcess);
  
  // Update state to mark these URLs as in progress
  state.currentBatchUrls = batchUrls;
  state.pendingUrls = state.pendingUrls.filter(url => !batchUrls.includes(url));
  saveState(state);
  
  // Split into smaller batches for concurrent processing
  const batches: string[][] = [];
  for (let i = 0; i < batchUrls.length; i += BATCH_SIZE) {
    batches.push(batchUrls.slice(i, i + BATCH_SIZE));
  }
  
  try {
    // Process all batches concurrently
    const batchResults = await Promise.all(
      batches.map(batch => processBatch(batch, state.rootUrl, state.options))
    );
    
    // Update state with results
    batchResults.forEach(result => {
      // Add processed URLs to state
      result.processedUrls.forEach(pageData => {
        if (!pageData.url) return;
        
        // Normalize URL before adding to processed URLs
        const normalizedUrl = normalizeUrl(pageData.url);
        
        // Update the URL in the page data
        pageData.url = normalizedUrl;
        
        // Add to processed URLs
        state.processedUrls[normalizedUrl] = pageData;
      });
      
      // Add new URLs to pending list if they haven't been discovered yet
      result.newUrls.forEach(url => {
        // Skip malformed or empty URLs
        if (!url || url === '') return;
        
        // Normalize the URL to avoid duplicates
        const normalizedUrl = normalizeUrl(url);
        
        // Skip invalid URLs after normalization
        if (!normalizedUrl || normalizedUrl === '' || normalizedUrl === 'https://') {
          return;
        }
        
        // Only add URLs we haven't seen before
        if (!state.discovered[normalizedUrl]) {
          state.discovered[normalizedUrl] = true;
          state.allUrls.push(normalizedUrl);
          state.pendingUrls.push(normalizedUrl);
          state.urlsCount.total++;
          state.urlsCount.pending++;
        }
      });
    });
    
    // Update URL counts
    state.urlsCount.processed = Object.keys(state.processedUrls).length;
    state.urlsCount.pending = state.pendingUrls.length;
    
    // Check if we're complete
    if (state.pendingUrls.length === 0 || 
        (state.options.maxPages && state.urlsCount.processed >= state.options.maxPages)) {
      state.isComplete = true;
    }
    
    // Clear current batch
    state.currentBatchUrls = [];
    
    // Save updated state
    saveState(state);
    
    return state;
  } catch (error) {
    console.error('Error processing batches:', error);
    
    // Move URLs from current batch back to pending
    state.pendingUrls = [...state.currentBatchUrls, ...state.pendingUrls];
    state.currentBatchUrls = [];
    
    // Save state with error handling
    saveState(state);
    
    return state;
  }
}

/**
 * Process a single batch of URLs
 */
async function processBatch(
  urls: string[], 
  baseUrl: string, 
  options: CrawlerOptions
): Promise<{ 
  processedUrls: PageData[],
  newUrls: string[]
}> {
  try {
    const response = await fetch('/api/process-batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ urls, baseUrl, options }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to process URL batch');
    }
    
    const { results } = await response.json();
    return results;
  } catch (error) {
    console.error('Batch processing error:', error);
    
    // Return empty results to handle the error gracefully
    return {
      processedUrls: urls.map(url => ({ 
        url, 
        changefreq: options.changeFrequency,
        priority: options.priority
      })),
      newUrls: []
    };
  }
}

/**
 * Cancel the crawl
 */
export function cancelCrawl(): void {
  const state = loadState();
  if (state) {
    state.isCancelled = true;
    saveState(state);
  }
}

/**
 * Get formatted progress information
 */
export function getProgressInfo(state: CrawlState): {
  urlsScanned: number;
  totalUrls: number;
  timeElapsed: string;
  estimatedTimeRemaining: string;
  currentUrl: string;
  percentComplete: number;
} {
  // Calculate time elapsed
  const elapsedMs = Date.now() - state.startTime;
  const elapsedSeconds = Math.floor(elapsedMs / 1000);
  
  // Format time elapsed
  const timeElapsed = formatTime(elapsedSeconds);
  
  // Calculate estimated time remaining
  let estimatedTimeRemaining = 'Calculating...';
  if (state.urlsCount.processed > 0 && state.urlsCount.pending > 0) {
    const msPerUrl = elapsedMs / state.urlsCount.processed;
    const remainingMs = msPerUrl * state.urlsCount.pending;
    estimatedTimeRemaining = formatTime(Math.floor(remainingMs / 1000));
  }
  
  // Get current URL
  const currentUrl = state.currentBatchUrls.length > 0 
    ? state.currentBatchUrls[0] 
    : '';
  
  // Calculate percentage complete
  const percentComplete = state.urlsCount.total > 0
    ? Math.min(Math.floor((state.urlsCount.processed / state.urlsCount.total) * 100), 100)
    : 0;
  
  return {
    urlsScanned: state.urlsCount.processed,
    totalUrls: state.urlsCount.total,
    timeElapsed,
    estimatedTimeRemaining,
    currentUrl,
    percentComplete
  };
}

/**
 * Format time in seconds to HH:MM:SS
 */
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0'),
  ].join(':');
}

/**
 * Convert the crawl results to sitemap data
 */
export function getCrawlResults(state: CrawlState): PageData[] {
  return Object.values(state.processedUrls);
}

/**
 * Get crawl statistics
 */
export function getCrawlStats(state: CrawlState): {
  urlsProcessed: number;
  totalUrls: number;
  crawlTime: number;
  averageTimePerUrl: number;
} {
  // Ensure crawlTime is at least 1 second to avoid divisions by zero
  const crawlTime = Math.max(1, Math.floor((Date.now() - state.startTime) / 1000));
  const urlsProcessed = state.urlsCount.processed;
  
  return {
    urlsProcessed,
    totalUrls: state.urlsCount.total,
    crawlTime,
    averageTimePerUrl: urlsProcessed > 0 ? crawlTime / urlsProcessed : 0
  };
}

/**
 * Normalize a URL to avoid duplicate crawling
 * - Removes fragments completely
 * - Removes query parameters
 * - Normalizes trailing slashes
 * - Lowercase hostname
 * - Fixes malformed URLs
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