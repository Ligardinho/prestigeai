// app/layout.tsx
import './globals.css';
import { ReactNode } from 'react';
import FloatingChatWidget from './components/FloatingChatWidget';

export const metadata = {
  title: 'AI Fitness Assistant',
  description: 'Your 24/7 personal training assistant',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <body className="relative" suppressHydrationWarning>
        {children}
        <FloatingChatWidget />
      </body>
    </html>
  );
}