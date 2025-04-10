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