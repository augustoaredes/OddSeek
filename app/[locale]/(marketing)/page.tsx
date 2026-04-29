import type { Metadata } from 'next';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { Hero } from '@/components/marketing/Hero';
import { StatsBandClient } from '@/components/marketing/StatsBandClient';
import { FeaturesGrid } from '@/components/marketing/FeaturesGrid';
import { MatchSection } from '@/components/marketing/MatchSection';
import { BankrollSection } from '@/components/marketing/BankrollSection';
import { CommunitySection } from '@/components/marketing/CommunitySection';
import { PricingSection } from '@/components/marketing/PricingSection';
import { FinalCTA } from '@/components/marketing/FinalCTA';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'hero' });
  return {
    title: 'OddSeek — Apostas de Valor. Em Tempo Real.',
    description: t('sub'),
  };
}

export default async function LandingPage() {
  const locale = await getLocale();

  return (
    <>
      <Hero locale={locale} />
      <StatsBandClient />
      <FeaturesGrid />
      <MatchSection />
      <BankrollSection />
      <CommunitySection locale={locale} />
      <PricingSection locale={locale} />
      <FinalCTA locale={locale} />
    </>
  );
}
