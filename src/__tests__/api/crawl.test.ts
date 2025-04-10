import request from 'supertest';
import { getBaseUrl } from '../setup';

// We don't need these mocks anymore
// jest.mock('../../utils/crawler', () => {...});

describe('Crawler API E2E Tests', () => {
  let sessionId: string;
  
  // Set a timeout for the entire test suite
  jest.setTimeout(30000);
  
  test('POST request with url starts a new crawl and returns session id', async () => {
    const baseUrl = getBaseUrl();
    
    const response = await request(baseUrl)
      .post('/api/crawl')
      .send({
        url: 'https://example.com',
        options: {
          maxDepth: 1, // Keep it small for tests
          maxUrls: 5,  // Keep it small for tests
          crawlRate: 100, // Make it faster for tests
        },
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('sessionId');
    expect(typeof response.body.sessionId).toBe('string');
    
    // Save the sessionId for later tests
    sessionId = response.body.sessionId;
    
    // Log success for debugging
    console.log(`Created crawler session: ${sessionId}`);
  });

  test('GET request with sessionId returns progress', async () => {
    // Skip if we don't have a sessionId from previous test
    if (!sessionId) {
      console.log('Skipping test: No sessionId available');
      return;
    }
    
    const baseUrl = getBaseUrl();
    
    // Wait a bit to make sure crawling has started
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const response = await request(baseUrl)
      .get(`/api/crawl?sessionId=${sessionId}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('progress');
    expect(response.body.progress).toHaveProperty('urlsScanned');
    expect(response.body.progress).toHaveProperty('totalUrls');
    
    // Log progress for debugging
    console.log(`Crawler progress: ${response.body.progress.urlsScanned}/${response.body.progress.totalUrls}`);
  });

  test('POST to generate-sitemap returns a valid sitemap XML', async () => {
    // Skip if we don't have a sessionId from previous test
    if (!sessionId) {
      console.log('Skipping test: No sessionId available');
      return;
    }
    
    const baseUrl = getBaseUrl();
    
    // Wait for more crawling to happen
    console.log('Waiting for crawling to progress...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Now get sitemap
    const sitemapResponse = await request(baseUrl)
      .post(`/api/generate-sitemap`)
      .send({
        sessionId,
        options: {
          includeImages: true
        }
      });
    
    expect(sitemapResponse.status).toBe(200);
    expect(sitemapResponse.headers['content-type']).toContain('application/xml');
    expect(sitemapResponse.text).toContain('<?xml');
    expect(sitemapResponse.text).toContain('<urlset');
    
    // Log sitemap for debugging
    console.log(`Sitemap size: ${sitemapResponse.text.length} bytes`);
  });

  test('DELETE request with sessionId cancels crawl', async () => {
    // Skip if we don't have a sessionId from previous test
    if (!sessionId) {
      console.log('Skipping test: No sessionId available');
      return;
    }
    
    const baseUrl = getBaseUrl();
    
    const response = await request(baseUrl)
      .delete(`/api/crawl?sessionId=${sessionId}`);
    
    expect(response.status).toBe(200);
    
    // Log success for debugging
    console.log('Crawler canceled successfully');
  });
  
  test('Returns 400 if POST request is missing url', async () => {
    const baseUrl = getBaseUrl();
    
    const response = await request(baseUrl)
      .post('/api/crawl')
      .send({
        // Missing url
        options: {
          maxDepth: 3,
        },
      });
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  test('Returns 404 if GET request has invalid sessionId', async () => {
    const baseUrl = getBaseUrl();
    
    const response = await request(baseUrl)
      .get('/api/crawl?sessionId=invalid-session-id');
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
  });
}); 