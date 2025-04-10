import { setupServer, teardownServer } from './setup';

// Set longer timeout for API tests - give server plenty of time to start
jest.setTimeout(60000);

// Server reference for teardown
let serverRef: any;

beforeAll(async () => {
  try {
    // Start the Next.js dev server
    const setup = await setupServer();
    serverRef = setup.server;
    console.log('Test server setup completed successfully');
  } catch (err) {
    console.error('Failed to set up server for tests:', err);
  }
});

afterAll(async () => {
  // Tear down the server
  try {
    await teardownServer();
    console.log('Test server teardown completed');
  } catch (err) {
    console.error('Error during server teardown:', err);
  }
  
  // No longer needed due to the Jest --forceExit flag
  // Jest will forcibly exit after tests complete
});

// Create dummy test to prevent "Your test suite must contain at least one test" error
test('Setup test', () => {
  expect(true).toBe(true);
}); 