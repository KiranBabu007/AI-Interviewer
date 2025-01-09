import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css'; 
import { dark } from '@clerk/themes';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider appearance={{
      baseTheme: dark,
  }}>
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