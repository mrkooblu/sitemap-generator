import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    fontSizes: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
      '5xl': string;
    };
    fontWeights: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
      extrabold: number;
    };
    lineHeights: {
      tight: number;
      normal: number;
      loose: number;
    };
    spacing: {
      0: string;
      1: string;
      2: string;
      3: string;
      4: string;
      5: string;
      6: string;
      8: string;
      10: string;
      12: string;
      16: string;
    };
    borderRadius: {
      none: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      full: string;
    };
    shadows: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
      inset: string;
    };
    breakpoints: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    colors: {
      primary: string;
      primaryHover: string;
      primaryLight: string;
      secondary: string;
      secondaryHover: string;
      secondaryLight: string;
      accent: string;
      success: string;
      danger: string;
      warning: string;
      info: string;
      white: string;
      black: string;
      gray: {
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
      };
    };
    background: {
      primary: string;
      secondary: string;
      paper: string;
    };
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
    border: {
      light: string;
      main: string;
      dark: string;
    };
    transition: {
      fast: string;
      normal: string;
      slow: string;
      bounce: string;
    };
    animation: {
      fadeIn: string;
      slideUp: string;
      pulse: string;
    };
    gradients: {
      subtle: string;
      primary: string;
      blue: string;
      purple: string;
    };
  }
} 