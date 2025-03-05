import DashboardNavbar from '@/components/DashboardNavbar';
import React, { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <DashboardNavbar />
      <main className="flex-grow pt-16">
        {children}
      </main>
    </div>
  );
}

export default Layout;