import React, { ReactNode } from 'react';
import styled from 'styled-components';

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.gradients.subtle};
  font-family: 'Inter', sans-serif;
  overflow-x: hidden; /* Prevent horizontal scrolling */
`;

const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem 1.5rem;
  flex: 1;
  animation: ${({ theme }) => theme.animation.fadeIn};
`;

const Footer = styled.footer`
  padding: ${({ theme }) => theme.spacing[8]} 0;
  text-align: center;
  border-top: 1px solid ${({ theme }) => theme.colors.gray[200]};
  background-color: ${({ theme }) => theme.background.paper};
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing[4]};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.gray[500]};
  line-height: ${({ theme }) => theme.lineHeights.loose};
`;

interface LayoutProps {
  children: ReactNode;
  fullWidthTop?: ReactNode; // New prop for full-width top content
}

const Layout: React.FC<LayoutProps> = ({ children, fullWidthTop }) => {
  return (
    <PageWrapper>
      {fullWidthTop && fullWidthTop}
      <Container>
        {children}
      </Container>
      
      <Footer>
        <FooterContent>
          <p>© {new Date().getFullYear()} Sitemap Generator. All rights reserved.</p>
        </FooterContent>
      </Footer>
    </PageWrapper>
  );
};

export default Layout; 