import React, { useState, ReactNode } from 'react';
import styled from 'styled-components';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

const AccordionContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  background-color: ${({ theme }) => theme.background.paper};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: box-shadow ${({ theme }) => theme.transition.normal};
  
  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

interface HeaderProps {
  $isOpen: boolean;
}

const AccordionHeader = styled.button<HeaderProps>`
  width: 100%;
  text-align: left;
  padding: ${({ theme }) => theme.spacing[4]};
  background-color: ${({ theme, $isOpen }) => $isOpen ? theme.colors.gray[50] : 'transparent'};
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme, $isOpen }) => $isOpen ? theme.colors.primary : theme.colors.gray[800]};
  transition: all ${({ theme }) => theme.transition.fast};
  position: relative;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.gray[50]};
  }
  
  &:focus {
    outline: none;
  }
`;

const IconContainer = styled.div<HeaderProps>`
  transform: ${({ $isOpen }) => $isOpen ? 'rotate(0deg)' : 'rotate(-90deg)'};
  transition: transform ${({ theme }) => theme.transition.fast};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme, $isOpen }) => $isOpen ? theme.colors.primary : theme.colors.gray[500]};
`;

interface ContentProps {
  $isOpen: boolean;
}

const AccordionContent = styled.div<ContentProps>`
  padding: ${({ theme, $isOpen }) => $isOpen ? theme.spacing[4] : '0 ' + theme.spacing[4]};
  max-height: ${({ $isOpen }) => $isOpen ? '1000px' : '0'};
  opacity: ${({ $isOpen }) => $isOpen ? '1' : '0'};
  overflow: hidden;
  transition: all ${({ theme }) => theme.transition.normal};
  border-top: ${({ theme, $isOpen }) => $isOpen ? `1px solid ${theme.colors.gray[200]}` : 'none'};
`;

const Title = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.lg};
`;

export interface AccordionItem {
  id: string;
  title: ReactNode;
  content: ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  defaultOpenItems?: string[];
  allowMultiple?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({
  items,
  defaultOpenItems = [],
  allowMultiple = false,
}) => {
  const [openItems, setOpenItems] = useState<string[]>(defaultOpenItems);

  const toggleItem = (itemId: string) => {
    setOpenItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        if (allowMultiple) {
          return [...prev, itemId];
        } else {
          return [itemId];
        }
      }
    });
  };

  const isItemOpen = (itemId: string) => openItems.includes(itemId);

  return (
    <>
      {items.map(item => (
        <AccordionContainer key={item.id}>
          <AccordionHeader 
            $isOpen={isItemOpen(item.id)}
            onClick={() => toggleItem(item.id)}
          >
            <Title>{item.title}</Title>
            <IconContainer $isOpen={isItemOpen(item.id)}>
              {isItemOpen(item.id) ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
            </IconContainer>
          </AccordionHeader>
          <AccordionContent $isOpen={isItemOpen(item.id)}>
            {item.content}
          </AccordionContent>
        </AccordionContainer>
      ))}
    </>
  );
};

export default Accordion; 