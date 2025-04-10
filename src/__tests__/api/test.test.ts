import request from 'supertest';
import { getBaseUrl } from '../setup';

describe('Test API Endpoint', () => {
  test('Returns 200 OK', async () => {
    const baseUrl = getBaseUrl();
    
    const response = await request(baseUrl)
      .get('/api/test');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'API is running');
    
    console.log('Test API is working!');
  });
}); 