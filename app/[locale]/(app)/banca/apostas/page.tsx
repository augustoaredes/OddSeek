import { getLocale } from 'next-intl/server';
import { getTips } from '@/lib/tips/fetcher';
import { ApostasManager } from '@/components/banca/ApostasManager';

interface Props {
  searchParams: Promise<{ tipId?: string; parlay?: string }>;
}

export default async function ApostasPage({ searchParams }: Props) {
  const locale = await getLocale();
  const { tipId, parlay } = await searchParams;

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
  } else if (parlay) {
    const ids  = parlay.split(',').filter(Boolean);
    const tips = await getTips();
    const legs = ids.map(id => tips.find(t => t.id === id)).filter(Boolean) as Awaited<ReturnType<typeof getTips>>;

    if (legs.length >= 2) {
      const combinedOdd = legs.reduce((acc, t) => acc * t.odd, 1);
      prefill = {
        sport:      'football',
        league:     'Múltipla',
        matchLabel: `Múltipla ${legs.length} pernas`,
        market:     'Múltipla',
        selection:  legs.map(l => l.selection).join(' + '),
        book:       legs[0].book,
        odd:        Math.round(combinedOdd * 100) / 100,
      };
    }
  }

  return <ApostasManager locale={locale} prefill={prefill} />;
}
