# Sitemap Generator

A powerful web-based tool to generate XML sitemaps for websites to improve SEO and search engine indexing.

![Sitemap Generator Screenshot](./public/images/sitemap-generator.png)

## Features

- 🚀 Fast web crawler with configurable speed (1 URL every 100ms by default)
- 📊 Interactive progress tracking with real-time updates
- 🔄 Customizable crawl options (depth, page limits, images)
- 🤖 Respects robots.txt with reasonable timeouts (5 seconds maximum)
- 📱 Responsive UI that works on desktop and mobile
- 🔍 SEO-friendly sitemap generation with proper XML formatting
- 📂 Download generated sitemaps for submission to search engines
- ✨ Pretty XML formatting option for readable sitemaps
- 🖼️ Support for image sitemaps to help index your visual content
- 🔍 Built-in educational content about sitemaps and SEO best practices
- ❓ Comprehensive FAQ section with sitemap implementation guidance

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/sitemap-generator.git
cd sitemap-generator
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Enter the URL of the website you want to crawl
2. Configure crawl options (optional):
   - **Max Depth**: How deep the crawler should go (default: 3)
   - **Max Pages**: Maximum number of pages to crawl (default: 2000)
   - **Include Images**: Add image tags to the sitemap (default: disabled)
   - **Respect robots.txt**: Follow robots.txt directives (default: enabled)
   - **Pretty XML**: Format XML output for human readability (default: enabled)

3. Click "Generate Sitemap" and wait for the crawl to complete
4. Review and download your sitemap

## Production Deployment

Build the production version:

```bash
npm run build
# or
yarn build
```

Start the production server:

```bash
npm start
# or
yarn start
```

## Environment Variables

Create a `.env.local` file in the root directory:

```
# Server configuration
PORT=3000
```

## Advanced Configuration

For advanced users, you can customize the crawler's behavior by modifying the following settings in `src/utils/crawler.ts`:

- `crawlRate`: Time between requests in milliseconds (default: 100)
- `requestTimeout`: Timeout for HTTP requests in milliseconds (default: 10000)
- `retryCount`: Number of retry attempts for failed requests (default: 2)

## Scaling Limitations Analysis

When hundreds or thousands of users are accessing this tool simultaneously, several scaling limitations would emerge:

### 1. Server Resources and Concurrency Limitations

The application uses serverless functions (Next.js API routes) to process batches of URLs. When many users are crawling websites simultaneously:

- **CPU and Memory Constraints**: Each serverless function instance has limited CPU and memory. Processing multiple large websites would quickly exhaust these resources.

- **Concurrent Connection Limits**: The application makes multiple HTTP requests to crawl websites. Cloud platforms and hosting providers typically impose limits on the number of concurrent connections.

- **Function Execution Timeouts**: Serverless functions usually have timeouts (often 10-60 seconds). Complex or large websites might exceed these timeouts, causing crawls to fail.

### 2. Rate Limiting and IP Blocking

- **IP-Based Rate Limiting**: When many crawl requests originate from the same server IP addresses, target websites might rate-limit or block these IPs as potential DDoS attacks.

- **Bot Detection**: High volume of requests could trigger bot detection systems on target websites, resulting in CAPTCHAs or blocks that the crawler can't handle.

### 3. Storage and Data Management Issues

- **localStorage Limitations**: The application uses browser localStorage to store crawl state, which has size limits (typically 5-10MB). This would not be sufficient for large websites with thousands of pages.

- **Memory Leaks**: The crawler keeps track of visited URLs using Sets and Objects. With many concurrent users, memory consumption could grow rapidly if these aren't properly managed.

- **API Request Size Limits**: The API route configuration shows a body size limit of 10MB, which could be exceeded with very large sitemaps.

### 4. Database and Persistence Challenges

- **No Dedicated Database**: The application doesn't use a persistent database for storing crawl results, relying instead on in-memory storage and localStorage. This approach doesn't scale well for concurrent users.

- **Session Management**: If the server restarts or a function instance is recycled, crawl progress could be lost since there's no robust session persistence mechanism.

### 5. Request Queue Management

- **Fixed Batch Size**: The application uses fixed batch sizes (`BATCH_SIZE = 5` and `CONCURRENT_BATCHES = 3`) for processing URLs, which doesn't adapt to server load or available resources.

- **No Global Queue**: There's no global request queue with prioritization, meaning that all user requests are treated equally regardless of their resource requirements.

### 6. Network Bandwidth Constraints

- **Outbound Bandwidth**: Crawling websites requires significant outbound bandwidth. Multiple concurrent crawls could saturate the available network capacity.

- **Inbound Bandwidth**: Receiving webpage content from crawled sites and returning results to users also consumes inbound bandwidth, which could become a bottleneck.

### 7. Third-party Service Dependencies

- **Axios for HTTP Requests**: The application uses Axios for making HTTP requests. While efficient, Axios doesn't include built-in request throttling or advanced retry mechanisms needed for high-scale operations.

- **Cheerio for HTML Parsing**: Cheerio is used for HTML parsing, which loads the entire HTML into memory. For very large pages, this could cause memory issues.

## Recommendations for Scaling

To support hundreds or thousands of simultaneous users, the application would need several enhancements:

1. **Implement a distributed crawler system** with worker nodes that can handle the load across multiple servers.

2. **Add a proper database** (like MongoDB or PostgreSQL) for storing crawl states and results persistently.

3. **Implement a global request queue** with rate limiting and prioritization, possibly using Redis or RabbitMQ.

4. **Add adaptive throttling** to respect target websites' resources and avoid triggering anti-scraping measures.

5. **Implement proper user authentication and quotas** to prevent abuse and ensure fair resource allocation.

6. **Use a CDN** for serving the frontend and API proxying to reduce the load on the origin server.

7. **Implement caching** at various levels to avoid redundant processing.

8. **Add robust error handling and recovery mechanisms** to handle timeouts and failures gracefully.

9. **Deploy the application across multiple regions** to distribute the load geographically.

10. **Use a proper monitoring system** to detect performance issues and bottlenecks in real-time.

The current implementation is suitable for low to moderate usage but would need significant architectural changes to handle thousands of concurrent users effectively.

## Sitemap Implementation

After generating your sitemap:

1. Upload the XML file to your website's root directory
2. Add a reference in your robots.txt file:
   ```
   Sitemap: https://yourwebsite.com/sitemap.xml
   ```
3. Submit your sitemap to search engines through their webmaster tools

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Styled Components](https://styled-components.com/)
- [Axios](https://axios-http.com/)
- [Cheerio](https://cheerio.js.org/)
- [Sitemap.js](https://www.npmjs.com/package/sitemap) 