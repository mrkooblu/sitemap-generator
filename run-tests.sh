#!/bin/bash

# Port for testing
TEST_PORT=3001

# Clean up any existing processes on the test port
echo "Cleaning up any processes on port $TEST_PORT..."
lsof -ti:$TEST_PORT | xargs kill -9 2>/dev/null || echo "No processes found on port $TEST_PORT"

# Start the Next.js server in the background
echo "Starting Next.js server on port $TEST_PORT..."
npm run dev -- -p $TEST_PORT &
SERVER_PID=$!

# Wait for server to be ready
echo "Waiting for server to be ready..."
attempt=1
max_attempts=30
ready=false

while [ $attempt -le $max_attempts ] && [ "$ready" == "false" ]; do
  echo "Attempt $attempt/$max_attempts..."
  if curl -s http://localhost:$TEST_PORT/api/test > /dev/null; then
    echo "Server is ready!"
    ready=true
  else
    sleep 1
    attempt=$((attempt+1))
  fi
done

if [ "$ready" == "false" ]; then
  echo "Server failed to start within the timeout period"
  kill -9 $SERVER_PID 2>/dev/null
  exit 1
fi

# Run the tests
echo "Running tests..."
NODE_OPTIONS='--experimental-vm-modules' jest $@ --runInBand --forceExit

# Capture the exit code
TEST_EXIT_CODE=$?

# Clean up
echo "Tests completed with exit code $TEST_EXIT_CODE, cleaning up..."
kill -9 $SERVER_PID 2>/dev/null
sleep 1
lsof -ti:$TEST_PORT | xargs kill -9 2>/dev/null || echo "No processes found on port $TEST_PORT"

# Exit with the same code as the tests
exit $TEST_EXIT_CODE 