"use client"
import { ClerkProvider} from '@clerk/nextjs'
import './globals.css'
import Navbar from '@/components/Navbar'
import { usePathname } from 'next/navigation'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const path=usePathname()
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <main>
            {children}</main>
        </body>
      </html>
    </ClerkProvider>
  )
}