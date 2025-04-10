// @ts-check

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  // This is already the default in Next.js 13+, but being explicit doesn't hurt
  reactStrictMode: true,
  
  // Set the source directory and configure module support
  experimental: {
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
        // Apply cache control headers to HTML pages
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        // Apply cache control headers to static assets
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
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