import localFont from "next/font/local";
import "./globals.css";
import { ClerkProvider, SignInButton} from "@clerk/nextjs";
import { dark } from '@clerk/themes'


const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "AI Interviewer",
  description: "Meet Your Future, Faster: Our AI Interviewer Transforms Job Screening with Real-Time Insights and Unbiased Precision – Start Your Journey with the Interviewer of Tomorrow!",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider  appearance={{
      baseTheme: dark
    }}
      >
      <html>
        
          <body>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
