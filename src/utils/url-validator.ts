/**
 * Validates if a string is a proper URL
 * @param url - The URL string to validate
 * @returns Object with isValid flag and any error message
 */
export const validateUrl = (url: string): { isValid: boolean; errorMessage?: string } => {
  // Check if URL is empty
  if (!url || url.trim() === '') {
    return {
      isValid: false,
      errorMessage: 'URL is required',
    };
  }

  // Check if URL has a protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return {
      isValid: false,
      errorMessage: 'URL must start with http:// or https://',
    };
  }

  // Try to create a URL object (will throw if URL is invalid)
  try {
    new URL(url);
    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      errorMessage: 'Invalid URL format',
    };
  }
};

/**
 * Ensures URL has correct protocol and format
 * @param url - URL to normalize
 * @returns Normalized URL
 */
export const normalizeUrl = (url: string): string => {
  let normalizedUrl = url.trim();
  
  // Add protocol if missing
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = `https://${normalizedUrl}`;
  }
  
  // Remove trailing slash if present
  if (normalizedUrl.endsWith('/')) {
    normalizedUrl = normalizedUrl.slice(0, -1);
  }
  
  return normalizedUrl;
}; 