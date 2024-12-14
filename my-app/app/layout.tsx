import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css'; // Import your global CSS file

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <div>
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}