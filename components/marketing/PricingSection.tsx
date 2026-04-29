import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

interface Props { locale: string }

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2.5 7l3 3 6-6" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M3 3l8 8M11 3L3 11" stroke="var(--dim)" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

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

        <div className="pricing-grid">
          {/* Free */}
          <div className="plan">
            <div className="plan-name">{t('free_name')}</div>
            <div className="plan-price"><sup>R$</sup>{t('free_price')}</div>
            <div className="plan-cadence">{t('free_cadence')}</div>
            <div className="plan-div" />
            <div className="plan-feat on"><CheckIcon />5 palpites por dia</div>
            <div className="plan-feat on"><CheckIcon />Score de confiança</div>
            <div className="plan-feat on"><CheckIcon />Futebol brasileiro</div>
            <div className="plan-feat"><XIcon />EV+ e análise completa</div>
            <div className="plan-feat"><XIcon />Gestão de banca</div>
            <Link href={`/${locale}/registro`} className="plan-cta pcta-ghost" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {t('cta_free')}
            </Link>
          </div>

          {/* Pro */}
          <div className="plan hl">
            <div className="plan-badge">{t('pro_badge')}</div>
            <div className="plan-name">{t('pro_name')}</div>
            <div className="plan-price"><sup>R$</sup>49</div>
            <div className="plan-cadence">{t('pro_cadence')} · R$470/ano</div>
            <div className="plan-div" />
            <div className="plan-feat on"><CheckIcon />Palpites ilimitados</div>
            <div className="plan-feat on"><CheckIcon />EV+ em tempo real</div>
            <div className="plan-feat on"><CheckIcon />Todos os esportes</div>
            <div className="plan-feat on"><CheckIcon />Gestão de banca</div>
            <div className="plan-feat on"><CheckIcon />Parlay inteligente</div>
            <Link href={`/${locale}/registro`} className="plan-cta pcta-lime" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {t('cta_pro')}
            </Link>
          </div>

          {/* Elite */}
          <div className="plan">
            <div className="plan-name">{t('elite_name')}</div>
            <div className="plan-price"><sup>R$</sup>129</div>
            <div className="plan-cadence">{t('elite_cadence')} · R$1.190/ano</div>
            <div className="plan-div" />
            <div className="plan-feat on"><CheckIcon />Tudo do Pro</div>
            <div className="plan-feat on"><CheckIcon />Comunidade + ranking</div>
            <div className="plan-feat on"><CheckIcon />Programa de afiliados</div>
            <div className="plan-feat on"><CheckIcon />API + integrações</div>
            <div className="plan-feat on"><CheckIcon />Suporte dedicado</div>
            <Link href={`/${locale}/registro`} className="plan-cta pcta-ghost" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderColor: 'var(--lime)', color: 'var(--lime)' }}>
              {t('cta_elite')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
