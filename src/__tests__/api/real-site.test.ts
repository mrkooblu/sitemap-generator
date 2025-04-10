/**
 * DEPRECATED: This test file is no longer applicable.
 * 
 * The application has been refactored to use a client-coordinated batch-based crawling
 * architecture instead of server-side session management.
 * 
 * Please see batch-crawler.test.ts for the tests that cover the new implementation.
 * 
 * The old tests depended on:
 * - Server-side session management via global.crawlers Map
 * - API endpoints for managing crawler sessions (/api/crawl)
 * - Session ID based communication
 * 
 * The new architecture is based on:
 * - Client-side state management using localStorage
 * - Batch-based URL processing (/api/process-batch)
 * - Direct URL array for sitemap generation
 */

import request from 'supertest';
import { getBaseUrl } from '../setup';

/**
 * This test evaluates real-world crawling performance using the batch-based crawler
 * It helps identify performance benefits compared to the old server-side approach
 */
describe('Production Site Batch Crawl Performance Test', () => {
  // Set a reasonable timeout for real site testing
  jest.setTimeout(180000); // 3 minutes
  
  // Test site URL - a real Florida travel site
  const testSiteUrl = 'https://southfloridatravels.com';
  
  test('Should efficiently crawl a production site using batch processing', async () => {
    const baseUrl = getBaseUrl();
    
    console.log(`Starting batch crawl of ${testSiteUrl}`);
    
    // Track performance metrics
    const startTime = Date.now();
    const metrics = {
      batchesProcessed: 0,
      urlsProcessed: 0,
      urlsDiscovered: 0,
      requestTime: 0,
      processingTime: 0
    };
    
    // Store discovered and processed URLs
    const discoveredUrls = new Set([testSiteUrl]);
    const processedUrls = new Set();
    const pendingUrls = [testSiteUrl];
    const results = [];
    
    // Process URL batches until we reach a limit or run out of URLs
    const MAX_URLS = 50; // Limit for test purposes
    const BATCH_SIZE = 5;
    const MAX_DEPTH = 2;
    
    // Keep track of URL depth for limiting crawl depth
    const urlDepth = new Map();
    urlDepth.set(testSiteUrl, 0);
    
    while (pendingUrls.length > 0 && results.length < MAX_URLS) {
      // Get next batch of URLs to process
      const batchUrls = pendingUrls.splice(0, Math.min(BATCH_SIZE, pendingUrls.length));
      
      console.log(`Processing batch #${metrics.batchesProcessed + 1} with ${batchUrls.length} URLs`);
      
      const batchStartTime = Date.now();
      
      // Process this batch of URLs
      const response = await request(baseUrl)
        .post('/api/process-batch')
        .send({
          urls: batchUrls,
          baseUrl: testSiteUrl,
          options: {
            maxDepth: MAX_DEPTH,
            includeImages: true,
            excludeNoindex: true,
            respectRobotsTxt: true,
            changeFrequency: 'weekly',
            priority: 0.7,
            requestTimeout: 10000
          }
        });
      
      const requestEndTime = Date.now();
      metrics.requestTime += (requestEndTime - batchStartTime);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('results');
      expect(response.body.results).toHaveProperty('processedUrls');
      expect(response.body.results).toHaveProperty('newUrls');
      
      // Track processed URLs and add them to results
      for (const pageData of response.body.results.processedUrls) {
        processedUrls.add(pageData.url);
        results.push(pageData);
      }
      
      // Add new URLs to the queue if not already discovered
      const newUrls = response.body.results.newUrls || [];
      for (const url of newUrls) {
        if (!discoveredUrls.has(url)) {
          discoveredUrls.add(url);
          
          // Calculate URL depth based on parent depth
          let depth = MAX_DEPTH;
          for (const parentUrl of batchUrls) {
            if (url.startsWith(parentUrl)) {
              const parentDepth = urlDepth.get(parentUrl) || 0;
              depth = parentDepth + 1;
              break;
            }
          }
          
          // Only add URLs within our max depth
          if (depth <= MAX_DEPTH) {
            urlDepth.set(url, depth);
            pendingUrls.push(url);
          }
        }
      }
      
      // Update metrics
      metrics.batchesProcessed++;
      metrics.urlsProcessed += response.body.results.processedUrls.length;
      metrics.urlsDiscovered += newUrls.length;
      metrics.processingTime = Date.now() - startTime;
      
      // Log progress
      console.log(`Batch #${metrics.batchesProcessed} completed:
        - Processed: ${response.body.results.processedUrls.length} URLs
        - Discovered: ${newUrls.length} new URLs
        - Total processed: ${metrics.urlsProcessed}
        - Total discovered: ${metrics.urlsDiscovered}
        - Pending: ${pendingUrls.length} URLs
        - Elapsed time: ${(Date.now() - startTime) / 1000}s`);
    }
    
    // Performance analysis
    const totalTime = Date.now() - startTime;
    const urlsPerSecond = metrics.urlsProcessed / (totalTime / 1000);
    const avgRequestTime = metrics.requestTime / metrics.batchesProcessed;
    
    console.log(`
      Batch Crawler Performance Summary:
      - Total URLs processed: ${metrics.urlsProcessed}
      - Total URLs discovered: ${metrics.urlsDiscovered}
      - Total batches: ${metrics.batchesProcessed}
      - Total time: ${totalTime / 1000}s
      - Processing speed: ${urlsPerSecond.toFixed(2)} URLs/second
      - Average batch request time: ${avgRequestTime}ms
    `);
    
    // Finally, verify we have collected meaningful data
    expect(metrics.urlsProcessed).toBeGreaterThan(0);
    expect(metrics.urlsDiscovered).toBeGreaterThan(0);
    expect(metrics.batchesProcessed).toBeGreaterThan(0);
    
    // Generate a sitemap from the collected URLs to verify full flow
    if (results.length > 0) {
      console.log(`Generating sitemap from ${results.length} URLs`);
      
      const sitemapResponse = await request(baseUrl)
        .post('/api/generate-sitemap')
        .send({
          urls: results,
          options: {
            hostname: testSiteUrl,
            pretty: true
          }
        });
      
      expect(sitemapResponse.status).toBe(200);
      expect(sitemapResponse.text).toContain('<?xml');
      expect(sitemapResponse.text).toContain('<urlset');
      
      // Count URLs in the sitemap
      const urlCount = (sitemapResponse.text.match(/<url>/g) || []).length;
      console.log(`Sitemap contains ${urlCount} URLs`);
      
      expect(urlCount).toBeGreaterThan(0);
    }
  });
}); 