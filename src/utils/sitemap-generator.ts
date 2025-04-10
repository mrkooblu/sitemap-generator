import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import { PageData } from './crawler';

export interface SitemapOptions {
  hostname: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
  includeImages?: boolean;
  pretty?: boolean; // Option to enable pretty formatting
}

/**
 * Format XML string to be more readable with proper indentation
 */
function formatXml(xml: string): string {
  let formatted = '';
  let indent = '';
  const tab = '  '; // 2 spaces for indentation
  
  xml.split(/>\s*</).forEach(node => {
    if (node.match(/^\/\w/)) {
      // Closing tag
      indent = indent.substring(tab.length);
    }
    
    formatted += indent + '<' + node + '>\n';
    
    if (node.match(/^<?\w[^>]*[^\/]$/) && !node.startsWith('?xml')) {
      // Opening tag
      indent += tab;
    }
  });
  
  // Remove extra line breaks and fix self-closing tags
  return formatted
    .replace(/\s+$/gm, '') // Remove trailing whitespace
    .replace(/<([^>]*)><\/\1>/g, '<$1/>') // Fix empty tags
    .replace(/&amp;/g, '&'); // Fix ampersands (if escaped twice)
}

/**
 * Generates an XML sitemap from crawled page data
 */
export async function generateSitemap(
  pages: PageData[],
  options: SitemapOptions
): Promise<string> {
  try {
    // Make sure we have pages to process
    if (!pages || pages.length === 0) {
      throw new Error('No pages provided for sitemap generation');
    }

    // Create a sitemap stream
    const sitemapStream = new SitemapStream({
      hostname: options.hostname,
    });

    // Create links for the sitemap
    const links = pages.map((page) => {
      // Initialize the link object
      const link: any = {
        url: page.url,
        lastmod: page.lastmod || options.lastmod || new Date().toISOString(),
        changefreq: page.changefreq || options.changefreq || 'weekly',
        priority: page.priority !== undefined ? page.priority : (options.priority || 0.7),
      };

      // Add images if included and available
      if (options.includeImages && page.images && page.images.length > 0) {
        link.img = page.images.map((imageUrl) => ({
          url: imageUrl,
          // You could extract alt and title from the original HTML if needed
        }));
      }

      return link;
    });

    // Make sure we have at least one valid link
    if (links.length === 0) {
      throw new Error('No valid links generated for sitemap');
    }

    // Return promise for sitemap
    return streamToPromise(
      Readable.from(links).pipe(sitemapStream)
    ).then((data) => {
      let xmlString = data.toString();
      
      // Apply pretty formatting if enabled
      if (options.pretty !== false) { // Default to pretty if not specified
        xmlString = formatXml(xmlString);
      }
      
      return xmlString;
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    throw error;
  }
}

/**
 * Split large sitemaps into multiple files with an index
 */
export function splitSitemap(
  pages: PageData[],
  baseUrl: string,
  maxEntriesPerFile: number = 10000
): { index: string; sitemaps: Record<string, string> } {
  // To be implemented when needed - would split large sitemaps
  // into multiple files with a sitemap index
  throw new Error('Not implemented');
}

export default {
  generateSitemap,
  splitSitemap,
}; 