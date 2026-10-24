import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppStateProvider } from '@/lib/store/app-state';
import Navbar from '@/components/layout/Navbar';
import InstallPrompt from '@/components/pwa/InstallPrompt';

export const metadata: Metadata = {
  title: 'AntiqueRide — Province-Wide Smart Transportation Platform',
  description:
    'Authorized tricycle booking, TODA terminal queue, and verified fare engine for San Jose de Buenavista and Antique, Philippines.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/icons/icon-192.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  applicationName: 'AntiqueRide',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AntiqueRide',
  },
};

export const viewport: Viewport = {
  themeColor: '#2563EB',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="h-full flex flex-col bg-[#F8FAFC] text-slate-900 antialiased selection:bg-blue-200">
        <AppStateProvider>
          <Navbar />
          <main className="flex-1 pb-16 sm:pb-0">{children}</main>
          <InstallPrompt />
        </AppStateProvider>
      </body>
    </html>
  );
}
