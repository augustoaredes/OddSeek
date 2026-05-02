import type { Metadata } from 'next';
import { Barlow, Barlow_Condensed, Instrument_Serif, Space_Grotesk } from 'next/font/google';
import './globals.css';

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-cond',
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'OddSeek — Apostas de Valor. Em Tempo Real.',
    template: '%s | OddSeek',
  },
  description:
    'Plataforma de inteligência esportiva: agregue odds de várias casas, identifique apostas com EV+ e gerencie sua banca como um profissional. OddSeek não é uma casa de apostas.',
  metadataBase: new URL('https://oddseek.vercel.app'),
  icons: {
    icon: [{ url: '/icon.png', sizes: '512x512', type: 'image/png' }],
    apple: '/apple-touch-icon.png',
    shortcut: '/icon.png',
  },
  openGraph: {
    title: 'OddSeek — Apostas de Valor. Em Tempo Real.',
    description:
      'Inteligência esportiva, comparador de odds, tips com EV+ e gestão de banca profissional.',
    url: 'https://oddseek.vercel.app',
    siteName: 'OddSeek',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: '/og-image.png', width: 512, height: 512, alt: 'OddSeek' }],
  },
  twitter: {
    card: 'summary',
    title: 'OddSeek',
    description: 'Inteligência esportiva. EV+. Banca profissional.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${barlow.variable} ${barlowCondensed.variable} ${instrumentSerif.variable} ${spaceGrotesk.variable}`}
    >
      <body>
        {/* Runs before React hydration to prevent flash of wrong theme */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme')||'light';document.documentElement.dataset.theme=t;}catch(e){}})();` }} />
        {children}
      </body>
    </html>
  );
}
