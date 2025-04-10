// @ts-check

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  // This is already the default in Next.js 13+, but being explicit doesn't hurt
  reactStrictMode: true,
  
  // Set the source directory and configure module support
  experimental: {
    esmExternals: 'loose',
    externalDir: true,
  },
  
  // Support for packages that need transpilation
  transpilePackages: ['jsdom', 'node-fetch'],
  
  // Use the src directory for the app
  distDir: '.next',
  
  // Output standalone build
  output: 'standalone',
  
  // Configure headers for CORS if needed
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  }
};

module.exports = nextConfig; 