import { getLocale } from 'next-intl/server';
import { BancaDashboard } from '@/components/banca/BancaDashboard';

export default async function BancaPage() {
  const locale = await getLocale();
  return <BancaDashboard locale={locale} />;
}
