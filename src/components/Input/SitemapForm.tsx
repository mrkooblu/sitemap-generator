import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import Button from '../common/Button';
import { FiGlobe, FiSettings, FiChevronDown, FiChevronUp, FiCheck, FiAlertCircle, FiInfo } from 'react-icons/fi';

const FormContainer = styled.div<{ $inactive?: boolean }>`
  background-color: ${({ theme }) => theme.background.paper};
  background-image: radial-gradient(${({ theme }) => theme.colors.gray[100]} 1px, transparent 1px);
  background-size: 20px 20px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  padding: ${({ theme }) => theme.spacing[10]};
  width: 100%;
  max-width: 1152px;
  margin: 2rem auto;
  transition: box-shadow ${({ theme }) => theme.transition.normal}, transform 0.3s ease, opacity 0.3s ease;
  opacity: ${({ $inactive }) => $inactive ? 0.7 : 1};
  
  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.xl};
    transform: translateY(-2px);
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: ${({ theme }) => theme.spacing[4]};
    margin: 1rem auto;
  }
`;

const FormHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing[8]};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    margin-bottom: ${({ theme }) => theme.spacing[4]};
  }
`;

const FormTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  color: ${({ theme }) => theme.colors.gray[900]};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: ${({ theme }) => theme.fontSizes['2xl']};
    margin-bottom: ${({ theme }) => theme.spacing[1]};
  }
`;

const FormSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.gray[600]};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  max-width: 600px;
  margin: 0 auto;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: ${({ theme }) => theme.fontSizes.md};
    line-height: ${({ theme }) => theme.lineHeights.normal};
    max-width: 100%;
  }
`;

const InputGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const InputLabel = styled.label`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.gray[800]};
  display: flex;
  align-items: center;
`;

const TooltipIcon = styled(FiInfo)`
  margin-left: ${({ theme }) => theme.spacing[2]};
  color: ${({ theme }) => theme.colors.gray[500]};
  cursor: help;
  position: relative;
  font-size: 16px;
  
  &:hover + div {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing[3]};
  margin-top: ${({ theme }) => theme.spacing[1]};
`;

const Input = styled.input<{ $hasError?: boolean, $isValid?: boolean }>`
  width: 100%;
  padding: ${({ theme }) => `${theme.spacing[5]} ${theme.spacing[4]}`};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  border: 2px solid ${({ theme, $hasError, $isValid }) => 
    $hasError ? theme.colors.danger : 
    $isValid ? theme.colors.success : 
    theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  transition: all ${({ theme }) => theme.transition.normal};
  box-shadow: ${({ $hasError, $isValid, theme }) => 
    $hasError ? `0 0 0 3px ${theme.colors.danger}20` : 
    $isValid ? `0 0 0 3px ${theme.colors.success}20` : 
    `0 2px 4px rgba(0, 0, 0, 0.05)`};
  
  &:focus {
    outline: none;
    border-color: ${({ theme, $hasError }) => $hasError ? theme.colors.danger : theme.colors.primary};
    box-shadow: ${({ theme, $hasError }) => 
      $hasError ? `0 0 0 3px ${theme.colors.danger}20` : 
      `0 0 0 3px ${theme.colors.primary}30, 0 4px 10px rgba(0, 0, 0, 0.07)`};
    transform: translateY(-1px);
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.gray[400]};
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: ${({ theme }) => `${theme.spacing[3]} ${theme.spacing[3]}`};
    font-size: ${({ theme }) => theme.fontSizes.md};
  }
`;

const ValidationIcon = styled.div<{ $isValid?: boolean, $hasError?: boolean }>`
  position: absolute;
  right: ${({ theme }) => theme.spacing[4]};
  color: ${({ theme, $isValid, $hasError }) => 
    $isValid ? theme.colors.success : 
    $hasError ? theme.colors.danger : 
    'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${({ theme }) => theme.transition.normal};
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-top: ${({ theme }) => theme.spacing[1]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  display: flex;
  align-items: center;
  animation: ${({ theme }) => theme.animation.slideUp};
  
  svg {
    margin-right: ${({ theme }) => theme.spacing[1]};
  }
`;

const AdvancedOptionsToggle = styled.button<{ $isOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: ${({ theme }) => theme.spacing[4]};
  color: ${({ theme }) => theme.colors.gray[800]};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  background-color: ${({ theme, $isOpen }) => $isOpen ? theme.colors.primaryLight : theme.colors.gray[50]};
  border: 1px solid ${({ theme, $isOpen }) => $isOpen ? theme.colors.primary + '40' : theme.colors.gray[200]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.3s ease;
  margin: ${({ theme }) => theme.spacing[6]} 0;
  box-shadow: ${({ $isOpen, theme }) => $isOpen ? `0 4px 12px rgba(0, 0, 0, 0.1)` : 'none'};
  position: relative;
  overflow: hidden;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: ${({ theme }) => theme.spacing[3]};
    margin: ${({ theme }) => theme.spacing[4]} 0;
    font-size: ${({ theme }) => theme.fontSizes.sm};
    
    .options-preview {
      font-size: ${({ theme }) => theme.fontSizes.xs};
    }
    
    .settings-icon, .chevron-icon {
      width: 18px;
      height: 18px;
    }
  }

  &:hover {
    background-color: ${({ theme, $isOpen }) => $isOpen ? theme.colors.primaryLight : theme.colors.gray[100]};
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: ${({ $isOpen }) => $isOpen ? '100%' : '0%'};
    height: 3px;
    background-color: ${({ theme }) => theme.colors.primary};
    transition: width 0.3s ease;
  }
  
  .toggle-section {
    display: flex;
    align-items: center;
  }
  
  .options-preview {
    color: ${({ theme }) => theme.colors.gray[500]};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: ${({ theme }) => theme.fontWeights.normal};
    display: flex;
    align-items: center;
    background-color: ${({ theme }) => theme.colors.gray[100]};
    padding: ${({ theme }) => theme.spacing[1]} ${({ theme }) => theme.spacing[3]};
    border-radius: ${({ theme }) => theme.borderRadius.full};
  }
  
  svg.settings-icon {
    margin-right: ${({ theme }) => theme.spacing[2]};
    color: ${({ theme, $isOpen }) => $isOpen ? theme.colors.primary : theme.colors.gray[600]};
    transform: ${({ $isOpen }) => $isOpen ? 'rotate(90deg)' : 'rotate(0deg)'};
    transition: transform 0.3s ease, color 0.3s ease;
  }
  
  svg.chevron-icon {
    transition: transform 0.3s ease;
    transform: ${({ $isOpen }) => $isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  }
`;

const AdvancedOptionsContent = styled.div<{ $isOpen: boolean }>`
  max-height: ${({ $isOpen }) => ($isOpen ? '500px' : '0')};
  overflow: hidden;
  transition: max-height 0.4s ease, opacity 0.3s ease, transform 0.3s ease;
  opacity: ${({ $isOpen }) => ($isOpen ? '1' : '0')};
  transform: ${({ $isOpen }) => $isOpen ? 'translateY(0)' : 'translateY(-10px)'};
  margin-bottom: ${({ $isOpen, theme }) => ($isOpen ? theme.spacing[6] : '0')};
  background-color: ${({ theme }) => theme.colors.gray[50]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ $isOpen, theme }) => ($isOpen ? theme.spacing[5] : '0')};
  border: ${({ $isOpen, theme }) => $isOpen ? `1px solid ${theme.colors.gray[200]}` : 'none'};
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  
  > div {
    display: flex;
    flex-direction: column;
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing[3]};
  }
`;

const CheckboxGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing[3]};
  border: 1px solid ${({ theme }) => theme.colors.gray[200]};
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.gray[300]};
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  position: relative;
`;

const StyledCheckbox = styled.input`
  margin-right: ${({ theme }) => theme.spacing[3]};
  cursor: pointer;
  width: 18px;
  height: 18px;
  accent-color: ${({ theme }) => theme.colors.primary};
`;

const LabelText = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.gray[700]};
  display: flex;
  align-items: center;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing[8]};
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -${({ theme }) => theme.spacing[4]};
    left: 50%;
    transform: translateX(-50%);
    width: 60%;
    height: 1px;
    background: linear-gradient(
      to right,
      rgba(0, 0, 0, 0),
      rgba(0, 0, 0, 0.1),
      rgba(0, 0, 0, 0)
    );
  }
`;

const LabelContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const FormatIndicator = styled.div`
  color: ${({ theme }) => theme.colors.gray[500]};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-top: ${({ theme }) => theme.spacing[1]};
  display: flex;
  align-items: center;
  
  span {
    margin-left: ${({ theme }) => theme.spacing[1]};
  }
`;

const Tooltip = styled.div`
  position: absolute;
  background-color: ${({ theme }) => theme.colors.gray[900]};
  color: white;
  padding: ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  z-index: 10;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  margin-top: ${({ theme }) => theme.spacing[1]};
  font-weight: ${({ theme }) => theme.fontWeights.normal};
  line-height: 1.5;
  pointer-events: none;
  width: 270px;
  
  /* Position tooltip differently based on its parent container */
  ${CheckboxGroup}:last-child &,
  ${CheckboxGroup}:nth-last-child(2) & {
    /* For the last two checkbox groups (robots.txt is the last one) */
    top: auto;
    bottom: calc(100% + 10px);
    left: 0;
    
    &::before {
      content: '';
      position: absolute;
      top: 100%;
      left: 16px;
      border-width: 6px;
      border-style: solid;
      border-color: ${({ theme }) => theme.colors.gray[900]} transparent transparent transparent;
    }
  }
  
  /* Default positioning for other tooltips */
  ${CheckboxGroup}:not(:last-child):not(:nth-last-child(2)) &,
  ${LabelContainer} & {
    top: 100%;
    left: 0;
    
    &::before {
      content: '';
      position: absolute;
      bottom: 100%;
      left: 16px;
      border-width: 6px;
      border-style: solid;
      border-color: transparent transparent ${({ theme }) => theme.colors.gray[900]} transparent;
    }
  }
  
  /* Make tooltip visible on hover */
  ${TooltipIcon}:hover + & {
    opacity: 1;
    visibility: visible;
  }
`;

const OptionLabelContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

interface SitemapFormProps {
  onSubmit: (url: string, options: any) => void;
  isLoading: boolean;
}

const SitemapForm: React.FC<SitemapFormProps> = ({ onSubmit, isLoading }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [options, setOptions] = useState({
    maxDepth: 5,
    includeImages: true,
    excludeNoindex: true,
    respectRobotsTxt: true,
    changeFrequency: 'weekly',
    priority: 0.7,
    maxPages: 2000,
  });
  
  // Auto-focus the input field on component mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  const toggleAdvancedOptions = () => {
    setShowAdvancedOptions(!showAdvancedOptions);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setUrl(inputValue);
    
    if (inputValue.length > 0) {
      // Auto-detect protocol
      if (!inputValue.startsWith('http://') && !inputValue.startsWith('https://')) {
        // Only update if we're not already in the middle of editing the protocol
        if (!inputValue.includes('://')) {
          // Don't modify value if user is still typing the protocol
          if (!inputValue.startsWith('http') && !inputValue.startsWith('https')) {
            setUrl('https://' + inputValue);
          }
        }
      }
      
      // Validate on each change
      validateUrl(inputValue) ? setIsValid(true) : setIsValid(false);
    } else {
      setIsValid(false);
    }
    
    setError(null);
  };
  
  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setOptions({
      ...options,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
  
  const validateUrl = (url: string): boolean => {
    if (!url) {
      setError('Please enter a URL');
      return false;
    }
    
    // If no protocol is specified, prepend https://
    let urlToTest = url;
    if (!url.match(/^https?:\/\//)) {
      urlToTest = 'https://' + url;
    }
    
    try {
      new URL(urlToTest);
      setError(null);
      return true;
    } catch (err) {
      setError('Please enter a valid URL');
      return false;
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Automatically add https:// if no protocol is provided
    let formattedUrl = url;
    if (!url.match(/^https?:\/\//)) {
      formattedUrl = 'https://' + url;
    }
    
    if (validateUrl(formattedUrl)) {
      // Prevent any potential form submission
      e.stopPropagation();
      
      // Call the onSubmit callback directly
      onSubmit(formattedUrl, options);
      
      // Return false to prevent any default form action
      return false;
    }
  };
  
  return (
    <FormContainer $inactive={isLoading}>
      <form 
        onSubmit={handleSubmit} 
        target="_self" 
        rel="noopener noreferrer"
      >
        <LabelContainer>
          <InputLabel htmlFor="website-url">
            Enter your website URL
            <TooltipIcon />
            <Tooltip>
              Include the full URL of your website with the protocol (http:// or https://). 
              For best results, use your domain's root URL like example.com rather than specific pages.
            </Tooltip>
          </InputLabel>
        </LabelContainer>
        <InputWrapper>
          <Input
            id="website-url"
            type="text"
            value={url}
            onChange={handleChange}
            placeholder="example.com or https://example.com"
            $hasError={!!error}
            $isValid={isValid && !error && url.length > 0}
            disabled={isLoading}
            ref={inputRef}
          />
          <ValidationIcon $isValid={isValid && !error && url.length > 0} $hasError={!!error}>
            {isValid && !error && url.length > 0 ? <FiCheck /> : error ? <FiAlertCircle /> : null}
          </ValidationIcon>
        </InputWrapper>
        {error && (
          <ErrorMessage>
            <FiAlertCircle size={14} />
            {error}
          </ErrorMessage>
        )}
        {!error && (
          <FormatIndicator>
            <FiInfo size={12} />
            <span>Format: https://yourdomain.com</span>
          </FormatIndicator>
        )}
        
        <AdvancedOptionsToggle 
          type="button" 
          onClick={toggleAdvancedOptions}
          $isOpen={showAdvancedOptions}
        >
          <div className="toggle-section">
            <FiSettings size={22} className="settings-icon" />
            Advanced Options
          </div>
          
          {!showAdvancedOptions && (
            <div className="options-preview">
              Depth: {options.maxDepth}, URLs: {options.maxPages}, Images: {options.includeImages ? 'Yes' : 'No'}
              <FiChevronDown size={18} className="chevron-icon" style={{ marginLeft: '8px' }} />
            </div>
          )}
          
          {showAdvancedOptions && (
            <FiChevronUp size={18} className="chevron-icon" />
          )}
        </AdvancedOptionsToggle>
        
        <AdvancedOptionsContent $isOpen={showAdvancedOptions}>
          <OptionsGrid>
            <div>
              <OptionLabelContainer>
                <InputLabel htmlFor="maxDepth">Maximum Crawl Depth</InputLabel>
                <TooltipIcon />
                <Tooltip>
                  Sets how deep the crawler will go into your site's structure. 
                  A value of 1 means only the homepage, 2 includes pages linked from the homepage, and so on.
                </Tooltip>
              </OptionLabelContainer>
              <Input
                id="maxDepth"
                name="maxDepth"
                type="number"
                min="1"
                max="10"
                value={options.maxDepth}
                onChange={handleOptionChange}
                $hasError={false}
                $isValid={true}
              />
            </div>
            
            <div>
              <OptionLabelContainer>
                <InputLabel htmlFor="maxPages">Maximum URLs to Crawl</InputLabel>
                <TooltipIcon />
                <Tooltip>
                  Sets the maximum number of URLs to include in your sitemap.
                  Increase this value for larger sites, or decrease it for quicker results.
                </Tooltip>
              </OptionLabelContainer>
              <Input
                id="maxPages"
                name="maxPages"
                type="number"
                min="10"
                max="5000"
                step="10"
                value={options.maxPages}
                onChange={handleOptionChange}
                $hasError={false}
                $isValid={true}
              />
            </div>
            
            <div>
              <OptionLabelContainer>
                <InputLabel htmlFor="priority">Page Priority</InputLabel>
                <TooltipIcon />
                <Tooltip>
                  Sets the importance of pages in your sitemap. 
                  Values range from 0.0 (lowest) to 1.0 (highest). Helps search engines identify your most important pages.
                </Tooltip>
              </OptionLabelContainer>
              <Input
                id="priority"
                name="priority"
                type="number"
                min="0.0"
                max="1.0"
                step="0.1"
                value={options.priority}
                onChange={handleOptionChange}
                $hasError={false}
                $isValid={true}
              />
            </div>
          </OptionsGrid>
          
          <CheckboxGroup>
            <CheckboxLabel>
              <StyledCheckbox
                type="checkbox"
                name="includeImages"
                checked={options.includeImages}
                onChange={handleOptionChange}
              />
              <LabelText>
                Include image information
                <TooltipIcon />
                <Tooltip>
                  Adds image metadata to your sitemap, helping search engines discover and index your images.
                  This improves visibility in image search results.
                </Tooltip>
              </LabelText>
            </CheckboxLabel>
          </CheckboxGroup>
          
          <CheckboxGroup>
            <CheckboxLabel>
              <StyledCheckbox
                type="checkbox"
                name="excludeNoindex"
                checked={options.excludeNoindex}
                onChange={handleOptionChange}
              />
              <LabelText>
                Exclude pages with noindex tag
                <TooltipIcon />
                <Tooltip>
                  Skips pages with the "noindex" meta tag. These pages are instructed not to be indexed by
                  search engines, so they shouldn't be included in your sitemap.
                </Tooltip>
              </LabelText>
            </CheckboxLabel>
          </CheckboxGroup>
          
          <CheckboxGroup>
            <CheckboxLabel>
              <StyledCheckbox
                type="checkbox"
                name="respectRobotsTxt"
                checked={options.respectRobotsTxt}
                onChange={handleOptionChange}
              />
              <LabelText>
                Respect robots.txt rules
                <TooltipIcon />
                <Tooltip>
                  Follows the rules in your robots.txt file when crawling. Pages blocked by robots.txt
                  won't be included in the sitemap.
                </Tooltip>
              </LabelText>
            </CheckboxLabel>
          </CheckboxGroup>
        </AdvancedOptionsContent>
        
        <FormActions>
          <Button 
            type="button" 
            loading={isLoading}
            size="lg"
            onClick={(e) => {
              e.preventDefault();
              if (!isLoading) {
                handleSubmit(new Event('submit') as any);
              }
            }}
          >
            GENERATE SITEMAP
          </Button>
        </FormActions>
      </form>
    </FormContainer>
  );
};

export default SitemapForm; 