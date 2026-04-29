import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

interface Props { locale: string }

export async function FinalCTA({ locale }: Props) {
  const t = await getTranslations('cta');

  return (
    <div className="cta">
      <div className="cta-inner">
        <div>
          <div className="cta-h">
            {t('h_1')}<br />
            <b>{t('h_2')}</b>
          </div>
          <div className="cta-sub">{t('sub')}</div>
        </div>

        <div className="cta-acts">
          <Link href={`/${locale}/registro`} className="btn-hero btn-hero-lime" style={{ justifyContent: 'center' }}>
            {t('primary')}
          </Link>
          <Link href={`/${locale}/dashboard`} className="btn-hero btn-hero-ghost" style={{ justifyContent: 'center' }}>
            {t('secondary')}
          </Link>
        </div>
      </div>
    </div>
  );
}
