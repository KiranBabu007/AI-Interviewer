import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css'; 
import { dark } from '@clerk/themes';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from "@vercel/analytics/react"


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider appearance={{
      baseTheme: dark,
  }}>
      <html lang="en">
        <body>
          <div>
            {children}
            <SpeedInsights />
            <Analytics />
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}