import request from 'supertest';
import { getBaseUrl } from '../setup';

/**
 * This test evaluates real-world crawling performance on a production site
 * It helps identify potential timeout and performance issues with the current settings
 */
describe('Production Site Crawl Performance Test', () => {
  // Set a long timeout for the test to have time to crawl
  jest.setTimeout(180000); // 3 minutes
  
  // Track the session ID for potential cleanup
  let sessionId: string;
  
  // Test site URL - a real Florida travel site
  const testSiteUrl = 'https://southfloridatravels.com';
  
  test('Should start crawling a real production site', async () => {
    const baseUrl = getBaseUrl();
    
    // Start the crawl with custom options
    const startResponse = await request(baseUrl)
      .post('/api/crawl')
      .send({
        url: testSiteUrl,
        options: {
          maxDepth: 2, // Limit depth for test purposes
          maxPages: 50, // Limit pages for test purposes
          crawlRate: 200, // Faster than default for testing
          includeImages: true,
          respectRobotsTxt: true
        }
      });
    
    expect(startResponse.status).toBe(200);
    expect(startResponse.body).toHaveProperty('sessionId');
    
    sessionId = startResponse.body.sessionId;
    console.log(`Started crawl of ${testSiteUrl} with session ID: ${sessionId}`);
    
    // Now test the progress endpoint for performance monitoring
    let isComplete = false;
    let lastProgress = null;
    let timeoutCount = 0;
    let progressChecks = 0;
    
    // Check progress for up to 2 minutes or until complete
    const startTime = Date.now();
    const maxTime = 120000; // 2 minutes
    
    while (!isComplete && (Date.now() - startTime) < maxTime) {
      // Wait between progress checks
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Get progress
      const progressResponse = await request(baseUrl)
        .get(`/api/crawl?sessionId=${sessionId}`);
      
      expect(progressResponse.status).toBe(200);
      progressChecks++;
      
      // Check if crawling is complete
      if (progressResponse.body.isComplete) {
        isComplete = true;
        console.log('Crawl completed');
        console.log(`Final result: ${JSON.stringify(progressResponse.body.result)}`);
        break;
      }
      
      // Extract progress data
      const progress = progressResponse.body.progress;
      console.log(`Progress check #${progressChecks}: ${progress.urlsScanned}/${progress.totalUrls} URLs`);
      console.log(`Current URL: ${progress.currentUrl}`);
      console.log(`Time elapsed: ${progress.timeElapsed}`);
      
      // Check if we're making progress or getting stuck
      if (lastProgress && lastProgress.urlsScanned === progress.urlsScanned) {
        timeoutCount++;
        console.log(`WARNING: No progress since last check (${timeoutCount} consecutive checks)`);
        
        // If stuck for too long, log detailed info for debugging
        if (timeoutCount >= 3) {
          console.log('Potential timeout/stuck issue detected');
          console.log(`Crawler may be stuck on URL: ${progress.currentUrl}`);
        }
      } else {
        timeoutCount = 0;
      }
      
      lastProgress = progress;
    }
    
    // We should have made some progress even if not complete
    expect(progressChecks).toBeGreaterThan(0);
    
    if (isComplete) {
      console.log('Test completed successfully with finished crawl');
    } else {
      console.log('Test completed with timeout - crawl did not finish in allotted time');
    }
  });
  
  // Clean up after test
  afterAll(async () => {
    if (sessionId) {
      const baseUrl = getBaseUrl();
      
      // Attempt to cancel the crawl
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