'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== '/' && pathname.startsWith(href + '/'));
}

export function MobileBottomNav() {
  const locale = useLocale();
  const pathname = usePathname();

  const items = [
    {
      href: `/${locale}/dashboard`,
      label: 'Dashboard',
      icon: (
        <svg width="20" height="20" viewBox="0 0 14 14" fill="none">
          <rect x="1.5" y="1.5" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
          <rect x="8" y="1.5" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
          <rect x="1.5" y="8" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
          <rect x="8" y="8" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
        </svg>
      ),
    },
    {
      href: `/${locale}/tips`,
      label: 'Tips',
      icon: (
        <svg width="20" height="20" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="5" r="3" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M2 13c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      href: `/${locale}/odds`,
      label: 'Odds',
      icon: (
        <svg width="20" height="20" viewBox="0 0 14 14" fill="none">
          <path d="M3 7h8M5 4l-2 3 2 3M9 4l2 3-2 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      href: `/${locale}/banca`,
      label: 'Banca',
      icon: (
        <svg width="20" height="20" viewBox="0 0 14 14" fill="none">
          <rect x="1.5" y="4" width="11" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M4 4V3a2 2 0 014 0v1" stroke="currentColor" strokeWidth="1.3"/>
          <circle cx="7" cy="8" r="1" fill="currentColor"/>
        </svg>
      ),
    },
    {
      href: `/${locale}/comunidade`,
      label: 'Social',
      icon: (
        <svg width="20" height="20" viewBox="0 0 14 14" fill="none">
          <circle cx="5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
          <circle cx="10" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M1 13c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          <path d="M10 9c1.7 0 3 1.3 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      href: `/${locale}/configuracoes`,
      label: 'Conta',
      icon: (
        <svg width="20" height="20" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="1.8" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M7 1.5v1.8M7 10.7v1.8M1.5 7h1.8M10.7 7h1.8M3.1 3.1l1.3 1.3M9.6 9.6l1.3 1.3M3.1 10.9l1.3-1.3M9.6 4.4l1.3-1.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      ),
    },
  ];

  return (
    <nav className="mobile-bottom-nav">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`mobile-nav-item${active ? ' active' : ''}`}
          >
            {item.icon}
            <span className="mobile-nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
