import React, { ReactNode, useState } from 'react';
import styled from 'styled-components';
import { FiChevronDown, FiChevronUp, FiX, FiMove } from 'react-icons/fi';

interface CardContainerProps {
  $isCompact: boolean;
  $isDragging?: boolean;
}

const CardContainer = styled.div<CardContainerProps>`
  background-color: ${({ theme }) => theme.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme, $isDragging }) => 
    $isDragging ? theme.shadows.xl : theme.shadows.md};
  transition: all ${({ theme }) => theme.transition.normal};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  overflow: hidden;
  position: relative;
  transform: ${({ $isDragging }) => $isDragging ? 'scale(1.02)' : 'scale(1)'};
  width: 100%;
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  
  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const CardHeader = styled.div<{ $isDraggable?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing[4]};
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray[200]};
  background-color: ${({ theme }) => theme.colors.gray[50]};
  cursor: ${({ $isDraggable }) => $isDraggable ? 'move' : 'default'};
  position: relative;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.gray[900]};
  flex: 1;
  font-family: 'Inter', sans-serif;
`;

const CardActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const IconButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing[1]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.primary};
  transition: all ${({ theme }) => theme.transition.fast};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryLight};
    color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

interface CardContentProps {
  $isCompact: boolean;
  $isContentVisible: boolean;
}

const CardContent = styled.div<CardContentProps>`
  padding: ${({ theme, $isCompact }) => 
    $isCompact ? theme.spacing[2] : theme.spacing[5]};
  overflow-y: auto;
  max-height: ${({ $isContentVisible }) => 
    !$isContentVisible ? '0' : '500px'};
  opacity: ${({ $isContentVisible }) => $isContentVisible ? 1 : 0};
  transition: all ${({ theme }) => theme.transition.normal};
  line-height: ${({ theme }) => theme.lineHeights.loose};
  color: ${({ theme }) => theme.text.secondary};
  font-family: 'Inter', sans-serif;
`;

const MoveHandle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: move;
  margin-right: ${({ theme }) => theme.spacing[2]};
  color: ${({ theme }) => theme.colors.gray[400]};
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export interface CardProps {
  title: ReactNode;
  children: ReactNode;
  draggable?: boolean;
  onClose?: () => void;
  onMove?: (e: React.DragEvent<HTMLDivElement>) => void;
  className?: string;
}

const Card: React.FC<CardProps> = ({
  title,
  children,
  draggable = false,
  onClose,
  onMove,
  className,
}) => {
  const [isCompact, setIsCompact] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(true);
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(true);
    
    // Set the drag ghost image
    const dragImg = document.createElement('div');
    dragImg.style.width = '100px';
    dragImg.style.height = '30px';
    dragImg.style.backgroundColor = 'transparent';
    document.body.appendChild(dragImg);
    e.dataTransfer.setDragImage(dragImg, 50, 15);
    
    // Clean up the ghost element
    setTimeout(() => {
      document.body.removeChild(dragImg);
    }, 0);
    
    if (onMove) {
      onMove(e);
    }
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
  };
  
  const toggleContent = () => {
    setIsContentVisible(!isContentVisible);
  };
  
  return (
    <CardContainer 
      $isCompact={isCompact} 
      $isDragging={isDragging}
      className={className}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <CardHeader $isDraggable={draggable}>
        {draggable && (
          <MoveHandle>
            <FiMove size={16} />
          </MoveHandle>
        )}
        
        <CardTitle>{title}</CardTitle>
        
        <CardActions>
          <IconButton onClick={toggleContent}>
            {isContentVisible ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
          </IconButton>
          
          {onClose && (
            <IconButton onClick={onClose}>
              <FiX size={16} />
            </IconButton>
          )}
        </CardActions>
      </CardHeader>
      
      <CardContent 
        $isCompact={isCompact} 
        $isContentVisible={isContentVisible}
      >
        {children}
      </CardContent>
    </CardContainer>
  );
};

export default Card; 