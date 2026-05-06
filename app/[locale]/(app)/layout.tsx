import type { ReactNode } from 'react';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppTopbar } from '@/components/layout/AppTopbar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="theme-app app-shell"
      style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}
    >
      {/* Sidebar — oculta no mobile */}
      <div className="sidebar-wrapper">
        <AppSidebar />
      </div>

      {/* Main content area */}
      <main className="app-main">
        <AppTopbar />
        <div className="app-content">
          {children}
        </div>
      </main>

      {/* Bottom nav — visível só no mobile */}
      <MobileBottomNav />
    </div>
  );
}
