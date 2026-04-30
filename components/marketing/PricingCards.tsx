'use client';

import Link from 'next/link';
import { useState } from 'react';

interface PricingCardsProps { locale: string }

type Period = 'mensal' | 'trimestral' | 'semestral' | 'anual';

const PERIODS: { id: Period; label: string; badge?: string }[] = [
  { id: 'mensal',     label: 'Mensal' },
  { id: 'trimestral', label: 'Trimestral', badge: '-10%' },
  { id: 'semestral',  label: 'Semestral',  badge: '-15%' },
  { id: 'anual',      label: 'Anual',       badge: '-20%' },
];

interface PlanPricing {
  monthly: number | null;  // price per month (null = free)
  total?: string;           // total shown below (e.g. "R$132 a cada 3 meses")
  discount?: string;        // e.g. "Economize R$54"
}

const PRICING: Record<Period, { free: PlanPricing; pro: PlanPricing; elite: PlanPricing }> = {
  mensal: {
    free:  { monthly: 0 },
    pro:   { monthly: 49 },
    elite: { monthly: 129 },
  },
  trimestral: {
    free:  { monthly: 0 },
    pro:   { monthly: 44, total: 'R$132 a cada 3 meses', discount: 'Economize R$15' },
    elite: { monthly: 116, total: 'R$348 a cada 3 meses', discount: 'Economize R$39' },
  },
  semestral: {
    free:  { monthly: 0 },
    pro:   { monthly: 42, total: 'R$252 a cada 6 meses', discount: 'Economize R$42' },
    elite: { monthly: 110, total: 'R$660 a cada 6 meses', discount: 'Economize R$114' },
  },
  anual: {
    free:  { monthly: 0 },
    pro:   { monthly: 39, total: 'R$470 por ano', discount: 'Economize R$118' },
    elite: { monthly: 99, total: 'R$1.190 por ano', discount: 'Economize R$358' },
  },
};

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

export function PricingCards({ locale }: PricingCardsProps) {
  const [period, setPeriod] = useState<Period>('mensal');
  const prices = PRICING[period];

  return (
    <div>
      {/* Toggle de período */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
        <div style={{
          display: 'inline-flex', gap: 2, background: 'var(--s2)',
          border: '1px solid var(--border)', borderRadius: 10, padding: 4,
        }}>
          {PERIODS.map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              style={{
                position: 'relative', padding: '7px 16px', borderRadius: 7, cursor: 'pointer',
                fontFamily: 'var(--font-cond)', fontSize: 12, fontWeight: 700,
                letterSpacing: '0.04em', textTransform: 'uppercase', border: 'none',
                background: period === p.id ? 'var(--surface)' : 'transparent',
                color: period === p.id ? 'var(--text)' : 'var(--muted)',
                boxShadow: period === p.id ? '0 1px 4px #0006' : 'none',
                transition: 'all .15s',
              }}
            >
              {p.label}
              {p.badge && (
                <span style={{
                  position: 'absolute', top: -8, right: -6,
                  background: 'var(--lime)', color: '#000',
                  fontSize: 8, fontWeight: 900, letterSpacing: '0.03em',
                  padding: '1px 4px', borderRadius: 3,
                }}>
                  {p.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="pricing-grid">

        {/* Free */}
        <div className="plan">
          <div className="plan-name">Grátis</div>
          <div className="plan-price"><sup>R$</sup>0</div>
          <div className="plan-cadence">para sempre</div>
          <div className="plan-div" />
          <div className="plan-feat on"><CheckIcon />5 apostas por dia</div>
          <div className="plan-feat on"><CheckIcon />Índice de confiança</div>
          <div className="plan-feat on"><CheckIcon />Futebol brasileiro</div>
          <div className="plan-feat"><XIcon />Vantagem + análise completa</div>
          <div className="plan-feat"><XIcon />Controle de banca</div>
          <Link href={`/${locale}/registro?plano=free`} className="plan-cta pcta-ghost" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Começar grátis
          </Link>
        </div>

        {/* Pro */}
        <div className="plan hl">
          <div className="plan-badge">Mais popular</div>
          <div className="plan-name">Pro</div>
          <div className="plan-price">
            <sup>R$</sup>{prices.pro.monthly}
          </div>
          <div className="plan-cadence">
            {period === 'mensal' ? 'por mês' : 'por mês, pago ' + period + 'mente'}
          </div>
          {prices.pro.total && (
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{prices.pro.total}</div>
          )}
          {prices.pro.discount && (
            <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700, marginTop: 3 }}>
              {prices.pro.discount}
            </div>
          )}
          <div className="plan-div" />
          <div className="plan-feat on"><CheckIcon />Apostas ilimitadas</div>
          <div className="plan-feat on"><CheckIcon />Vantagem em tempo real</div>
          <div className="plan-feat on"><CheckIcon />Todos os esportes</div>
          <div className="plan-feat on"><CheckIcon />Controle de banca</div>
          <div className="plan-feat on"><CheckIcon />Múltiplas inteligentes</div>
          <Link
            href={`/${locale}/registro?plano=pro`}
            className="plan-cta pcta-lime"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            Começar com Pro
          </Link>
        </div>

        {/* Elite */}
        <div className="plan">
          <div className="plan-name">Elite</div>
          <div className="plan-price">
            <sup>R$</sup>{prices.elite.monthly}
          </div>
          <div className="plan-cadence">
            {period === 'mensal' ? 'por mês' : 'por mês, pago ' + period + 'mente'}
          </div>
          {prices.elite.total && (
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{prices.elite.total}</div>
          )}
          {prices.elite.discount && (
            <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700, marginTop: 3 }}>
              {prices.elite.discount}
            </div>
          )}
          <div className="plan-div" />
          <div className="plan-feat on"><CheckIcon />Tudo do Pro</div>
          <div className="plan-feat on"><CheckIcon />Comunidade + ranking</div>
          <div className="plan-feat on"><CheckIcon />Programa de afiliados</div>
          <div className="plan-feat on"><CheckIcon />API + integrações</div>
          <div className="plan-feat on"><CheckIcon />Suporte dedicado</div>
          <Link
            href={`/${locale}/registro?plano=elite`}
            className="plan-cta pcta-ghost"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', borderColor: 'var(--lime)', color: 'var(--lime)' }}
          >
            Começar com Elite
          </Link>
        </div>

      </div>

      {/* Rodapé */}
      <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', marginTop: 24 }}>
        Cancele a qualquer momento · Sem fidelidade · Sem taxa de cancelamento
      </p>
    </div>
  );
}
