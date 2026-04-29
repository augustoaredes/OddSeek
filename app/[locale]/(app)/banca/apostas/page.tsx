import { getLocale } from 'next-intl/server';
import { getTips } from '@/lib/tips/fetcher';
import { ApostasManager } from '@/components/banca/ApostasManager';

interface Props {
  searchParams: Promise<{ tipId?: string }>;
}

export default async function ApostasPage({ searchParams }: Props) {
  const locale = await getLocale();
  const { tipId } = await searchParams;

  let prefill: Parameters<typeof ApostasManager>[0]['prefill'] = undefined;

  if (tipId) {
    const tips = await getTips();
    const tip  = tips.find(t => t.id === tipId);
    if (tip) {
      prefill = {
        sport:      tip.sport,
        league:     tip.league,
        matchLabel: tip.matchLabel.replace(/^[^\s]+ /, ''),
        market:     tip.market,
        selection:  tip.selection,
        book:       tip.book,
        odd:        tip.odd,
      };
    }
  }

  return <ApostasManager locale={locale} prefill={prefill} />;
}
