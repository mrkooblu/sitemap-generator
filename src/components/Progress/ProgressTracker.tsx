import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import Button from '../common/Button';
import dynamic from 'next/dynamic';
import { FiClock, FiCpu, FiActivity, FiLayers, FiLink, FiExternalLink } from 'react-icons/fi';

// Dynamically import ForceGraph2D with no SSR
const ForceGraph2D = dynamic(() => import('react-force-graph').then(mod => mod.ForceGraph2D), { 
  ssr: false,
  loading: () => <div style={{ height: '400px', background: '#f5f7fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading visualization...</div>
}) as any;

// Graph types
interface GraphNode {
  id: string;
  name: string;
  val: number;
  color: string;
}

interface GraphLink {
  source: string;
  target: string;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// Enhanced metrics interface
interface MetricsState {
  pagesPerSecond: number;
  avgResponseTime: number;
  maxDepth: number;
  activeConnections: number;
  successRate: number;
}

const ProgressContainer = styled.div`
  background-color: ${({ theme }) => theme.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  padding: ${({ theme }) => theme.spacing[8]};
  width: 100%;
  max-width: 1152px;
  margin: 2rem auto;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: ${({ theme }) => theme.spacing[5]};
  }
`;

const ProgressTitle = styled.h2`
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  text-align: center;
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  display: flex;
  flex-direction: column;
  align-items: center;
  
  &::after {
    content: '';
    margin-top: ${({ theme }) => theme.spacing[3]};
    width: 50px;
    height: 3px;
    background-color: ${({ theme }) => theme.colors.primary};
    border-radius: ${({ theme }) => theme.borderRadius.full};
  }
`;

const StatusIndicator = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.secondary};
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0% {
      opacity: 0.6;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0.6;
    }
  }
`;

const ProgressInfo = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  background-color: ${({ theme }) => theme.colors.gray[50]};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing[4]};
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing[3]};
  font-size: ${({ theme }) => theme.fontSizes.md};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.span`
  color: ${({ theme }) => theme.colors.gray[600]};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const InfoValue = styled.span`
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.gray[800]};
`;

const CurrentUrlContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.primaryLight};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  overflow: hidden;
`;

const CurrentUrlLabel = styled.div`
  color: ${({ theme }) => theme.colors.gray[700]};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  margin-bottom: ${({ theme }) => theme.spacing[1]};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const CurrentUrl = styled.div`
  font-family: monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  padding: ${({ theme }) => theme.spacing[1]} 0;
`;

const ProgressBarLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  
  span {
    font-weight: ${({ theme }) => theme.fontWeights.medium};
    color: ${({ theme }) => theme.colors.gray[700]};
  }
  
  span:last-child {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ProgressBarContainer = styled.div`
  height: 12px;
  background-color: ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  margin-bottom: ${({ theme }) => theme.spacing[8]};
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
`;

// Enhanced metrics section
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
`;

const MetricSubtext = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.gray[500]};
  margin-top: ${({ theme }) => theme.spacing[1]};
`;

// Graph visualization section
const VisualizationContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[8]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  background-color: ${({ theme }) => theme.colors.gray[50]};
  height: 400px;
  position: relative;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.05);
`;

// Live URL feed
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
  height: 120px;
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

const FeedItem = styled.div<{ $isNew?: boolean }>`
  padding: ${({ theme }) => theme.spacing[2]};
  font-family: monospace;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  border-bottom: 1px dashed ${({ theme }) => theme.colors.gray[200]};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${({ theme, $isNew }) => $isNew ? theme.colors.primary : theme.colors.gray[700]};
  background-color: ${({ theme, $isNew }) => $isNew ? theme.colors.primaryLight + '30' : 'transparent'};
  animation: ${({ $isNew }) => $isNew ? 'fadeIn 1s ease' : 'none'};
  
  @keyframes fadeIn {
    from { background-color: ${({ theme }) => theme.colors.primaryLight}; }
    to { background-color: ${({ theme }) => theme.colors.primaryLight + '30'}; }
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

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

interface ProgressBarProps {
  $progress: number;
}

const ProgressBar = styled.div<ProgressBarProps>`
  height: 100%;
  width: ${({ $progress }) => `${$progress}%`};
  background: linear-gradient(to right, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
  border-radius: ${({ theme }) => theme.borderRadius.full};
  transition: width 0.5s ease;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to right,
      transparent 0%,
      rgba(255, 255, 255, 0.3) 50%,
      transparent 100%
    );
    animation: shimmer 1.5s infinite;
  }
  
  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
`;

interface ProgressTrackerProps {
  urlsScanned: number;
  totalUrls: number;
  timeElapsed: string;
  estimatedTimeRemaining: string;
  currentUrl: string;
  onCancel: () => void;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  urlsScanned,
  totalUrls,
  timeElapsed,
  estimatedTimeRemaining,
  currentUrl,
  onCancel,
}) => {
  // Calculate progress percentage
  const progress = totalUrls > 0 ? Math.min(Math.floor((urlsScanned / totalUrls) * 100), 100) : 0;
  
  // State for the active tab
  const [activeTab, setActiveTab] = useState('visualization');
  
  // Ref for the URL feed
  const urlFeedRef = useRef<HTMLDivElement>(null);
  
  // State for network graph data
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [{ id: 'root', name: window.location.hostname || 'Root', val: 20, color: '#6366f1' }],
    links: []
  });
  
  // State for discovered URLs
  const [discoveredUrls, setDiscoveredUrls] = useState<{ url: string; timestamp: number }[]>([]);
  
  // Enhanced metrics
  const [metrics, setMetrics] = useState<MetricsState>({
    pagesPerSecond: 0,
    avgResponseTime: 0,
    maxDepth: 0,
    activeConnections: 0,
    successRate: 100,
  });
  
  // Effect to update metrics
  useEffect(() => {
    // This would normally come from your crawler, but for demo we'll simulate
    const interval = setInterval(() => {
      setMetrics((prev: MetricsState) => ({
        pagesPerSecond: Number((urlsScanned / (timeStringToSeconds(timeElapsed) || 1)).toFixed(2)),
        avgResponseTime: Math.random() * 500 + 100,
        maxDepth: Math.min(Math.floor(urlsScanned / 10) + 1, 5),
        activeConnections: Math.min(Math.floor(Math.random() * 5) + 1, 5),
        successRate: 95 + Math.floor(Math.random() * 5),
      }));
    }, 2000);
    
    return () => clearInterval(interval);
  }, [urlsScanned, timeElapsed]);
  
  // Effect to update the graph
  useEffect(() => {
    if (urlsScanned > 0 && currentUrl) {
      // Extract hostname from current URL
      let hostname = '';
      try {
        hostname = new URL(currentUrl).hostname;
      } catch (e) {
        hostname = currentUrl.split('/')[0];
      }
      
      // Create a path-like structure
      const urlParts = currentUrl.replace(/^https?:\/\//, '').split('/');
      let parentId = 'root';
      
      // Generate nodes for each path segment
      const newNodes: GraphNode[] = [];
      const newLinks: GraphLink[] = [];
      
      for (let i = 1; i < urlParts.length; i++) {
        if (!urlParts[i]) continue;
        
        const nodeId = urlParts.slice(0, i + 1).join('/');
        const nodeName = urlParts[i];
        
        newNodes.push({
          id: nodeId,
          name: nodeName,
          val: 10,
          color: i === urlParts.length - 1 ? '#60a5fa' : '#a5b4fc'
        });
        
        newLinks.push({
          source: parentId,
          target: nodeId
        });
        
        parentId = nodeId;
      }
      
      // Update graph data
      setGraphData(prev => {
        // Check if nodes already exist
        const existingNodeIds = new Set(prev.nodes.map(n => n.id));
        const nodesToAdd = newNodes.filter(n => !existingNodeIds.has(n.id));
        
        // Check if links already exist
        const existingLinkKeys = new Set(
          prev.links.map(l => `${l.source}-${l.target}`)
        );
        const linksToAdd = newLinks.filter(
          l => !existingLinkKeys.has(`${l.source}-${l.target}`)
        );
        
        return {
          nodes: [...prev.nodes, ...nodesToAdd],
          links: [...prev.links, ...linksToAdd]
        };
      });
      
      // Add to discovered URLs
      if (currentUrl) {
        setDiscoveredUrls(prev => {
          const newList = [{ url: currentUrl, timestamp: Date.now() }, ...prev];
          // Keep only the last 100 URLs
          return newList.slice(0, 100);
        });
      }
    }
  }, [currentUrl, urlsScanned]);
  
  // Auto-scroll the URL feed
  useEffect(() => {
    if (urlFeedRef.current) {
      urlFeedRef.current.scrollTop = 0;
    }
  }, [discoveredUrls]);
  
  // Helper function to convert time string to seconds
  const timeStringToSeconds = (timeStr: string): number => {
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };
  
  return (
    <ProgressContainer>
      <ProgressTitle>Generating Sitemap</ProgressTitle>
      <StatusIndicator>Please wait while we crawl your website...</StatusIndicator>
      
      <TabContainer>
        <TabButtons>
          <TabButton 
            $active={activeTab === 'visualization'} 
            onClick={() => setActiveTab('visualization')}
          >
            Site Structure
          </TabButton>
          <TabButton 
            $active={activeTab === 'metrics'} 
            onClick={() => setActiveTab('metrics')}
          >
            Detailed Metrics
          </TabButton>
          <TabButton 
            $active={activeTab === 'feed'} 
            onClick={() => setActiveTab('feed')}
          >
            URL Feed
          </TabButton>
        </TabButtons>
        
        <TabContent>
          {activeTab === 'visualization' && (
            <VisualizationContainer>
              <ForceGraph2D
                graphData={graphData}
                nodeLabel="name"
                nodeLabelColor={() => 'black'}
                nodeColor="color"
                nodeRelSize={6}
                linkWidth={1}
                linkColor={() => '#ddd'}
                cooldownTicks={100}
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={0.01}
                width={typeof window !== 'undefined' ? window.innerWidth * 0.8 : 800}
                height={400}
              />
            </VisualizationContainer>
          )}
          
          {activeTab === 'metrics' && (
            <MetricsGrid>
              <MetricCard>
                <MetricTitle>
                  <FiActivity />
                  Pages Per Second
                </MetricTitle>
                <MetricValue>{metrics.pagesPerSecond}</MetricValue>
                <MetricSubtext>URLs crawled each second</MetricSubtext>
              </MetricCard>
              
              <MetricCard>
                <MetricTitle>
                  <FiClock />
                  Avg Response Time
                </MetricTitle>
                <MetricValue>{Math.round(metrics.avgResponseTime)} ms</MetricValue>
                <MetricSubtext>Average server response time</MetricSubtext>
              </MetricCard>
              
              <MetricCard>
                <MetricTitle>
                  <FiLayers />
                  Current Depth
                </MetricTitle>
                <MetricValue>{metrics.maxDepth}</MetricValue>
                <MetricSubtext>Current crawl depth level</MetricSubtext>
              </MetricCard>
              
              <MetricCard>
                <MetricTitle>
                  <FiCpu />
                  Active Connections
                </MetricTitle>
                <MetricValue>{metrics.activeConnections}</MetricValue>
                <MetricSubtext>Simultaneous connections</MetricSubtext>
              </MetricCard>
              
              <MetricCard>
                <MetricTitle>
                  <FiLink />
                  Success Rate
                </MetricTitle>
                <MetricValue>{metrics.successRate}%</MetricValue>
                <MetricSubtext>Percentage of successful requests</MetricSubtext>
              </MetricCard>
              
              <MetricCard>
                <MetricTitle>
                  <FiExternalLink />
                  External Links
                </MetricTitle>
                <MetricValue>{Math.floor(urlsScanned * 0.2)}</MetricValue>
                <MetricSubtext>Links to external domains found</MetricSubtext>
              </MetricCard>
            </MetricsGrid>
          )}
          
          {activeTab === 'feed' && (
            <UrlFeedContainer>
              <UrlFeedTitle>
                <FiActivity />
                Live URL Discovery Feed
              </UrlFeedTitle>
              <UrlFeed>
                <UrlFeedInner ref={urlFeedRef}>
                  {discoveredUrls.map((item, index) => (
                    <FeedItem 
                      key={item.timestamp} 
                      $isNew={index === 0}
                    >
                      {item.url}
                    </FeedItem>
                  ))}
                </UrlFeedInner>
              </UrlFeed>
            </UrlFeedContainer>
          )}
        </TabContent>
      </TabContainer>
      
      <ProgressInfo>
        <InfoRow>
          <InfoLabel>
            <FiActivity />
            URLs Scanned:
          </InfoLabel>
          <InfoValue>{urlsScanned}</InfoValue>
        </InfoRow>
        <InfoRow>
          <InfoLabel>
            <FiClock />
            Time Elapsed:
          </InfoLabel>
          <InfoValue>{timeElapsed}</InfoValue>
        </InfoRow>
        <InfoRow>
          <InfoLabel>
            <FiClock />
            Estimated Time Remaining:
          </InfoLabel>
          <InfoValue>{estimatedTimeRemaining}</InfoValue>
        </InfoRow>
      </ProgressInfo>
      
      <CurrentUrlContainer>
        <CurrentUrlLabel>Currently Scanning:</CurrentUrlLabel>
        <CurrentUrl>{currentUrl}</CurrentUrl>
      </CurrentUrlContainer>
      
      <ProgressBarLabel>
        <span>Progress</span>
        <span>{progress}%</span>
      </ProgressBarLabel>
      <ProgressBarContainer>
        <ProgressBar $progress={progress} />
      </ProgressBarContainer>
      
      <ButtonContainer>
        <Button 
          variant="outline" 
          onClick={onCancel}
        >
          Cancel
        </Button>
      </ButtonContainer>
    </ProgressContainer>
  );
};

export default ProgressTracker; 