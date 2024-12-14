import Navbar from '@/components/Navbar';
import React, { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div>
        <Navbar />
      {children}
    </div>
  );
}

export default Layout;