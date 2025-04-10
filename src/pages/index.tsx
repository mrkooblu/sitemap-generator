import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import Layout from '../components/Layout/Layout';
import ProgressTracker from '../components/Progress/ProgressTracker';
import SitemapResult from '../components/Results/SitemapResult';
import SitemapForm from '../components/Input/SitemapForm';
import { normalizeUrl } from '../utils/url-validator';
import TabInterface, { TabItem } from '../components/common/TabInterface';
import StepWizard, { WizardStep } from '../components/common/StepWizard';
import Accordion, { AccordionItem } from '../components/common/Accordion';
import Tooltip from '../components/common/Tooltip';
import Card from '../components/common/Card';
import { FiBook, FiInfo, FiMap, FiSettings, FiFileText } from 'react-icons/fi';
import {
  initCrawl,
  loadState,
  clearState,
  processNextBatch,
  cancelCrawl,
  getProgressInfo,
  getCrawlResults,
  getCrawlStats,
  CrawlState
} from '../utils/crawler-coordinator';

// Page states
enum AppState {
  INPUT = 'input',
  PROGRESS = 'progress',
  RESULTS = 'results',
}

const Divider = styled.hr`
  border: none;
  height: 1px;
  background-color: ${({ theme }) => theme.colors.gray[200]};
  margin: ${({ theme }) => theme.spacing[8]} 0;
`;

const HomeContainer = styled.div`
  width: 100%;
  animation: ${({ theme }) => theme.animation.fadeIn};
`;

const HeroSection = styled.div`
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing[8]};
  padding-left: 1rem;
`;

const HeroTitle = styled.h1`
  text-align: left;
  font-size: 40px;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.gray[900]};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const HeroSubtitle = styled.p`
  text-align: left;
  font-size: 18px;
  max-width: 800px;
  margin-bottom: ${({ theme }) => theme.spacing[8]};
  color: ${({ theme }) => theme.colors.gray[600]};
  line-height: ${({ theme }) => theme.lineHeights.normal};
`;

const GeneratorContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[8]};
  background-color: ${({ theme }) => theme.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: ${({ theme }) => theme.spacing[6]};
`;

const PageTitle = styled.h1`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing[3]};
  color: ${({ theme }) => theme.colors.gray[900]};
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  background: ${({ theme }) => theme.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const PageDescription = styled.p`
  text-align: center;
  max-width: 600px;
  margin: 0 auto ${({ theme }) => theme.spacing[8]};
  color: ${({ theme }) => theme.colors.gray[600]};
  font-size: ${({ theme }) => theme.fontSizes.md};
  line-height: ${({ theme }) => theme.lineHeights.normal};
`;

const StepContainer = styled.div`
  padding: ${({ theme }) => theme.spacing[4]};
  background-color: ${({ theme }) => theme.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

const StepTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const StepContent = styled.div`
  color: ${({ theme }) => theme.colors.gray[700]};
  line-height: ${({ theme }) => theme.lineHeights.normal};
`;

const Paragraph = styled.p`
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  color: ${({ theme }) => theme.colors.gray[700]};
  line-height: ${({ theme }) => theme.lineHeights.normal};
`;

const List = styled.ul`
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  padding-left: ${({ theme }) => theme.spacing[5]};
`;

const ListItem = styled.li`
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  color: ${({ theme }) => theme.colors.gray[700]};
  line-height: ${({ theme }) => theme.lineHeights.normal};
  position: relative;
  
  &::marker {
    color: ${({ theme }) => theme.colors.primary};
  }
  
  strong {
    color: ${({ theme }) => theme.colors.gray[800]};
  }
`;

const GraphicPlaceholder = styled.div`
  background-color: ${({ theme }) => theme.colors.gray[50]};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: ${({ theme }) => theme.colors.gray[500]};
`;

const SectionSpacer = styled.div`
  height: ${({ theme }) => theme.spacing[8]};
`;

const ResultsContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing[8]};
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -${({ theme }) => theme.spacing[4]};
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    height: 1px;
    background: linear-gradient(
      to right,
      rgba(0, 0, 0, 0),
      rgba(0, 0, 0, 0.1),
      rgba(0, 0, 0, 0)
    );
  }
`;

// Placeholder for sitemap data
interface SitemapData {
  url: string;
  createdAt: Date;
  urlsIndexed: number;
  sitemapXml: string;
}

const Home: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INPUT);
  const [url, setUrl] = useState<string>('');
  const [progress, setProgress] = useState({
    urlsScanned: 0,
    totalUrls: 100, // Placeholder
    timeElapsed: '00:00:00',
    estimatedTimeRemaining: 'Calculating...',
    currentUrl: '',
  });
  const [sitemapData, setSitemapData] = useState<SitemapData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('how-to');
  const [crawlState, setCrawlState] = useState<CrawlState | null>(null);
  
  // Try to restore session on page load
  useEffect(() => {
    const storedState = loadState();
    if (storedState && !storedState.isComplete && !storedState.isCancelled) {
      setCrawlState(storedState);
      setUrl(storedState.rootUrl);
      setAppState(AppState.PROGRESS);
      
      // Start the polling loop
      startPolling();
    }
  }, []);
  
  // Polling function to update progress and process batches
  const startPolling = useCallback(async () => {
    let state = loadState();
    if (!state || state.isComplete || state.isCancelled) return;
    
    // Update progress info
    const progressInfo = getProgressInfo(state);
    setProgress({
      urlsScanned: progressInfo.urlsScanned,
      totalUrls: progressInfo.totalUrls,
      timeElapsed: progressInfo.timeElapsed,
      estimatedTimeRemaining: progressInfo.estimatedTimeRemaining,
      currentUrl: progressInfo.currentUrl,
    });
    
    // Process next batch
    state = await processNextBatch(state);
    setCrawlState(state);
    
    // If complete, generate sitemap
    if (state.isComplete) {
      generateSitemapFromResults(state);
    } else {
      // Continue polling
      setTimeout(startPolling, 500);
    }
  }, []);
  
  // Generate sitemap from crawl results
  const generateSitemapFromResults = async (state: CrawlState) => {
    try {
      // Get all crawled URLs
      const crawledData = getCrawlResults(state);
      const stats = getCrawlStats(state);
      
      // Set maximum URLs per chunk to avoid hitting body size limits
      const MAX_URLS_PER_CHUNK = 200;
      let sitemapXml = '';
      
      // If we have a lot of URLs, process them in chunks
      if (crawledData.length > MAX_URLS_PER_CHUNK) {
        // Process in chunks
        setIsLoading(true);
        
        // First generate a base sitemap with just the first chunk to get the XML header
        const firstChunk = crawledData.slice(0, MAX_URLS_PER_CHUNK);
        const firstResponse = await fetch('/api/generate-sitemap', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            urls: firstChunk,
            options: {
              hostname: state.rootUrl,
              ...state.options
            }
          }),
        });
        
        if (!firstResponse.ok) {
          throw new Error('Failed to generate first sitemap chunk');
        }
        
        // Get the complete XML from the first chunk
        const firstXml = await firstResponse.text();
        
        // Extract header and footer from first XML
        const urlsetStartIndex = firstXml.indexOf('<urlset');
        const urlsetEndIndex = firstXml.lastIndexOf('</urlset>');
        
        if (urlsetStartIndex === -1 || urlsetEndIndex === -1) {
          throw new Error('Invalid XML format received');
        }
        
        const xmlHeader = firstXml.substring(0, urlsetStartIndex);
        const urlsetOpenTag = firstXml.substring(urlsetStartIndex, firstXml.indexOf('>', urlsetStartIndex) + 1);
        const urlsetCloseTag = '</urlset>';
        const xmlFooter = firstXml.substring(urlsetEndIndex + urlsetCloseTag.length);
        
        // Initialize the combined XML with header and urlset opening tag
        sitemapXml = xmlHeader + urlsetOpenTag;
        
        // Extract all URL entries from the first chunk
        const urlEntries = [];
        let urlStartIndex = firstXml.indexOf('<url>');
        while (urlStartIndex !== -1) {
          const urlEndIndex = firstXml.indexOf('</url>', urlStartIndex) + '</url>'.length;
          urlEntries.push(firstXml.substring(urlStartIndex, urlEndIndex));
          urlStartIndex = firstXml.indexOf('<url>', urlEndIndex);
        }
        
        // Add the URL entries from the first chunk
        sitemapXml += urlEntries.join('');
        
        // Process remaining chunks
        for (let i = MAX_URLS_PER_CHUNK; i < crawledData.length; i += MAX_URLS_PER_CHUNK) {
          const chunk = crawledData.slice(i, i + MAX_URLS_PER_CHUNK);
          const chunkResponse = await fetch('/api/generate-sitemap', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              urls: chunk,
              options: {
                hostname: state.rootUrl,
                ...state.options
              }
            }),
          });
          
          if (!chunkResponse.ok) {
            throw new Error(`Failed to generate sitemap chunk ${i / MAX_URLS_PER_CHUNK + 1}`);
          }
          
          // Get the XML from this chunk
          const chunkXml = await chunkResponse.text();
          
          // Extract URL entries from this chunk
          const chunkUrlEntries = [];
          let chunkUrlStartIndex = chunkXml.indexOf('<url>');
          while (chunkUrlStartIndex !== -1) {
            const chunkUrlEndIndex = chunkXml.indexOf('</url>', chunkUrlStartIndex) + '</url>'.length;
            chunkUrlEntries.push(chunkXml.substring(chunkUrlStartIndex, chunkUrlEndIndex));
            chunkUrlStartIndex = chunkXml.indexOf('<url>', chunkUrlEndIndex);
          }
          
          // Add the URL entries from this chunk
          sitemapXml += chunkUrlEntries.join('');
        }
        
        // Add the closing urlset tag and footer
        sitemapXml += urlsetCloseTag + xmlFooter;
      } else {
        // For smaller sitemaps, just make a single API call
        const sitemapResponse = await fetch('/api/generate-sitemap', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            urls: crawledData,
            options: {
              hostname: state.rootUrl,
              ...state.options
            }
          }),
        });
        
        if (!sitemapResponse.ok) {
          const errorData = await sitemapResponse.json();
          throw new Error(errorData.error || 'Failed to generate sitemap');
        }
        
        // Get the XML
        sitemapXml = await sitemapResponse.text();
      }
      
      // Set sitemap data
      setSitemapData({
        url: state.rootUrl,
        createdAt: new Date(),
        urlsIndexed: crawledData.length,
        sitemapXml,
      });
      
      setAppState(AppState.RESULTS);
      setIsLoading(false);
    } catch (error) {
      console.error('Sitemap generation error:', error);
      setIsLoading(false);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setAppState(AppState.INPUT);
    }
  };
  
  // Generate a sitemap for a website
  const generateSitemap = async (siteUrl: string, options: any) => {
    setIsLoading(true);
    setUrl(siteUrl);
    setAppState(AppState.PROGRESS);
    
    try {
      // Clear any existing state
      clearState();
      
      // Initialize new crawl
      const state = initCrawl(siteUrl, options);
      setCrawlState(state);
      
      // Start the polling loop
      startPolling();
      
      // Return cleanup function
      return () => {
        cancelCrawl();
      };
    } catch (error) {
      console.error('Sitemap generation error:', error);
      setIsLoading(false);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setAppState(AppState.INPUT);
      return () => {}; // Return empty cleanup function
    }
  };
  
  const handleCancel = () => {
    cancelCrawl();
    setAppState(AppState.INPUT);
    setIsLoading(false);
    clearState();
  };
  
  // Helper to format time as HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0'),
    ].join(':');
  };
  
  const handleDownload = () => {
    if (!sitemapData) return;
    
    // Create a blob with the sitemap XML content
    const blob = new Blob([sitemapData.sitemapXml], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleNewSitemap = () => {
    setAppState(AppState.INPUT);
    setUrl('');
    setSitemapData(null);
    clearState();
  };
  
  const handleSubmit = (submittedUrl: string, options: any) => {
    const normalizedUrl = normalizeUrl(submittedUrl);
    generateSitemap(normalizedUrl, options);
  };
  
  // Wizard steps for "How to Generate a Sitemap"
  const wizardSteps: WizardStep[] = [
    {
      id: 'step1',
      label: 'Enter URL',
      content: (
        <StepContainer>
          <StepTitle>
            <FiMap />
            Step 1: Enter your website URL
          </StepTitle>
          <StepContent>
            <Paragraph>
              Start by entering the URL of your website in the input field. This should be the root URL of your site, such as:
            </Paragraph>
            <List>
              <ListItem>https://example.com</ListItem>
              <ListItem>https://mywebsite.org</ListItem>
            </List>
            <Paragraph>
              You don't need to include specific pages or parameters. Our crawler will find all your pages automatically.
            </Paragraph>
          </StepContent>
        </StepContainer>
      ),
    },
    {
      id: 'step2',
      label: 'Wait for Crawling',
      content: (
        <StepContainer>
          <StepTitle>
            <FiSettings />
            Step 2: Wait while we crawl your site
          </StepTitle>
          <StepContent>
            <Paragraph>
              After entering your URL and clicking generate, our crawler will:
            </Paragraph>
            <List>
              <ListItem>Visit your website and follow all internal links</ListItem>
              <ListItem>Discover all accessible pages</ListItem>
              <ListItem>Build a comprehensive sitemap of your content</ListItem>
            </List>
            <Paragraph>
              The crawling process may take several minutes depending on the size of your website. You'll see a progress indicator while the crawler works.
            </Paragraph>
          </StepContent>
        </StepContainer>
      ),
    },
    {
      id: 'step3',
      label: 'Download Sitemap',
      content: (
        <StepContainer>
          <StepTitle>
            <FiFileText />
            Step 3: Download your sitemap
          </StepTitle>
          <StepContent>
            <Paragraph>
              Once the crawling is complete, you'll be able to:
            </Paragraph>
            <List>
              <ListItem>Preview the generated XML sitemap</ListItem>
              <ListItem>See a list of all discovered URLs</ListItem>
              <ListItem>Download the sitemap file to your computer</ListItem>
            </List>
            <Paragraph>
              The sitemap will be generated in the XML format recognized by all major search engines.
            </Paragraph>
          </StepContent>
        </StepContainer>
      ),
    },
    {
      id: 'step4',
      label: 'Submit to Search Engines',
      content: (
        <StepContainer>
          <StepTitle>
            <FiBook />
            Step 4: Submit to search engines
          </StepTitle>
          <StepContent>
            <Paragraph>
              After downloading your sitemap, you should:
            </Paragraph>
            <List>
              <ListItem>Upload the sitemap to your website's root directory (e.g., example.com/sitemap.xml)</ListItem>
              <ListItem>Submit the sitemap URL to search engines through their webmaster tools:
                <ul>
                  <li>Google Search Console</li>
                  <li>Bing Webmaster Tools</li>
                </ul>
              </ListItem>
              <ListItem>Add a reference to your sitemap in your robots.txt file:
                <pre>Sitemap: https://example.com/sitemap.xml</pre>
              </ListItem>
            </List>
            <Paragraph>
              This will help search engines discover and index your content more efficiently, potentially improving your site's visibility in search results.
            </Paragraph>
          </StepContent>
        </StepContainer>
      ),
    },
  ];
  
  // FAQ items
  const faqItems: AccordionItem[] = [
    {
      id: 'faq1',
      title: 'What is a sitemap and why do I need one?',
      content: (
        <Paragraph>
          A sitemap is a file that lists all the pages on your website in a structured format that search engines can read. It helps search engines discover and index your content more efficiently, which can improve your site's visibility in search results. A sitemap is especially useful for large websites, new sites, sites with many pages that aren't well linked, and sites that use rich media content.
        </Paragraph>
      ),
    },
    {
      id: 'faq2',
      title: 'What format is the sitemap generated in?',
      content: (
        <Paragraph>
          Our tool generates standard XML sitemaps that follow the official protocol supported by all major search engines including Google, Bing, Yahoo, and others. The XML format allows you to include additional information about each page, such as when it was last updated, how often it changes, and its priority relative to other pages on your site.
        </Paragraph>
      ),
    },
    {
      id: 'faq3',
      title: 'How often should I update my sitemap?',
      content: (
        <Paragraph>
          You should update your sitemap whenever significant changes are made to your website, such as adding new pages, removing pages, or substantially modifying existing content. For websites that change frequently, it's recommended to update the sitemap at least weekly. For more static websites, monthly updates may be sufficient.
        </Paragraph>
      ),
    },
    {
      id: 'faq4',
      title: 'How do I submit my sitemap to search engines?',
      content: (
        <>
          <Paragraph>
            To submit your sitemap to search engines, follow these steps:
          </Paragraph>
          <List>
            <ListItem>Upload the sitemap file to your web server (typically in the root directory)</ListItem>
            <ListItem>For Google: Go to Google Search Console, select your property, and navigate to 'Sitemaps'. Enter the URL of your sitemap and click 'Submit'.</ListItem>
            <ListItem>For Bing: Go to Bing Webmaster Tools, select your site, and use the 'Submit a Sitemap' option.</ListItem>
            <ListItem>Additionally, you can add a reference to your sitemap in your robots.txt file: <br />
              <code>Sitemap: https://example.com/sitemap.xml</code>
            </ListItem>
          </List>
        </>
      ),
    },
    {
      id: 'faq5',
      title: 'Are there any limits to how many URLs can be in a sitemap?',
      content: (
        <Paragraph>
          Yes, a single sitemap file should not exceed 50MB in size or contain more than 50,000 URLs. If your website is larger, you can create multiple sitemap files and then create a sitemap index file that references all individual sitemaps. Our tool automatically handles this for large websites by creating a sitemap index when necessary.
        </Paragraph>
      ),
    },
  ];
  
  // Tab items
  const tabItems: TabItem[] = [
    {
      id: 'how-to',
      label: 'How It Works',
      content: (
        <>
          <PageTitle>How to Generate a Sitemap</PageTitle>
          <PageDescription>
            Follow these simple steps to create and use a sitemap for your website.
          </PageDescription>
          
          <StepWizard steps={wizardSteps} allowSkip={true} />
        </>
      ),
    },
    {
      id: 'what-is',
      label: 'What is a Sitemap',
      content: (
        <>
          <PageTitle>What Is a Sitemap?</PageTitle>
          <PageDescription>
            Learn what sitemaps are and how they can benefit your website's SEO.
          </PageDescription>
          
          <Card title="Sitemap Overview">
            <Paragraph>
              A sitemap is a structured list of every important page on a website. 
              Sitemaps are typically used to provide a clear, organized overview 
              of a site's structure.
            </Paragraph>
            <Paragraph>
              There are two main types of sitemaps:
            </Paragraph>
            <List>
              <ListItem>
                <strong>XML sitemaps</strong>, which are designed for search engines
              </ListItem>
              <ListItem>
                <strong>HTML sitemaps</strong>, which help human visitors navigate your site
              </ListItem>
            </List>
            <Paragraph>
              XML sitemaps inform search engines about pages to crawl and index on 
              your site, when they were last updated, how frequently they 
              should be crawled, making them essential for building and 
              maintaining an organic online presence.
            </Paragraph>
            <Paragraph>
              HTML sitemaps, on the other hand, aren't necessary unless you 
              want to give human visitors a dedicated navigation tool.
            </Paragraph>
          </Card>
          
          <Card title="Why Do You Need a Sitemap?">
            <Paragraph>
              You need a sitemap because it helps search engines like Google and Bing find, read, and store your 
              most important pages more accurately. Without an XML sitemap, search engines may struggle to 
              discover all of your content or understand how frequently to crawl it, potentially reducing your visibility 
              in search results.
            </Paragraph>
            <Paragraph>
              A sitemap can also help new or recently updated pages get discovered and indexed faster.
            </Paragraph>
          </Card>
          
          <Card title="How to Add a Sitemap to Your Website">
            <Paragraph>
              You can add an XML sitemap to your website by uploading it to 
              your site's root directory, often named "public_html" or "www".
            </Paragraph>
            <Paragraph>
              You can find and access this folder through a file manager in your 
              hosting control panel (such as cPanel) or by using an FTP client.
            </Paragraph>
            <Paragraph>
              Once the XML file is live at "yourwebsite.com/sitemap.xml", you 
              can add a link to it in your robots.txt file by including a line that 
              says:
            </Paragraph>
            <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px', overflowX: 'auto' }}>
              Sitemap: https://yourwebsite.com/sitemap.xml
            </pre>
          </Card>
        </>
      ),
    },
    {
      id: 'faq',
      label: 'FAQ',
      content: (
        <>
          <PageTitle>Frequently Asked Questions</PageTitle>
          <PageDescription>
            Get answers to common questions about sitemaps and our sitemap generator.
          </PageDescription>
          
          <Accordion items={faqItems} allowMultiple={true} />
        </>
      ),
    },
  ];
  
  return (
    <Layout>
      <HomeContainer>
        {/* Always show the header */}
        <HeroSection>
          <HeroTitle>Sitemap Generator</HeroTitle>
          <HeroSubtitle>
            Create a professional XML sitemap that you can submit to search engines and use
            to improve your overall SEO efforts.
          </HeroSubtitle>
        </HeroSection>
        
        {/* Always show the input form */}
        <SitemapForm onSubmit={handleSubmit} isLoading={isLoading} />
        
        {/* Show progress tracker when in PROGRESS state */}
        {appState === AppState.PROGRESS && (
          <ResultsContainer>
            <ProgressTracker
              urlsScanned={progress.urlsScanned}
              totalUrls={progress.totalUrls}
              timeElapsed={progress.timeElapsed}
              estimatedTimeRemaining={progress.estimatedTimeRemaining}
              currentUrl={progress.currentUrl}
              onCancel={handleCancel}
            />
          </ResultsContainer>
        )}
        
        {/* Show results when in RESULTS state */}
        {appState === AppState.RESULTS && sitemapData && (
          <ResultsContainer>
            <SitemapResult
              urls={sitemapData.url.split(',')}
              sitemapXml={sitemapData.sitemapXml}
              totalUrls={sitemapData.urlsIndexed}
              timeElapsed={formatTime(Math.floor((new Date().getTime() - sitemapData.createdAt.getTime()) / 1000))}
              onDownload={handleDownload}
              onRetry={handleNewSitemap}
            />
          </ResultsContainer>
        )}
        
        {/* Always show the tabs section */}
        <Divider />
        
        <TabInterface
          tabs={tabItems}
          defaultActiveTab={activeTab}
          onTabChange={setActiveTab}
        />
      </HomeContainer>
    </Layout>
  );
};

export default Home; 