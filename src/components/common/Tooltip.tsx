import React, { useState, ReactNode, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FiInfo } from 'react-icons/fi';

interface TooltipContainerProps {
  $position: TooltipPosition;
  $visible: boolean;
}

const TooltipContainer = styled.div<TooltipContainerProps>`
  position: absolute;
  background-color: ${({ theme }) => theme.colors.gray[800]};
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  max-width: 300px;
  width: max-content;
  z-index: 1000;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  visibility: ${({ $visible }) => ($visible ? 'visible' : 'hidden')};
  transition: opacity ${({ theme }) => theme.transition.normal}, 
              visibility ${({ theme }) => theme.transition.normal};
  line-height: 1.4;
  
  @media (max-width: 768px) {
    max-width: 250px;
    font-size: 0.75rem;
    padding: 0.4rem 0.6rem;
  }
  
  ${({ $position }) => {
    switch ($position) {
      case 'top':
        return `
          bottom: calc(100% + 5px);
          left: 50%;
          transform: translateX(-50%);
          
          &::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            margin-left: -5px;
            border-width: 5px;
            border-style: solid;
            border-color: #1F2937 transparent transparent transparent;
          }
        `;
      case 'bottom':
        return `
          top: calc(100% + 5px);
          left: 50%;
          transform: translateX(-50%);
          
          &::after {
            content: '';
            position: absolute;
            bottom: 100%;
            left: 50%;
            margin-left: -5px;
            border-width: 5px;
            border-style: solid;
            border-color: transparent transparent #1F2937 transparent;
          }
        `;
      case 'left':
        return `
          right: calc(100% + 5px);
          top: 50%;
          transform: translateY(-50%);
          
          &::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 100%;
            margin-top: -5px;
            border-width: 5px;
            border-style: solid;
            border-color: transparent transparent transparent #1F2937;
          }
        `;
      case 'right':
        return `
          left: calc(100% + 5px);
          top: 50%;
          transform: translateY(-50%);
          
          &::after {
            content: '';
            position: absolute;
            top: 50%;
            right: 100%;
            margin-top: -5px;
            border-width: 5px;
            border-style: solid;
            border-color: transparent #1F2937 transparent transparent;
          }
        `;
      default:
        return '';
    }
  }}
`;

const IconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-left: ${({ theme }) => theme.spacing[1]};
  color: ${({ theme }) => theme.colors.primary};
  position: relative;
`;

const InfoIconContainer = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all ${({ theme }) => theme.transition.fast};
  
  &:hover {
    color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  content: ReactNode;
  position?: TooltipPosition;
  children?: ReactNode;
  showIcon?: boolean;
  iconSize?: number;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = 'top',
  children,
  showIcon = true,
  iconSize = 16,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current && 
        !tooltipRef.current.contains(event.target as Node) &&
        isVisible
      ) {
        setIsVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible]);

  return (
    <IconWrapper
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={tooltipRef}
    >
      {children || (showIcon && (
        <InfoIconContainer>
          <FiInfo size={iconSize} />
        </InfoIconContainer>
      ))}
      <TooltipContainer $position={position} $visible={isVisible}>
        {content}
      </TooltipContainer>
    </IconWrapper>
  );
};

export default Tooltip; 