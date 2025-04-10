import React from 'react';
import styled from 'styled-components';
import Button from '../common/Button';

const ResultContainer = styled.div`
  background-color: ${({ theme }) => theme.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  padding: ${({ theme }) => theme.spacing[8]};
  width: 100%;
  max-width: 800px;
  margin: 2rem auto;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: ${({ theme }) => theme.spacing[5]};
  }
`;

const ResultHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing[8]};
  text-align: center;
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
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background-color: ${({ theme }) => theme.colors.primary};
    border-radius: ${({ theme }) => theme.borderRadius.full};
  }
`;

const ResultSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.gray[600]};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  max-width: 90%;
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
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[4]};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
    align-items: center;
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
  return (
    <ResultContainer>
      <ResultHeader>
        <ResultTitle>Sitemap Generated Successfully</ResultTitle>
        <ResultSubtitle>
          Your sitemap is ready! You can download it, view the list of URLs, or start again.
        </ResultSubtitle>
      </ResultHeader>
      
      <StatsContainer>
        <StatCard>
          <StatValue>{totalUrls}</StatValue>
          <StatLabel>Total URLs</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{timeElapsed}</StatValue>
          <StatLabel>Generation Time</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{Math.ceil(sitemapXml.length / 1024)} KB</StatValue>
          <StatLabel>File Size</StatLabel>
        </StatCard>
      </StatsContainer>
      
      <UrlListContainer>
        <UrlListTitle>URLs Included</UrlListTitle>
        <UrlList>
          {urls.map((url, index) => (
            <UrlItem key={index}>{url}</UrlItem>
          ))}
        </UrlList>
      </UrlListContainer>
      
      <UrlListTitle>Generated Sitemap (XML)</UrlListTitle>
      <SitemapContent>{sitemapXml}</SitemapContent>
      
      <ButtonGroup>
        <Button onClick={onDownload}>Download Sitemap</Button>
        <Button variant="outline" onClick={onRetry}>Generate New Sitemap</Button>
      </ButtonGroup>
    </ResultContainer>
  );
};

export default SitemapResult; 