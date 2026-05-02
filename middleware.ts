import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const SECURITY_HEADERS: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'X-DNS-Prefetch-Control': 'on',
};

const intlMiddleware = createMiddleware(routing);

const PROTECTED_SEGMENTS = [
  'dashboard',
  'odds',
  'tips',
  'multiplas',
  'banca',
  'comunidade',
  'community',
  'ranking',
  'perfil',
  'profile',
  'configuracoes',
  'settings',
];

function applySecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }
  return response;
}

function isProtectedPath(pathname: string): boolean {
  // pathname looks like /pt-BR/dashboard or /en/banca
  const segments = pathname.split('/').filter(Boolean);
  // segments[0] is locale, segments[1] is the page segment
  return segments.length >= 2 && PROTECTED_SEGMENTS.includes(segments[1]);
}

function hasSession(request: NextRequest): boolean {
  return !!(
    request.cookies.get('authjs.session-token')?.value ??
    request.cookies.get('__Secure-authjs.session-token')?.value
  );
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    process.env.NODE_ENV === 'production' &&
    request.nextUrl.protocol === 'http:' &&
    !request.headers.get('host')?.startsWith('localhost')
  ) {
    const url = request.nextUrl.clone();
    url.protocol = 'https:';
    return NextResponse.redirect(url, 308);
  }

  if (isProtectedPath(pathname) && !hasSession(request)) {
    const url = request.nextUrl.clone();
    const locale = pathname.split('/')[1] ?? 'pt-BR';
    url.pathname = `/${locale}/login`;
    url.searchParams.set('next', pathname);
    return applySecurityHeaders(NextResponse.redirect(url));
  }

  const response = intlMiddleware(request);
  return applySecurityHeaders(response as NextResponse);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.(?:ico|png|jpg|jpeg|svg|webp|gif|xml|txt|webmanifest)$|brand/).*)'],
};
