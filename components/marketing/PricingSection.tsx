import { getTranslations } from 'next-intl/server';
import { PricingCards } from './PricingCards';

interface Props { locale: string }

export async function PricingSection({ locale }: Props) {
  const t = await getTranslations('pricing');

  return (
    <section className="section" id="pricing">
      <div className="si">
        <div className="stag">{t('tag')}</div>
        <h2 className="sh">
          {t('h')}<br /><em>{t('h_em')}</em>
        </h2>
        <p className="sp">{t('sub')}</p>

        <PricingCards locale={locale} />
      </div>
    </section>
  );
}
