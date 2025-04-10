import React, { useState } from 'react';
import styled from 'styled-components';
import InputField from './InputField';
import Button from '../common/Button';
import { validateUrl } from '../../utils/url-validator';

const Form = styled.form`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing[4]};
`;

interface UrlInputProps {
  onSubmit: (url: string) => void;
  isLoading?: boolean;
}

const UrlInput: React.FC<UrlInputProps> = ({ onSubmit, isLoading }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    
    // Clear error when user starts typing
    if (error) {
      setError(undefined);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate URL
    const validation = validateUrl(url);
    
    if (!validation.isValid) {
      setError(validation.errorMessage);
      return;
    }
    
    // If valid, pass URL to parent
    onSubmit(url);
  };
  
  return (
    <Form onSubmit={handleSubmit}>
      <InputField
        label="Website URL"
        name="url"
        value={url}
        onChange={handleChange}
        placeholder="https://example.com"
        helpText="Enter the URL of the website you want to generate a sitemap for"
        required
        error={error}
      />
      
      <ButtonContainer>
        <Button 
          type="submit" 
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Generate Sitemap'}
        </Button>
      </ButtonContainer>
    </Form>
  );
};

export default UrlInput; 