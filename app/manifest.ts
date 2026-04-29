import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'OddSeek',
    short_name: 'OddSeek',
    description: 'Apostas de Valor. Em Tempo Real.',
    start_url: '/pt/dashboard',
    display: 'standalone',
    background_color: '#090909',
    theme_color: '#090909',
    orientation: 'portrait',
    icons: [
      {
        src: '/og-image.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
