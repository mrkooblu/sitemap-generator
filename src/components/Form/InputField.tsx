import React from 'react';
import styled from 'styled-components';

const InputContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  width: 100%;
`;

const Label = styled.label`
  display: block;
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  color: ${({ theme }) => theme.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-family: 'Inter', sans-serif;
`;

const RequiredStar = styled.span`
  color: ${({ theme }) => theme.colors.danger};
  margin-left: ${({ theme }) => theme.spacing[1]};
`;

interface StyledInputProps {
  $hasError?: boolean;
}

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const StyledInput = styled.input<StyledInputProps>`
  width: 100%;
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
  border: 1px solid ${({ theme, $hasError }) => 
    $hasError ? theme.colors.danger : theme.border.main};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  line-height: 1.5;
  color: ${({ theme }) => theme.text.primary};
  background-color: ${({ theme }) => theme.colors.white};
  transition: all ${({ theme }) => theme.transition.fast};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  font-family: 'Inter', sans-serif;
  height: 48px;
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.gray[400]};
  }
  
  &:hover {
    border-color: ${({ theme, $hasError }) => 
      $hasError ? theme.colors.danger : theme.colors.primary};
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme, $hasError }) => 
      $hasError ? theme.colors.danger : theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme, $hasError }) => 
      $hasError 
        ? `${theme.colors.danger}20` 
        : `${theme.colors.primary}20`};
  }
  
  &:disabled {
    background-color: ${({ theme }) => theme.colors.gray[100]};
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const HelpText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.gray[500]};
  margin-top: ${({ theme }) => theme.spacing[1]};
  margin-bottom: 0;
  font-family: 'Inter', sans-serif;
`;

const ErrorText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.danger};
  margin-top: ${({ theme }) => theme.spacing[1]};
  margin-bottom: 0;
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  font-family: 'Inter', sans-serif;
`;

interface InputFieldProps {
  label?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  required?: boolean;
  helpText?: string;
  error?: string;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  required = false,
  helpText,
  error,
  placeholder,
  type = 'text',
  disabled = false,
}) => {
  return (
    <InputContainer>
      {label && (
        <Label htmlFor={name}>
          {label}
          {required && <RequiredStar>*</RequiredStar>}
        </Label>
      )}
      
      <InputWrapper>
        <StyledInput
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          $hasError={!!error}
          required={required}
          placeholder={placeholder}
          type={type}
          autoComplete="off"
          disabled={disabled}
        />
      </InputWrapper>
      
      {helpText && !error && <HelpText>{helpText}</HelpText>}
      {error && <ErrorText>{error}</ErrorText>}
    </InputContainer>
  );
};

export default InputField; 