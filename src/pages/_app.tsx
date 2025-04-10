import React from 'react';
import { AppProps } from 'next/app';
import ThemeProvider from '../styles/ThemeProvider';
import '../styles/globals.css';

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
};

export default MyApp; 