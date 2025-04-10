import React, { ReactNode, useState } from 'react';
import styled from 'styled-components';
import { FiMaximize2, FiMinimize2, FiX, FiMove, FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface CardContainerProps {
  $isCompact: boolean;
  $isExpanded: boolean;
  $isDragging?: boolean;
}

const CardContainer = styled.div<CardContainerProps>`
  background-color: ${({ theme }) => theme.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme, $isDragging }) => 
    $isDragging ? theme.shadows.xl : theme.shadows.md};
  transition: all ${({ theme }) => theme.transition.normal};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  overflow: hidden;
  position: relative;
  transform: ${({ $isDragging }) => $isDragging ? 'scale(1.02)' : 'scale(1)'};
  width: 100%;
  ${({ $isExpanded }) => $isExpanded ? `
    position: fixed;
    top: 5%;
    left: 5%;
    width: 90%;
    height: 90%;
    z-index: 1050;
  ` : ''}
  
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
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.gray[900]};
  flex: 1;
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
  color: ${({ theme }) => theme.colors.gray[600]};
  transition: all ${({ theme }) => theme.transition.fast};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.gray[200]};
    color: ${({ theme }) => theme.colors.gray[900]};
  }
`;

interface CardContentProps {
  $isCompact: boolean;
  $isExpanded: boolean;
  $isContentVisible: boolean;
}

const CardContent = styled.div<CardContentProps>`
  padding: ${({ theme, $isCompact }) => 
    $isCompact ? theme.spacing[2] : theme.spacing[4]};
  overflow-y: ${({ $isExpanded }) => $isExpanded ? 'auto' : 'hidden'};
  max-height: ${({ $isContentVisible, $isExpanded }) => 
    !$isContentVisible ? '0' : $isExpanded ? 'calc(90vh - 120px)' : '500px'};
  opacity: ${({ $isContentVisible }) => $isContentVisible ? 1 : 0};
  transition: all ${({ theme }) => theme.transition.normal};
`;

const MoveHandle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: move;
  margin-right: ${({ theme }) => theme.spacing[2]};
  color: ${({ theme }) => theme.colors.gray[400]};
  
  &:hover {
    color: ${({ theme }) => theme.colors.gray[600]};
  }
`;

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1040;
  animation: ${({ theme }) => theme.animation.fadeIn};
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
  const [isExpanded, setIsExpanded] = useState(false);
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
  
  const toggleCompact = () => {
    setIsCompact(!isCompact);
  };
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  const toggleContent = () => {
    setIsContentVisible(!isContentVisible);
  };
  
  return (
    <>
      {isExpanded && <Backdrop onClick={toggleExpand} />}
      <CardContainer 
        $isCompact={isCompact} 
        $isExpanded={isExpanded}
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
            
            <IconButton onClick={toggleCompact}>
              {isCompact ? <FiMaximize2 size={16} /> : <FiMinimize2 size={16} />}
            </IconButton>
            
            {!isExpanded && (
              <IconButton onClick={toggleExpand}>
                <FiMaximize2 size={16} />
              </IconButton>
            )}
            
            {isExpanded && (
              <IconButton onClick={toggleExpand}>
                <FiMinimize2 size={16} />
              </IconButton>
            )}
            
            {onClose && (
              <IconButton onClick={onClose}>
                <FiX size={16} />
              </IconButton>
            )}
          </CardActions>
        </CardHeader>
        
        <CardContent 
          $isCompact={isCompact} 
          $isExpanded={isExpanded}
          $isContentVisible={isContentVisible}
        >
          {children}
        </CardContent>
      </CardContainer>
    </>
  );
};

export default Card; 