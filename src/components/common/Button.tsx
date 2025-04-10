import React from 'react';
import styled from 'styled-components';
import { FiLoader, FiMap } from 'react-icons/fi';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';
type ButtonSize = 'sm' | 'md' | 'lg';

interface StyledButtonProps {
  $variant: ButtonVariant;
  $size: ButtonSize;
  $fullWidth?: boolean;
  $isLoading?: boolean;
  disabled?: boolean;
}

const getButtonStyles = (variant: ButtonVariant, theme: any) => {
  switch (variant) {
    case 'primary':
      return `
        background-color: ${theme.colors.primary};
        color: ${theme.colors.white};
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        font-weight: ${theme.fontWeights.semibold};
        
        &:hover:not(:disabled) {
          background-color: ${theme.colors.primaryHover};
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }
        
        &:active:not(:disabled) {
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transform: translateY(0);
        }
      `;
    case 'secondary':
      return `
        background-color: ${theme.colors.secondary};
        color: ${theme.colors.white};
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        
        &:hover:not(:disabled) {
          background-color: ${theme.colors.secondaryHover};
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
          transform: translateY(-1px);
        }
        
        &:active:not(:disabled) {
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          transform: translateY(0);
        }
      `;
    case 'outline':
      return `
        background-color: transparent;
        color: ${theme.colors.primary};
        border: 1px solid ${theme.colors.primary};
        
        &:hover:not(:disabled) {
          background-color: ${theme.colors.primaryLight};
          transform: translateY(-1px);
        }
        
        &:active:not(:disabled) {
          transform: translateY(0);
        }
      `;
    case 'text':
      return `
        background-color: transparent;
        color: ${theme.colors.primary};
        
        &:hover:not(:disabled) {
          background-color: ${theme.colors.primaryLight};
        }
      `;
    default:
      return '';
  }
};

const getSizeStyles = (size: ButtonSize, theme: any) => {
  switch (size) {
    case 'sm':
      return `
        padding: ${theme.spacing[2]} ${theme.spacing[3]};
        font-size: ${theme.fontSizes.sm};
        height: 40px;
        
        @media (max-width: ${theme.breakpoints.sm}) {
          padding: ${theme.spacing[1]} ${theme.spacing[3]};
          height: 36px;
        }
      `;
    case 'md':
      return `
        padding: ${theme.spacing[3]} ${theme.spacing[5]};
        font-size: ${theme.fontSizes.md};
        height: 48px;
        
        @media (max-width: ${theme.breakpoints.sm}) {
          padding: ${theme.spacing[2]} ${theme.spacing[4]};
          font-size: ${theme.fontSizes.sm};
          height: 40px;
        }
      `;
    case 'lg':
      return `
        padding: ${theme.spacing[4]} ${theme.spacing[8]};
        font-size: ${theme.fontSizes.lg};
        height: 56px;
        
        @media (max-width: ${theme.breakpoints.sm}) {
          padding: ${theme.spacing[3]} ${theme.spacing[6]};
          font-size: ${theme.fontSizes.md};
          height: 48px;
        }
      `;
    default:
      return '';
  }
};

const StyledButton = styled.button<StyledButtonProps>`
  border-radius: ${({ theme }) => theme.borderRadius.md}; /* 6px */
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transition.fast};
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
  position: relative;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
  
  ${({ $variant, theme }) => getButtonStyles($variant, theme)}
  ${({ $size, theme }) => getSizeStyles($size, theme)}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}30;
  }
  
  /* Add button shimmer effect */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to right,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: all 0.6s ease;
  }
  
  &:hover::after {
    left: 100%;
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    border-radius: ${({ theme }) => theme.borderRadius.sm};
  }
`;

const LoadingSpinner = styled.span`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ButtonContent = styled.span<{ $isLoading?: boolean }>`
  visibility: ${({ $isLoading }) => ($isLoading ? 'hidden' : 'visible')};
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    margin-right: 8px;
    
    @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
      margin-right: 6px;
    }
  }
`;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  children,
  disabled,
  icon,
  ...props
}) => {
  return (
    <StyledButton
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      $isLoading={loading}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <LoadingSpinner>
          <FiLoader size={size === 'sm' ? 14 : size === 'lg' ? 22 : 18} />
        </LoadingSpinner>
      )}
      <ButtonContent $isLoading={loading}>
        {icon || (variant === 'primary' && props.type === 'submit' && <FiMap />)}
        {children}
      </ButtonContent>
    </StyledButton>
  );
};

export default Button; 