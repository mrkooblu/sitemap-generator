import React, { useState, ReactNode } from 'react';
import styled from 'styled-components';

const TabContainer = styled.div`
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const TabHeader = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  overflow-x: auto;
  scrollbar-width: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding-bottom: ${({ theme }) => theme.spacing[2]};
  }
`;

interface TabButtonProps {
  $active: boolean;
}

const TabButton = styled.button<TabButtonProps>`
  padding: ${({ theme }) => `${theme.spacing[3]} ${theme.spacing[4]}`};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme, $active }) => 
    $active ? theme.fontWeights.semibold : theme.fontWeights.medium};
  color: ${({ theme, $active }) => 
    $active ? theme.colors.primary : theme.colors.gray[600]};
  background: transparent;
  border: none;
  border-bottom: 3px solid ${({ theme, $active }) => 
    $active ? theme.colors.primary : 'transparent'};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transition.normal};
  min-width: max-content;
  position: relative;
  overflow: hidden;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 3px;
    background-color: ${({ theme }) => theme.colors.primary};
    transition: width ${({ theme }) => theme.transition.normal};
    transform-origin: center;
  }
  
  &:hover::after {
    width: ${({ $active }) => $active ? '0' : '80%'};
    left: ${({ $active }) => $active ? '50%' : '10%'};
  }
`;

const TabContent = styled.div`
  animation: ${({ theme }) => theme.animation.fadeIn};
`;

export interface TabItem {
  id: string;
  label: ReactNode;
  content: ReactNode;
}

interface TabInterfaceProps {
  tabs: TabItem[];
  defaultActiveTab?: string;
  onTabChange?: (tabId: string) => void;
}

const TabInterface: React.FC<TabInterfaceProps> = ({ 
  tabs, 
  defaultActiveTab,
  onTabChange,
}) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab || tabs[0]?.id || '');
  
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (onTabChange) {
      onTabChange(tabId);
    }
  };
  
  return (
    <TabContainer>
      <TabHeader>
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            $active={activeTab === tab.id}
            onClick={() => handleTabChange(tab.id)}
          >
            {tab.label}
          </TabButton>
        ))}
      </TabHeader>
      <TabContent>
        {tabs.find(tab => tab.id === activeTab)?.content}
      </TabContent>
    </TabContainer>
  );
};

export default TabInterface; 