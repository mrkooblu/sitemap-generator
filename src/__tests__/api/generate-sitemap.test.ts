import request from 'supertest';
import { getBaseUrl } from '../setup';

describe('/api/generate-sitemap E2E Tests', () => {
  // Store the sessionId for tests
  let sessionId: string;

  // Setup a crawler session before testing sitemap generation
  beforeAll(async () => {
    const baseUrl = getBaseUrl();
    
    // Start a crawl
    const response = await request(baseUrl)
      .post('/api/crawl')
      .send({
        url: 'https://example.com',
        options: {
          maxDepth: 1, // Keep it small for tests
          maxUrls: 10,  // Keep it small for tests
        },
      });
    
    sessionId = response.body.sessionId;
    
    // Wait a bit for the crawler to make some progress
    // In a real test, you might want to poll until crawling is complete
    await new Promise(resolve => setTimeout(resolve, 5000));
  });
  
  // Clean up after tests
  afterAll(async () => {
    if (sessionId) {
      const baseUrl = getBaseUrl();
      
      // Cancel the crawl
      await request(baseUrl)
        .delete(`/api/crawl?sessionId=${sessionId}`);
    }
  });

  test('POST request with valid sessionId generates sitemap XML', async () => {
    // Skip if we don't have a sessionId from setup
    if (!sessionId) {
      console.log('Skipping test: No sessionId available');
      return;
    }
    
    const baseUrl = getBaseUrl();
    
    const response = await request(baseUrl)
      .post('/api/generate-sitemap')
      .send({
        sessionId,
        options: {
          includeImages: true,
          hostname: 'https://example.com'
        },
      });
    
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/xml');
    expect(response.text).toContain('urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    
    // Basic structure checks
    expect(response.text).toContain('<url>');
    expect(response.text).toContain('<loc>');
    
    // If the crawler has had time to find some urls, we should have them in the sitemap
    if (response.text.includes('<url>')) {
      expect(response.text).toContain('example.com');
    }
  });

  test('Returns 400 if POST request is missing sessionId', async () => {
    const baseUrl = getBaseUrl();
    
    const response = await request(baseUrl)
      .post('/api/generate-sitemap')
      .send({
        // Missing sessionId
        options: {
          includeImages: true,
          hostname: 'https://example.com'
        },
      });
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  test('Returns 404 if sessionId is invalid', async () => {
    const baseUrl = getBaseUrl();
    
    const response = await request(baseUrl)
      .post('/api/generate-sitemap')
      .send({
        sessionId: 'invalid-session-id',
        options: {
          includeImages: true,
          hostname: 'https://example.com'
        },
      });
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
  });
}); 