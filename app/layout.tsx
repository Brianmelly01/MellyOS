import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'MellyOS — Your World. Connected.',
    template: '%s | MellyOS',
  },
  description:
    'MellyOS is a centralized platform to manage multiple websites and receive real-time notifications from all of them in one place.',
  keywords: ['dashboard', 'multi-site', 'notifications', 'SaaS', 'ecommerce management'],
  authors: [{ name: 'MellyOS' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'MellyOS — Your World. Connected.',
    description: 'Centralized platform to manage multiple websites and real-time notifications.',
    siteName: 'MellyOS',
  },
}

export const viewport: Viewport = {
  themeColor: '#0d0f1a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
