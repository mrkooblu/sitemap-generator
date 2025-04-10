module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  setupFilesAfterEnv: [],
  testTimeout: 60000, // Increase timeout for E2E tests to 60 seconds
  forceExit: true, // Force exit after all tests are done
  detectOpenHandles: true, // Help identify why Jest doesn't exit
}; 