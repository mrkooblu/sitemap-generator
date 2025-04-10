# Sitemap Generator Application - Development Instructions

## Overview

Create a web application that generates XML sitemaps for websites by crawling their pages. The application should have a clean, user-friendly interface that guides users through the sitemap generation process and provides educational information about sitemaps and their importance for SEO.

## Functional Requirements

### Core Functionality

1. **URL Input and Validation**
   - Accept a website URL input from the user
   - Validate URL format before proceeding
   - Support standard URL formats (http, https)

2. **Web Crawling Engine**
   - Create a crawling system that recursively visits pages on the target website
   - Track pages visited, respecting robots.txt rules
   - Collect URL, last modified date, priority, and change frequency data
   - Implement rate limiting to avoid overwhelming the target server
   - Handle different content types appropriately

3. **Real-time Progress Tracking**
   - Display a progress screen showing:
     - Number of URLs scanned
     - Time elapsed
     - Estimated time remaining
     - Current page being crawled
     - Option to cancel the crawling process

4. **Sitemap Generation**
   - Create a properly formatted XML sitemap following the sitemap protocol
   - Include standard tags: `<url>`, `<loc>`, `<lastmod>`, `<changefreq>`, `<priority>`
   - Assign appropriate priority values based on page hierarchy
   - Allow downloading the generated sitemap

5. **Results Display**
   - Show a summary of the generated sitemap including:
     - Starting URL
     - Creation date and time
     - Number of pages indexed
     - Download button for the XML file

### Additional Features

1. **Site Audit Tool**
   - Implement a basic audit to check for common SEO issues
   - Provide actionable feedback on discovered issues

2. **Educational Content**
   - Include informational sections explaining:
     - What sitemaps are
     - Types of sitemaps (XML vs HTML)
     - Benefits for SEO
     - How to add sitemaps to websites
     - How to submit sitemaps to search engines
     - Recommended update frequency

## UI/UX Requirements

### Main Interface

1. **Homepage**
   - Clean, minimal design with a prominent URL input field
   - Clear "Generate Sitemap" button with contrasting color
   - Brief explanation of the service

2. **Progress Screen**
   - Visual progress indicator
   - Real-time statistics (URLs scanned, time passed, time remaining)
   - Display of current URL being crawled
   - Prominent "Cancel" button

3. **Results Screen**
   - Clear presentation of the sitemap details
   - Prominent download button
   - Option to generate a new sitemap

### Educational Sections

Structure the educational content in clearly separated sections with:
- Descriptive headings
- Concise explanations
- Step-by-step instructions where applicable
- Visual elements to enhance understanding

## Technical Specifications

### Frontend

1. **Technologies**
   - **React and Next.js**: Build the application using React for the UI components and Next.js as the framework
   - Implement responsive design for mobile compatibility
   - Use TypeScript for type safety (optional but recommended)

2. **UI Components**
   - Input form with validation
   - Progress tracking component
   - Modal/popup for displaying progress
   - Results display component
   - Educational content sections

3. **Deployment**
   - **Netlify**: Configure the application for deployment on Netlify
   - Set up appropriate build commands and environment variables
   - Configure Netlify functions if needed for server-side operations

### Backend (Next.js API Routes)

1. **Web Crawler**
   - Implement an efficient web crawler using Next.js API routes that:
     - Respects robots.txt directives
     - Handles redirects properly
     - Processes HTML to extract links
     - Detects and avoids crawling traps
     - Respects a reasonable crawl rate

2. **XML Generation**
   - Create well-formed XML following sitemap protocol
   - Include proper XML declaration and namespace
   - Format the XML for readability

3. **Performance Considerations**
   - Implement parallelized crawling with appropriate rate limiting
   - Use efficient data structures to track visited URLs
   - Implement request queuing to manage resource usage
   - Handle timeouts gracefully
   - Consider serverless function timeout limitations on Netlify

## Implementation Guidelines

### Next.js Project Setup

1. **Project Initialization**
   ```bash
   npx create-next-app sitemap-generator --typescript
   cd sitemap-generator
   ```

2. **Required Dependencies**
   ```bash
   npm install axios cheerio robots-parser sitemap xml2js
   ```

3. **Project Structure**
   ```
   /src
     /components
       - UrlInput.tsx
       - ProgressTracker.tsx
       - SitemapResult.tsx
       - EducationalContent.tsx
     /pages
       - index.tsx
       - api/
         - crawl.ts
         - generate-sitemap.ts
     /utils
       - crawler.ts
       - sitemap-generator.ts
       - url-validator.ts
   ```

### Reference Component and Styling Examples

This project includes reference component and styling examples in the `docs/example-code` directory. You should leverage these examples when building the application:

1. **Component Examples**
   - Review the components in `docs/example-code/src/components` directory including:
     - Form components for URL input and validation
     - Layout components for overall page structure
     - Results components for displaying sitemap data
     - Common UI elements that can be reused across the application

2. **Styling Examples**
   - Reference the styling approach in `docs/example-code/src/styles` including:
     - Theme configuration in `theme.js`
     - Global styles in `GlobalStyles.js` and `globals.css`
     - Follow the styling patterns demonstrated in these files for consistency

3. **Implementation Pattern**
   - While building components, check the similar components in the examples directory first
   - Maintain consistent naming conventions, component structure, and styling approaches
   - Adapt the reference components to fit the specific requirements of this application

### Crawler Implementation

1. **Initialization**
   - Start with the provided URL
   - Check site availability before beginning the crawl
   - Parse robots.txt if available

2. **Crawling Process**
   - Maintain a queue of URLs to visit
   - Track visited URLs to avoid duplicates
   - Extract links from HTML content
   - Filter links to stay within the same domain
   - Track depth to avoid infinite crawling

3. **Data Collection**
   - Store URL information (path, last modified date)
   - Calculate priority based on page depth and structure
   - Estimate change frequency based on content type

### Sitemap Generation

1. **XML Structure**
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>https://example.com/</loc>
       <lastmod>2025-03-28T18:21:00+00:00</lastmod>
       <changefreq>daily</changefreq>
       <priority>1.0</priority>
     </url>
     <!-- Additional URLs -->
   </urlset>
   ```

2. **Priority Calculation**
   - Homepage: 1.0
   - Top-level pages: 0.8
   - Second-level pages: 0.6
   - Lower-level pages: 0.4 or less

### Netlify Deployment Considerations

1. **Build Configuration**
   - Create a `netlify.toml` file:
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"

   [functions]
     directory = "netlify/functions"
   ```

2. **Serverless Functions**
   - Consider using Netlify Functions for the crawler to avoid client-side rate limiting
   - Be mindful of the 10-second timeout for Netlify's serverless functions
   - Implement appropriate error handling for timeouts

3. **Environment Variables**
   - Store any API keys or configurations as Netlify environment variables
   - Access these in your Next.js app via process.env

### User Interface Flow

1. **Initial State**
   - Display URL input field and Generate button
   - Show educational content below

2. **Progress State**
   - Display progress popup/modal
   - Update statistics in real-time
   - Allow cancellation

3. **Completion State**
   - Show sitemap summary
   - Provide download option
   - Option to start over

## Error Handling

1. **Input Validation**
   - Validate URL format before submission
   - Check website accessibility before starting crawler

2. **Crawling Errors**
   - Handle network timeouts gracefully
   - Manage crawling errors without crashing
   - Provide meaningful error messages

3. **User Feedback**
   - Inform user about any issues encountered
   - Suggest fixes where possible

## Testing Plan

1. **Unit Testing**
   - Test URL validation logic
   - Test XML generation
   - Test priority calculation
   - Use Jest for testing React components

2. **Integration Testing**
   - Test the crawler against various website structures
   - Test the entire generation process end-to-end

3. **User Testing**
   - Test interface usability
   - Test across different browsers and devices

## Security Considerations

1. **Input Sanitization**
   - Sanitize all user inputs
   - Validate URLs before processing

2. **Resource Usage**
   - Implement rate limiting to avoid DoS-like behavior
   - Set reasonable limits on crawl depth and number of URLs

3. **Error Exposure**
   - Don't expose sensitive error details to users
   - Log errors properly for debugging

## Deliverables

The completed application should include:

1. A functional Next.js web application matching the provided mockups
2. A working crawler implementation using Next.js API routes or Netlify functions
3. XML sitemap generation functionality
4. Educational content as outlined in the mockups
5. Documentation for setup and usage
6. Netlify deployment configuration

## Additional Notes

- Ensure the application is accessible and works on modern browsers
- Consider implementing a dark mode option using Next.js theme support
- Include appropriate loading indicators for better UX
- Consider adding optional features like sitemap compression or splitting large sitemaps
- Address potential CORS issues when crawling websites