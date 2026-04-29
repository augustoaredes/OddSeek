import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { RegisterForm } from './RegisterForm';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth' });
  return { title: t('register_title') };
}

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function RegisterPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations('auth');

  return (
    <div className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-cond)', fontSize: 28, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.01em', marginBottom: 6 }}>
          {t('register_title')}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>{t('register_sub')}</p>
      </div>

      <RegisterForm locale={locale} />

      <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>
        {t('have_account')}{' '}
        <Link href={`/${locale}/login`} style={{ color: 'var(--lime)', fontWeight: 600 }}>
          {t('login_link')}
        </Link>
      </p>
    </div>
  );
}
