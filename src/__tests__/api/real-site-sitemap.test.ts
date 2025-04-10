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
 * This test evaluates real-world sitemap generation using batch-based crawling
 * It tests the complete flow from batch crawling to sitemap generation with a real site
 */
describe('Production Site Batch Crawl & Sitemap Test', () => {
  // Set a long timeout for the test to have time to crawl
  jest.setTimeout(300000); // 5 minutes
  
  // Test site URL - a real Florida travel site
  const testSiteUrl = 'https://southfloridatravels.com';
  
  test('Should crawl a real site using batches and generate a sitemap', async () => {
    const baseUrl = getBaseUrl();
    
    console.log(`Starting batch crawl of ${testSiteUrl} for sitemap generation`);
    
    // 1. Track discovery and results
    const discoveredUrls = new Set([testSiteUrl]);
    const pendingUrls = [testSiteUrl];
    const processedPageData = [];
    
    // 2. Configuration
    const MAX_PAGES = 40; // Limit for test purposes
    const MAX_DEPTH = 2;
    const BATCH_SIZE = 5;
    const CONCURRENT_BATCHES = 2; // Process 2 batches concurrently
    
    // 3. Track progress and timing
    const startTime = Date.now();
    let totalBatches = 0;
    
    // Keep track of URL depth to respect MAX_DEPTH
    const urlDepth = new Map();
    urlDepth.set(testSiteUrl, 0);
    
    // 4. Process batches until we've reached our target or run out of URLs
    while (pendingUrls.length > 0 && processedPageData.length < MAX_PAGES) {
      console.log(`Pending URLs: ${pendingUrls.length}, Processed Pages: ${processedPageData.length}`);
      
      // Define batch configurations for this round of processing
      const batchConfigs = [];
      
      // Create batch configurations
      for (let i = 0; i < CONCURRENT_BATCHES && pendingUrls.length > 0; i++) {
        // Get next batch of URLs
        const batchUrls = pendingUrls.splice(0, Math.min(BATCH_SIZE, pendingUrls.length));
        
        // Skip if batch is empty
        if (batchUrls.length === 0) continue;
        
        // Add this batch configuration
        batchConfigs.push({
          urls: batchUrls,
          batchNumber: totalBatches + batchConfigs.length
        });
      }
      
      // Process all batches concurrently
      const batchOperations = batchConfigs.map(config => {
        console.log(`Processing batch #${config.batchNumber} with ${config.urls.length} URLs`);
        
        return {
          config,
          promise: request(baseUrl)
            .post('/api/process-batch')
            .send({
              urls: config.urls,
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
            })
        };
      });
      
      // Wait for all batch requests to complete
      const batchResults = await Promise.all(batchOperations.map(op => op.promise));
      totalBatches += batchConfigs.length;
      
      // Process all batch responses
      for (let i = 0; i < batchResults.length; i++) {
        const response = batchResults[i];
        const batchConfig = batchOperations[i].config;
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('results');
        
        // Add processed URLs to our collection
        const processedUrls = response.body.results.processedUrls || [];
        processedPageData.push(...processedUrls);
        
        // Log the URLs processed in this batch
        console.log(`Processed ${processedUrls.length} URLs in batch #${batchConfig.batchNumber}`);
        
        // Add new discovered URLs to our pending queue
        const newUrls = response.body.results.newUrls || [];
        for (const url of newUrls) {
          if (!discoveredUrls.has(url)) {
            discoveredUrls.add(url);
            
            // Calculate URL depth based on parent URLs in this batch
            let depth = MAX_DEPTH;
            for (const parentUrl of batchConfig.urls) {
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
        
        console.log(`Discovered ${newUrls.length} new URLs from batch #${batchConfig.batchNumber}`);
      }
      
      // Check if we have enough data to generate a sitemap
      if (processedPageData.length >= 20) {
        console.log(`Collected enough URLs (${processedPageData.length}) to generate a sample sitemap`);
        break;
      }
      
      // Brief pause between batch rounds to be nice to the target server
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const crawlTime = (Date.now() - startTime) / 1000;
    console.log(`
      Crawl completed:
      - Processed: ${processedPageData.length} URLs
      - Discovered: ${discoveredUrls.size} URLs
      - Total batches: ${totalBatches}
      - Total time: ${crawlTime.toFixed(2)}s
      - URLs/second: ${(processedPageData.length / crawlTime).toFixed(2)}
    `);
    
    // We should have collected some data
    expect(processedPageData.length).toBeGreaterThan(0);
    
    // 5. Generate a sitemap from the collected data
    console.log(`Generating sitemap from ${processedPageData.length} URLs`);
    
    const sitemapResponse = await request(baseUrl)
      .post('/api/generate-sitemap')
      .send({
        urls: processedPageData,
        options: {
          hostname: testSiteUrl,
          pretty: true,
          includeImages: true
        }
      });
    
    // Check sitemap response
    expect(sitemapResponse.status).toBe(200);
    console.log(`Sitemap generation status: ${sitemapResponse.status}`);
    
    // Basic sitemap validation
    const sitemap = sitemapResponse.text;
    expect(sitemap).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(sitemap).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    expect(sitemap).toContain('<url>');
    expect(sitemap).toContain('<loc>');
    
    // Check for the domain in the sitemap
    expect(sitemap).toContain('southfloridatravels.com');
    
    // Count the number of URLs in the sitemap
    const urlCount = (sitemap.match(/<url>/g) || []).length;
    console.log(`Sitemap contains ${urlCount} URLs`);
    
    // Should have at least a few URLs
    expect(urlCount).toBeGreaterThan(1);
    
    // Check for images if we're including them
    if (sitemap.includes('<image:image>')) {
      console.log('Sitemap includes images');
      expect(sitemap).toContain('<image:loc>');
    }
    
    // Save a portion of the sitemap for verification
    const sitemapPreview = sitemap.slice(0, 500) + '... (truncated)';
    console.log(`Sitemap preview: ${sitemapPreview}`);
    
    console.log('Sitemap generation test completed successfully');
  });
}); 