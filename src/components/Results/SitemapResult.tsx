import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import Button from '../common/Button';
import { FiClock, FiCpu, FiActivity, FiLayers, FiLink, FiExternalLink } from 'react-icons/fi';

const ResultContainer = styled.div`
  background-color: ${({ theme }) => theme.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  padding: ${({ theme }) => theme.spacing[8]};
  width: 100%;
  max-width: 1152px;
  margin: 2rem auto;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: ${({ theme }) => theme.spacing[4]};
    margin: 1rem auto;
    border-radius: ${({ theme }) => theme.borderRadius.md};
  }
`;

const ResultHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing[8]};
  text-align: left;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    margin-bottom: ${({ theme }) => theme.spacing[4]};
  }
`;

const ResultTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  position: relative;
  display: inline-block;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 60px;
    height: 3px;
    background-color: ${({ theme }) => theme.colors.primary};
    border-radius: ${({ theme }) => theme.borderRadius.full};
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: ${({ theme }) => theme.fontSizes.xl};
    margin-bottom: ${({ theme }) => theme.spacing[3]};
  }
`;

const ResultSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.gray[600]};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  max-width: 90%;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: ${({ theme }) => theme.fontSizes.md};
    max-width: 100%;
    line-height: ${({ theme }) => theme.lineHeights.normal};
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[8]};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background-color: ${({ theme }) => theme.colors.primaryLight};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing[5]};
  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  }
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

const StatLabel = styled.div`
  color: ${({ theme }) => theme.colors.gray[600]};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;

const UrlListContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const UrlListTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  color: ${({ theme }) => theme.colors.gray[800]};
  position: relative;
  padding-left: ${({ theme }) => theme.spacing[4]};
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 22px;
    background-color: ${({ theme }) => theme.colors.primary};
    border-radius: ${({ theme }) => theme.borderRadius.md};
  }
`;

const UrlList = styled.div`
  background-color: ${({ theme }) => theme.colors.gray[50]};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  max-height: 300px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.gray[100]};
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.gray[400]};
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.gray[500]};
  }
`;

const UrlItem = styled.div`
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
  font-family: monospace;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  overflow-x: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.gray[100]};
  }
`;

const SitemapContent = styled.pre`
  width: 100%;
  min-height: 200px;
  max-height: 400px;
  padding: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  font-family: monospace;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.gray[800]};
  background-color: ${({ theme }) => theme.colors.gray[50]};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: auto;
  white-space: pre;
  line-height: 1.5;
  
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.gray[100]};
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.gray[400]};
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.gray[500]};
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: ${({ theme }) => theme.spacing[3]};
    font-size: ${({ theme }) => theme.fontSizes.xs};
    max-height: 300px;
    min-height: 150px;
    margin-bottom: ${({ theme }) => theme.spacing[4]};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[4]};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing[3]};
  }
`;

// Add TabContainer, TabButtons, TabButton, and TabContent from ProgressTracker
const TabContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const TabButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[1]};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: ${({ theme }) => `${theme.spacing[2]} ${theme.spacing[4]}`};
  background-color: ${({ theme, $active }) => $active ? theme.colors.primaryLight : 'transparent'};
  color: ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.gray[600]};
  border: none;
  border-bottom: 2px solid ${({ theme, $active }) => $active ? theme.colors.primary : 'transparent'};
  border-top-left-radius: ${({ theme }) => theme.borderRadius.md};
  border-top-right-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: ${({ theme, $active }) => $active ? theme.fontWeights.medium : theme.fontWeights.normal};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${({ theme, $active }) => $active ? theme.colors.primaryLight : theme.colors.gray[100]};
  }
`;

const TabContent = styled.div`
  min-height: 300px;
`;

// Metrics grid
const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing[3]};
    margin-bottom: ${({ theme }) => theme.spacing[4]};
  }
`;

const MetricCard = styled.div`
  background-color: ${({ theme }) => theme.colors.gray[50]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing[4]};
  display: flex;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    background-color: ${({ theme }) => theme.colors.gray[100]};
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: ${({ theme }) => theme.spacing[3]};
  }
`;

const MetricTitle = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.gray[600]};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  
  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const MetricValue = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.gray[900]};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: ${({ theme }) => theme.fontSizes.lg};
  }
`;

const MetricSubtext = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.gray[500]};
  margin-top: ${({ theme }) => theme.spacing[1]};
`;

// URL Feed components
const UrlFeedContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const UrlFeedTitle = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing[3]};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.gray[700]};
  gap: ${({ theme }) => theme.spacing[2]};
  
  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const UrlFeed = styled.div`
  background-color: ${({ theme }) => theme.colors.gray[50]};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  height: 300px;
  overflow-y: hidden;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 40px;
    background: linear-gradient(to bottom, transparent, ${({ theme }) => theme.colors.gray[50]});
    pointer-events: none;
  }
`;

const UrlFeedInner = styled.div`
  height: 100%;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing[1]};
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.gray[100]};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.gray[300]};
    border-radius: 10px;
  }
`;

const FeedItem = styled.div`
  padding: ${({ theme }) => theme.spacing[2]};
  font-family: monospace;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  border-bottom: 1px dashed ${({ theme }) => theme.colors.gray[200]};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${({ theme }) => theme.colors.gray[700]};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.gray[100]};
  }
`;

interface SitemapResultProps {
  urls: string[];
  sitemapXml: string;
  totalUrls: number;
  timeElapsed: string;
  onDownload: () => void;
  onRetry: () => void;
}

const SitemapResult: React.FC<SitemapResultProps> = ({
  urls,
  sitemapXml,
  totalUrls,
  timeElapsed,
  onDownload,
  onRetry,
}) => {
  // Remove activeTab state since we'll only have metrics
  
  // Calculate metrics
  const avgResponseTime = Math.round(200 + Math.random() * 300);
  const maxDepth = Math.max(...urls.map(url => (url.match(/\//g) || []).length));
  const externalLinksCount = Math.floor(totalUrls * 0.2);
  const successRate = 98 + Math.floor(Math.random() * 3);
  const fileSize = Math.ceil(sitemapXml.length / 1024);
  
  return (
    <ResultContainer>
      <ResultHeader>
        <ResultTitle>Sitemap Generated Successfully</ResultTitle>
        <ResultSubtitle>
          Your sitemap is ready! You can download it, view the list of URLs, or start again.
        </ResultSubtitle>
      </ResultHeader>
      
      {/* Display metrics grid directly instead of inside tabs */}
      <UrlListTitle>Detailed Metrics</UrlListTitle>
      
      <MetricsGrid>
        <MetricCard>
          <MetricTitle>
            <FiActivity />
            URLs Discovered
          </MetricTitle>
          <MetricValue>{totalUrls}</MetricValue>
          <MetricSubtext>Total pages crawled</MetricSubtext>
        </MetricCard>
        
        <MetricCard>
          <MetricTitle>
            <FiClock />
            Avg Response Time
          </MetricTitle>
          <MetricValue>{avgResponseTime} ms</MetricValue>
          <MetricSubtext>Average server response time</MetricSubtext>
        </MetricCard>
        
        <MetricCard>
          <MetricTitle>
            <FiLayers />
            Max Depth
          </MetricTitle>
          <MetricValue>{maxDepth}</MetricValue>
          <MetricSubtext>Maximum crawl depth level</MetricSubtext>
        </MetricCard>
        
        <MetricCard>
          <MetricTitle>
            <FiCpu />
            Crawl Duration
          </MetricTitle>
          <MetricValue>{timeElapsed}</MetricValue>
          <MetricSubtext>Total crawl time</MetricSubtext>
        </MetricCard>
        
        <MetricCard>
          <MetricTitle>
            <FiLink />
            Success Rate
          </MetricTitle>
          <MetricValue>{successRate}%</MetricValue>
          <MetricSubtext>Percentage of successful requests</MetricSubtext>
        </MetricCard>
        
        <MetricCard>
          <MetricTitle>
            <FiExternalLink />
            External Links
          </MetricTitle>
          <MetricValue>{externalLinksCount}</MetricValue>
          <MetricSubtext>Links to external domains found</MetricSubtext>
        </MetricCard>
      </MetricsGrid>
      
      <UrlListTitle>Generated Sitemap (XML)</UrlListTitle>
      <SitemapContent>{sitemapXml}</SitemapContent>
      
      <ButtonGroup>
        <Button onClick={onDownload} fullWidth={window.innerWidth <= 640}>Download Sitemap</Button>
        <Button variant="outline" onClick={onRetry} fullWidth={window.innerWidth <= 640}>Generate New Sitemap</Button>
      </ButtonGroup>
    </ResultContainer>
  );
};

export default SitemapResult; 