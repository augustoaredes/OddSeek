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
  searchParams: Promise<{ email?: string; plano?: string }>;
}

export default async function RegisterPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { email: defaultEmail = '', plano: defaultPlan = 'pro' } = await searchParams;

  return (
    <div className="card" style={{ padding: '28px 28px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          fontFamily: 'var(--font-cond)', fontSize: 26, fontWeight: 900,
          textTransform: 'uppercase', letterSpacing: '-0.01em', marginBottom: 6,
        }}>
          Criar conta grátis
        </h1>
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
          {defaultPlan === 'free'
            ? 'Grátis para sempre · sem cartão necessário'
            : 'Cancele a qualquer momento · sem contrato'}
        </p>
      </div>

      <RegisterForm locale={locale} defaultEmail={defaultEmail} defaultPlan={defaultPlan} />

      <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', margin: 0 }}>
        Já tem conta?{' '}
        <Link href={`/${locale}/login`} style={{ color: 'var(--lime)', fontWeight: 600 }}>
          Entrar
        </Link>
      </p>
    </div>
  );
}
