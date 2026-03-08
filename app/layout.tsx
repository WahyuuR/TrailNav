import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ToastProvider } from '@/components/UI/Toast'

export const metadata: Metadata = {
  title: 'TrailNav — Navigasi Medan',
  description: 'GPS tracking, import/export GPX, dan profil elevasi untuk pendaki',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TrailNav',
  },
  icons: { apple: '/icons/icon-192.png' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#00e5a0',
  // viewport-fit=cover unlocks safe-area-inset-* CSS env vars on iPhone
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Barlow+Condensed:wght@300;400;500;600;700&family=Barlow:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0a0d0f] text-white overflow-hidden h-dvh">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}
