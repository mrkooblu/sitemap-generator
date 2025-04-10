import { spawn, ChildProcess } from 'child_process';
import axios from 'axios';

let serverProcess: ChildProcess | null = null;
const SERVER_PORT = 3001;

export async function setupServer() {
  try {
    // Ensure any existing process on port 3001 is killed
    await cleanupExistingServer();
    
    // Start the Next.js dev server on port 3001
    serverProcess = spawn('npm', ['run', 'dev', '--', '-p', `${SERVER_PORT}`], {
      stdio: 'inherit',
      shell: true
    });
    
    console.log(`Next.js server started on port ${SERVER_PORT}`);
    
    // Give the server some time to initialize
    const isReady = await waitForServer(`http://localhost:${SERVER_PORT}`);
    if (!isReady) {
      throw new Error('Server failed to start within the timeout period');
    }
    
    return { server: serverProcess };
  } catch (error) {
    console.error('Error setting up test server:', error);
    throw error;
  }
}

export async function teardownServer() {
  if (serverProcess) {
    console.log('Stopping Next.js server...');
    
    // Get the process ID
    const pid = serverProcess.pid;
    
    if (!pid) {
      console.error('No PID found for server process');
      return;
    }
    
    try {
      // On macOS/Linux, kill the process group to ensure all child processes are terminated
      if (process.platform !== 'win32') {
        // Kill process and all children with SIGKILL
        spawn('pkill', ['-P', `${pid}`], { shell: true });
        
        // Also try to kill anything on our test port
        spawn('kill', [`\`lsof -t -i:${SERVER_PORT}\``], { shell: true });
      } else {
        // On Windows
        spawn('taskkill', ['/pid', `${pid}`, '/T', '/F'], { shell: true });
      }
      
      // Also kill our direct reference
      serverProcess.kill('SIGKILL');
      
      // Wait to ensure processes are terminated
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify port is free
      try {
        await axios.get(`http://localhost:${SERVER_PORT}/api/test`, { timeout: 500 });
        console.warn(`Warning: Server may still be running on port ${SERVER_PORT}`);
      } catch (error) {
        console.log('Confirmed server is no longer responding');
      }
    } catch (error) {
      console.error('Error killing server process:', error);
    }
    
    serverProcess = null;
    console.log('Next.js server stop command completed');
  }
}

// Helper function to wait for the server to become available
async function waitForServer(url: string, maxRetries = 30, interval = 1000): Promise<boolean> {
  console.log(`Waiting for server to be ready at ${url}...`);
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.get(`${url}/api/test`);
      if (response.status === 200) {
        console.log(`Server is ready after ${i + 1} attempts!`);
        return true;
      }
    } catch (error) {
      console.log(`Waiting for server to start (attempt ${i + 1}/${maxRetries})...`);
    }
    
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  console.error(`Server did not start after ${maxRetries} attempts`);
  return false;
}

// Get the base URL for tests
export function getBaseUrl() {
  return `http://localhost:${SERVER_PORT}`;
}

// Helper to ensure the port is clear before starting
async function cleanupExistingServer() {
  try {
    console.log(`Checking if port ${SERVER_PORT} is in use...`);
    
    // Try to make a request to check if server is running
    try {
      await axios.get(`http://localhost:${SERVER_PORT}/api/test`, { timeout: 1000 });
      console.log(`Server already running on port ${SERVER_PORT}, attempting to kill...`);
    } catch (err: any) {
      // If we get a connection error, port is likely free
      if (err.code === 'ECONNREFUSED') {
        console.log(`Port ${SERVER_PORT} is free.`);
        return;
      }
    }
    
    // For macOS/Linux
    if (process.platform !== 'win32') {
      console.log(`Killing processes on port ${SERVER_PORT}...`);
      
      // Kill anything using the port
      spawn('kill', [`\`lsof -t -i:${SERVER_PORT}\``], { shell: true });
      
      // More aggressive variant if needed
      spawn('lsof', ['-t', `-i:${SERVER_PORT}`, '|', 'xargs', 'kill', '-9'], { shell: true });
    } else {
      // For Windows
      spawn('FOR', ['/F', '"usebackq tokens=5"', '%p', 'in', `(\`netstat -ano | findstr ":${SERVER_PORT}"\`)`, 'do', 'taskkill', '/F', '/PID', '%p'], { shell: true });
    }
    
    // Wait for port to be released
    console.log('Waiting for port to be released...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verify port is now free
    try {
      await axios.get(`http://localhost:${SERVER_PORT}/api/test`, { timeout: 500 });
      console.warn(`Warning: Port ${SERVER_PORT} may still be in use after cleanup attempt.`);
    } catch (err: any) {
      if (err.code === 'ECONNREFUSED') {
        console.log(`Confirmed port ${SERVER_PORT} is now free.`);
      }
    }
  } catch (error) {
    console.error('Error cleaning up existing server:', error);
  }
} 