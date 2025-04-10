import { createGlobalStyle } from 'styled-components';
import theme from './theme';

const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
    padding: 0;
    margin: 0;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from { transform: translateY(10px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }

  html,
  body {
    max-width: 100vw;
    overflow-x: hidden;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: ${theme.lineHeights.normal};
    letter-spacing: -0.01em;
  }

  body {
    color: ${theme.text.primary};
    background: ${theme.gradients.subtle};
    min-height: 100vh;
  }

  a {
    color: ${theme.colors.primary};
    text-decoration: none;
    transition: color ${theme.transition.fast};
    
    &:hover {
      color: ${theme.colors.primaryHover};
      text-decoration: underline;
    }
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
    background: none;
    font-family: inherit;
    transition: all ${theme.transition.normal};
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: ${theme.fontWeights.bold};
    line-height: ${theme.lineHeights.tight};
    color: ${theme.colors.gray[900]};
    margin-bottom: 0.5em;
    font-family: 'Inter', sans-serif;
  }

  h1 {
    font-size: ${theme.fontSizes['5xl']};
    font-weight: ${theme.fontWeights.bold};
    letter-spacing: -0.02em;
  }

  h2 {
    font-size: ${theme.fontSizes['4xl']};
    letter-spacing: -0.02em;
  }

  h3 {
    font-size: ${theme.fontSizes['3xl']};
    letter-spacing: -0.01em;
  }

  h4 {
    font-size: ${theme.fontSizes['2xl']};
    letter-spacing: -0.01em;
  }

  h5 {
    font-size: ${theme.fontSizes.xl};
  }

  h6 {
    font-size: ${theme.fontSizes.md};
  }

  p {
    margin-bottom: 1rem;
    line-height: ${theme.lineHeights.loose};
  }

  input, textarea, select {
    font-family: 'Inter', sans-serif;
    font-size: ${theme.fontSizes.md};
  }

  .lead-text {
    font-family: 'Poppins', sans-serif;
    font-size: ${theme.fontSizes.xl};
    line-height: ${theme.lineHeights.loose};
  }

  .decorative-quote {
    font-family: 'Poppins', sans-serif;
    font-weight: ${theme.fontWeights.medium};
    font-size: ${theme.fontSizes['4xl']};
    line-height: 1.3;
  }

  .decorative-caps {
    font-family: 'Inter', sans-serif;
    font-weight: ${theme.fontWeights.bold};
    font-size: ${theme.fontSizes.xl};
    text-transform: uppercase;
    letter-spacing: 0.05em;
    line-height: ${theme.lineHeights.normal};
  }

  ul, ol {
    padding-left: 1.5rem;
    margin-bottom: 1rem;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  ::selection {
    background-color: ${theme.colors.primaryLight};
    color: ${theme.colors.primary};
  }

  @media (max-width: ${theme.breakpoints.sm}) {
    h1 {
      font-size: ${theme.fontSizes['3xl']};
    }

    h2 {
      font-size: ${theme.fontSizes['2xl']};
    }

    h3 {
      font-size: ${theme.fontSizes.xl};
    }

    h4 {
      font-size: ${theme.fontSizes.lg};
    }

    h5, h6 {
      font-size: ${theme.fontSizes.md};
    }

    .lead-text {
      font-size: ${theme.fontSizes.lg};
    }

    .decorative-quote {
      font-size: ${theme.fontSizes['2xl']};
    }
  }
`;

export default GlobalStyles; 