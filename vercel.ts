import { routes, type VercelConfig } from '@vercel/config/v1';

export const config: VercelConfig = {
  framework: 'nextjs',
  buildCommand: 'npm run build',
  headers: [
    routes.header('/(.*)', [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
    ]),
    routes.cacheControl('/brand/(.*)', {
      public: true,
      maxAge: '1 year',
      immutable: true,
    }),
  ],
  crons: [{ path: '/api/odds/refresh', schedule: '0 0 * * *' }],
};
