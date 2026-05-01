import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { Hero } from '@/components/marketing/Hero';
import { StatsBandClient } from '@/components/marketing/StatsBandClient';
import { FeaturesGrid } from '@/components/marketing/FeaturesGrid';
import { MatchSection } from '@/components/marketing/MatchSection';
import { BankrollSection } from '@/components/marketing/BankrollSection';
import { SocialProof } from '@/components/marketing/SocialProof';
import { CommunitySection } from '@/components/marketing/CommunitySection';
import { PricingSection } from '@/components/marketing/PricingSection';
import { FinalCTA } from '@/components/marketing/FinalCTA';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'hero' });
  return {
    title: 'OddSeek — Encontre apostas com EV+ em tempo real.',
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
      <SocialProof />
      <CommunitySection locale={locale} />
      <PricingSection locale={locale} />
      <FinalCTA locale={locale} />
    </>
  );
}
