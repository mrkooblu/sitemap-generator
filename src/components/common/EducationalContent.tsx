import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  margin-top: ${({ theme }) => theme.spacing[12]};
  padding: ${({ theme }) => theme.spacing[6]};
  background-color: ${({ theme }) => theme.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

const Title = styled.h2`
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  text-align: center;
  color: ${({ theme }) => theme.colors.gray[800]};
`;

const Section = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing[8]};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
`;

const Paragraph = styled.p`
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  line-height: ${({ theme }) => theme.lineHeights.normal};
  color: ${({ theme }) => theme.colors.gray[700]};
`;

const List = styled.ul`
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  padding-left: ${({ theme }) => theme.spacing[6]};
`;

const ListItem = styled.li`
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  line-height: ${({ theme }) => theme.lineHeights.normal};
  color: ${({ theme }) => theme.colors.gray[700]};
`;

const EducationalContent: React.FC = () => {
  return (
    <Container>
      <Title>Learn About Sitemaps</Title>
      
      <Section>
        <SectionTitle>What is a Sitemap?</SectionTitle>
        <Paragraph>
          A sitemap is a file that provides information about the pages, videos, and other files on your site, and the relationships between them. 
          Search engines like Google read this file to crawl your site more efficiently.
        </Paragraph>
        <Paragraph>
          A sitemap tells search engines which pages and files you think are important in your site, and also provides valuable metadata about them: 
          for example, when the page was last updated, how often it changes, and any alternate language versions of the page.
        </Paragraph>
      </Section>
      
      <Section>
        <SectionTitle>Types of Sitemaps</SectionTitle>
        <Paragraph>
          There are two primary types of sitemaps:
        </Paragraph>
        <List>
          <ListItem>
            <strong>XML Sitemaps</strong>: These are designed for search engines and follow a specific protocol. They list URLs with additional metadata such as last modified date, change frequency, and priority.
          </ListItem>
          <ListItem>
            <strong>HTML Sitemaps</strong>: These are designed for human visitors and usually appear as a structured list of links to all important pages on a website.
          </ListItem>
        </List>
        <Paragraph>
          Our tool generates an XML sitemap following the <a href="https://www.sitemaps.org/protocol.html" target="_blank" rel="noopener noreferrer">Sitemap Protocol</a>.
        </Paragraph>
      </Section>
      
      <Section>
        <SectionTitle>Benefits for SEO</SectionTitle>
        <Paragraph>
          Sitemaps provide several benefits for search engine optimization:
        </Paragraph>
        <List>
          <ListItem>
            <strong>Improved Crawling</strong>: Help search engines discover and index all important pages on your site.
          </ListItem>
          <ListItem>
            <strong>Faster Indexing</strong>: New or updated content can be discovered and indexed more quickly.
          </ListItem>
          <ListItem>
            <strong>Better Organization</strong>: Provide search engines with metadata about your site's structure.
          </ListItem>
          <ListItem>
            <strong>Mobile and Alternative Content</strong>: Indicate mobile versions or alternative language versions of your content.
          </ListItem>
        </List>
      </Section>
      
      <Section>
        <SectionTitle>How to Use Your Sitemap</SectionTitle>
        <Paragraph>
          Once you've generated your sitemap, here's how to use it:
        </Paragraph>
        <List>
          <ListItem>
            <strong>Upload to your website</strong>: Save the XML file and upload it to your website's root directory (e.g., https://example.com/sitemap.xml).
          </ListItem>
          <ListItem>
            <strong>Add to robots.txt</strong>: Add a reference to your sitemap in your robots.txt file: <code>Sitemap: https://example.com/sitemap.xml</code>
          </ListItem>
          <ListItem>
            <strong>Submit to search engines</strong>: Submit your sitemap to search engines through their webmaster tools (Google Search Console, Bing Webmaster Tools, etc.).
          </ListItem>
          <ListItem>
            <strong>Update regularly</strong>: Update your sitemap whenever you add, remove, or significantly modify content on your website.
          </ListItem>
        </List>
      </Section>
    </Container>
  );
};

export default EducationalContent; 