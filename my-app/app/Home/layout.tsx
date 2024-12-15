import React, { ReactNode } from 'react';

import Navbar from '../../components/Navbar';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div>
      
      {children}
    </div>
  );
}

export default Layout;