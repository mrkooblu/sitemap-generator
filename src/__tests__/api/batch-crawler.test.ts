import request from 'supertest';
import { getBaseUrl } from '../setup';

/**
 * These tests verify the batch-based crawling approach 
 * using actual API calls to real URLs
 */
describe('Batch-based Crawler Tests', () => {
  // Set a reasonable timeout for real site testing
  jest.setTimeout(30000);
  
  // Test URL - a simple, fast-loading site
  const testUrl = 'https://example.com';
  
  test('Should process a batch of URLs correctly', async () => {
    const baseUrl = getBaseUrl();
    
    // Test the batch processing endpoint with a real URL
    const response = await request(baseUrl)
      .post('/api/process-batch')
      .send({
        urls: [testUrl],
        baseUrl: testUrl,
        options: {
          maxDepth: 2,
          includeImages: false,
          excludeNoindex: true,
          respectRobotsTxt: true,
          changeFrequency: 'weekly',
          priority: 0.7,
          requestTimeout: 5000
        }
      });
    
    // Check response
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('results');
    expect(response.body.results).toHaveProperty('processedUrls');
    expect(response.body.results).toHaveProperty('newUrls');
    
    // Verify processed URL is correct
    expect(response.body.results.processedUrls).toHaveLength(1);
    expect(response.body.results.processedUrls[0].url).toBe(testUrl);
    
    // Since this is a real site, we just check that it processed something
    console.log(`Found ${response.body.results.processedUrls.length} processed URLs`);
    console.log(`Found ${response.body.results.newUrls.length} new URLs`);
  });
  
  test('Should process multiple URLs in a batch', async () => {
    const baseUrl = getBaseUrl();
    
    // Use multiple real URLs that won't change often
    const urls = [
      'https://example.com',
      'https://example.org',
      'https://example.net'
    ];
    
    // Test the batch processing endpoint with multiple URLs
    const response = await request(baseUrl)
      .post('/api/process-batch')
      .send({
        urls,
        baseUrl: urls[0],
        options: {
          maxDepth: 1,
          includeImages: false,
          excludeNoindex: true,
          respectRobotsTxt: true,
          changeFrequency: 'weekly',
          priority: 0.7,
          requestTimeout: 5000
        }
      });
    
    // Check response
    expect(response.status).toBe(200);
    expect(response.body.results.processedUrls).toHaveLength(3);
    
    // Log results for verification
    console.log('Processed URLs:', response.body.results.processedUrls.map((p: any) => p.url));
    console.log('Found new URLs:', response.body.results.newUrls);
  });
  
  test('Should generate sitemap from crawled URLs', async () => {
    const baseUrl = getBaseUrl();
    
    // Create a list of test URLs
    const testUrls = [
      {
        url: 'https://example.com',
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.7
      },
      {
        url: 'https://example.org',
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.6
      },
      {
        url: 'https://example.net',
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.6
      }
    ];
    
    // Test sitemap generation
    const response = await request(baseUrl)
      .post('/api/generate-sitemap')
      .send({
        urls: testUrls,
        options: {
          hostname: 'https://example.com',
          pretty: true
        }
      });
    
    // Check response
    expect(response.status).toBe(200);
    expect(response.text).toContain('<?xml');
    expect(response.text).toContain('<urlset');
    // The actual URLs might have trailing slashes
    expect(response.text).toContain(`<loc>https://example.com/</loc>`);
    expect(response.text).toContain(`<loc>https://example.org/</loc>`);
    expect(response.text).toContain(`<loc>https://example.net/</loc>`);
    
    // Log a snippet of the sitemap
    console.log('Sitemap snippet:', response.text.substring(0, 500));
  });
  
  test('Should handle empty URL list for sitemap generation', async () => {
    const baseUrl = getBaseUrl();
    
    // Test sitemap generation with empty URL list
    const response = await request(baseUrl)
      .post('/api/generate-sitemap')
      .send({
        urls: [],
        options: {
          hostname: 'https://example.com'
        }
      });
    
    // Check error response
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toContain('No URLs provided');
  });
}); 