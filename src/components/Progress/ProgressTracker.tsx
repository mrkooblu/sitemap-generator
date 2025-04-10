import React from 'react';
import styled from 'styled-components';
import Button from '../common/Button';

const ProgressContainer = styled.div`
  background-color: ${({ theme }) => theme.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  padding: ${({ theme }) => theme.spacing[8]};
  width: 100%;
  max-width: 700px;
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
  
  return (
    <ProgressContainer>
      <ProgressTitle>Generating Sitemap</ProgressTitle>
      <StatusIndicator>Please wait while we crawl your website...</StatusIndicator>
      
      <ProgressInfo>
        <InfoRow>
          <InfoLabel>URLs Scanned:</InfoLabel>
          <InfoValue>{urlsScanned}</InfoValue>
        </InfoRow>
        <InfoRow>
          <InfoLabel>Time Elapsed:</InfoLabel>
          <InfoValue>{timeElapsed}</InfoValue>
        </InfoRow>
        <InfoRow>
          <InfoLabel>Estimated Time Remaining:</InfoLabel>
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