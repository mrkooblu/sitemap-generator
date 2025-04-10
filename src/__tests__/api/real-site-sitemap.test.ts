import request from 'supertest';
import { getBaseUrl } from '../setup';

/**
 * This test evaluates real-world sitemap generation for a production site
 * It tests the complete flow from crawling to sitemap generation
 */
describe('Production Site Sitemap Generation Test', () => {
  // Set a long timeout for the test to have time to crawl
  jest.setTimeout(300000); // 5 minutes
  
  // Track the session ID for potential cleanup
  let sessionId: string;
  
  // Test site URL - a real Florida travel site
  const testSiteUrl = 'https://southfloridatravels.com';
  
  test('Should crawl a real site and generate a sitemap', async () => {
    const baseUrl = getBaseUrl();
    
    console.log(`Starting crawl of ${testSiteUrl} for sitemap generation`);
    
    // 1. Start the crawl
    const startResponse = await request(baseUrl)
      .post('/api/crawl')
      .send({
        url: testSiteUrl,
        options: {
          maxDepth: 2, // Limit depth for test purposes
          maxPages: 40, // Limit pages for test purposes
          crawlRate: 250, // Slightly faster than default for testing
          includeImages: true,
          respectRobotsTxt: true
        }
      });
    
    expect(startResponse.status).toBe(200);
    expect(startResponse.body).toHaveProperty('sessionId');
    
    sessionId = startResponse.body.sessionId;
    console.log(`Started crawl with session ID: ${sessionId}`);
    
    // 2. Wait for crawl to make sufficient progress or complete
    let isComplete = false;
    let hasEnoughData = false;
    const startTime = Date.now();
    const maxTime = 240000; // 4 minutes
    
    while (!isComplete && !hasEnoughData && (Date.now() - startTime) < maxTime) {
      // Wait between progress checks
      await new Promise(resolve => setTimeout(resolve, 10000)); // 10 seconds
      
      // Get progress
      const progressResponse = await request(baseUrl)
        .get(`/api/crawl?sessionId=${sessionId}`);
      
      expect(progressResponse.status).toBe(200);
      
      if (progressResponse.body.isComplete) {
        isComplete = true;
        console.log('Crawl completed');
      } else {
        const progress = progressResponse.body.progress;
        console.log(`Progress: ${progress.urlsScanned}/${progress.totalUrls} URLs`);
        console.log(`Current URL: ${progress.currentUrl}`);
        console.log(`Time elapsed: ${progress.timeElapsed}`);
        
        // We can generate a sitemap if we have at least 20 URLs crawled
        if (progress.urlsScanned >= 20) {
          hasEnoughData = true;
          console.log('Crawled enough pages to generate a sample sitemap');
          
          // Wait a bit longer to ensure URLs are fully processed
          await new Promise(resolve => setTimeout(resolve, 5000));
          break;
        }
      }
    }
    
    // We should have made some progress
    expect(hasEnoughData || isComplete).toBe(true);
    
    // If we didn't complete but have enough data, wait for processing to finish
    if (hasEnoughData && !isComplete) {
      // Give it a bit more time for the crawler to update its internal state
      console.log('Waiting for crawler to complete processing...');
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
    
    // 3. Generate a sitemap
    console.log('Generating sitemap from crawl data');
    
    const sitemapResponse = await request(baseUrl)
      .post('/api/generate-sitemap')
      .send({
        sessionId,
        options: {
          hostname: testSiteUrl, // Use the site URL as hostname
          includeImages: true
        }
      });
    
    // Log response status and reason if not 200
    console.log(`Sitemap generation response status: ${sitemapResponse.status}`);
    if (sitemapResponse.status !== 200) {
      console.log('Response body:', sitemapResponse.body);
    }
    
    // Check that we got a valid sitemap
    expect(sitemapResponse.status).toBe(200);
    expect(sitemapResponse.headers['content-type']).toContain('application/xml');
    
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
    
    console.log('Sitemap generation test completed successfully');
  });
  
  // Clean up after test
  afterAll(async () => {
    if (sessionId) {
      const baseUrl = getBaseUrl();
      
      // Cancel the crawl
      try {
        console.log(`Cleaning up by canceling crawl session: ${sessionId}`);
        await request(baseUrl)
          .delete(`/api/crawl?sessionId=${sessionId}`);
      } catch (error) {
        console.error('Error cleaning up test crawl:', error);
      }
    }
  });
}); 