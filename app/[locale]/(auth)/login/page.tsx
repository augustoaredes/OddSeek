import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { LoginForm } from './LoginForm';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth' });
  return { title: t('login_title') };
}

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { next } = await searchParams;
  const t = await getTranslations('auth');

  return (
    <div
      className="card"
      style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: 24 }}
    >
      <div>
        <h1 style={{ fontFamily: 'var(--font-cond)', fontSize: 28, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.01em', marginBottom: 6 }}>
          {t('login_title')}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>{t('login_sub')}</p>
      </div>

      <LoginForm locale={locale} next={next} />

      <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>
        {t('no_account')}{' '}
        <Link href={`/${locale}/registro`} style={{ color: 'var(--lime)', fontWeight: 600 }}>
          {t('signup_link')}
        </Link>
      </p>
    </div>
  );
}
