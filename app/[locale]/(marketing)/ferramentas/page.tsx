'use client';

import { useState } from 'react';

// ─── Utility functions ────────────────────────────────────────────────────────

function calcEV(prob: number, odd: number): number {
  if (odd <= 1 || prob <= 0 || prob > 1) return 0;
  return prob * odd - 1;
}

function calcKelly(prob: number, odd: number): number {
  if (odd <= 1 || prob <= 0 || prob >= 1) return 0;
  const b = odd - 1;
  const q = 1 - prob;
  const k = (prob * b - q) / b;
  return Math.max(0, k);
}

function calcHalfKelly(prob: number, odd: number): number {
  return calcKelly(prob, odd) * 0.5;
}

/** Convert free bet to cash value */
function calcBonusValue(bonusAmount: number, odd: number, type: 'stake_returned' | 'stake_not_returned'): number {
  if (odd <= 1 || bonusAmount <= 0) return 0;
  if (type === 'stake_not_returned') {
    // Lay the bonus bet: hedge = bonusPayout / (layOdd - 1)
    // Cash value ≈ bonus × (odd - 1) / odd  (simplified for display)
    return bonusAmount * ((odd - 1) / odd);
  } else {
    // Stake returned: cash value ≈ bonus * (odd - 1) / odd
    return bonusAmount * (odd - 1) / odd;
  }
}

/** Convert odds between formats */
function decimalToAmerican(dec: number): string {
  if (dec <= 1) return '—';
  if (dec >= 2) return `+${Math.round((dec - 1) * 100)}`;
  return `${Math.round(-100 / (dec - 1))}`;
}

function americanToDecimal(american: number): number {
  if (american > 0) return american / 100 + 1;
  return 100 / Math.abs(american) + 1;
}

function decimalToFractional(dec: number): string {
  if (dec <= 1) return '—';
  const n = dec - 1;
  // Find GCD
  const precision = 100;
  const num = Math.round(n * precision);
  const den = precision;
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const g = gcd(Math.abs(num), den);
  return `${num / g}/${den / g}`;
}

// ─── Shared card wrapper ──────────────────────────────────────────────────────

function Card({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span style={{ fontSize: 18 }}>{icon}</span>
        <h2
          style={{
            margin: 0,
            fontFamily: 'var(--font-cond)',
            fontWeight: 800,
            fontSize: 15,
            color: 'var(--text)',
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
          }}
        >
          {title}
        </h2>
      </div>
      <div style={{ padding: '20px' }}>{children}</div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = 'number',
  min,
  max,
  step,
  placeholder,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        style={{
          background: 'var(--s2)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '9px 12px',
          color: 'var(--text)',
          fontSize: 15,
          fontFamily: 'var(--font-cond)',
          fontWeight: 700,
          outline: 'none',
          width: '100%',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

function ResultRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 12px',
        background: highlight ? 'rgba(204,255,0,0.07)' : 'var(--s2)',
        borderRadius: 7,
        border: highlight ? '1px solid rgba(204,255,0,0.2)' : '1px solid transparent',
      }}
    >
      <span style={{ fontSize: 12, color: 'var(--muted)' }}>{label}</span>
      <span
        style={{
          fontFamily: 'var(--font-cond)',
          fontWeight: 800,
          fontSize: 16,
          color: highlight ? 'var(--lime)' : 'var(--text)',
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Calculator 1: EV ────────────────────────────────────────────────────────

function EVCalculator() {
  const [prob, setProb] = useState('55');
  const [odd, setOdd] = useState('2.00');
  const [stake, setStake] = useState('100');

  const p = parseFloat(prob) / 100;
  const o = parseFloat(odd);
  const s = parseFloat(stake) || 0;
  const ev = calcEV(p, o);
  const evPct = (ev * 100).toFixed(2);
  const expectedProfit = (ev * s).toFixed(2);
  const isValue = ev > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <InputField label="Probabilidade (%)" value={prob} onChange={setProb} min={0} max={100} step={0.5} placeholder="55" />
        <InputField label="Odd (decimal)" value={odd} onChange={setOdd} min={1.01} step={0.05} placeholder="2.00" />
        <InputField label="Stake (R$)" value={stake} onChange={setStake} min={1} placeholder="100" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
        <ResultRow
          label="Expected Value (EV)"
          value={isNaN(ev) ? '—' : `${isValue ? '+' : ''}${evPct}%`}
          highlight={isValue}
        />
        <ResultRow
          label="Lucro esperado por aposta"
          value={isNaN(ev) ? '—' : `${Number(expectedProfit) >= 0 ? '+' : ''}R$ ${expectedProfit}`}
          highlight={Number(expectedProfit) > 0}
        />
        <ResultRow
          label="Classificação"
          value={
            isNaN(ev) ? '—'
              : ev >= 0.10 ? '🔥 Alto Valor'
              : ev >= 0.05 ? '⚡ Destaque'
              : ev > 0 ? '✅ Valor Positivo'
              : '❌ Sem Valor'
          }
        />
      </div>
      <p style={{ margin: 0, fontSize: 11, color: 'var(--dim)', lineHeight: 1.6 }}>
        EV = probabilidade × odd − 1. Um EV positivo indica que a odd oferece mais do que deveria — aposta com valor esperado positivo.
      </p>
    </div>
  );
}

// ─── Calculator 2: Kelly ─────────────────────────────────────────────────────

function KellyCalculator() {
  const [prob, setProb] = useState('55');
  const [odd, setOdd] = useState('2.00');
  const [bankroll, setBankroll] = useState('1000');

  const p = parseFloat(prob) / 100;
  const o = parseFloat(odd);
  const b = parseFloat(bankroll) || 0;
  const kelly = calcKelly(p, o);
  const halfKelly = calcHalfKelly(p, o);
  const quarterKelly = kelly * 0.25;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <InputField label="Probabilidade (%)" value={prob} onChange={setProb} min={0} max={100} step={0.5} />
        <InputField label="Odd (decimal)" value={odd} onChange={setOdd} min={1.01} step={0.05} />
        <InputField label="Banca (R$)" value={bankroll} onChange={setBankroll} min={1} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
        <ResultRow
          label="Kelly Completo"
          value={isNaN(kelly) || kelly <= 0 ? 'Sem EV+' : `${(kelly * 100).toFixed(1)}% → R$ ${(kelly * b).toFixed(2)}`}
        />
        <ResultRow
          label="Half Kelly (recomendado)"
          value={isNaN(halfKelly) || halfKelly <= 0 ? 'Sem EV+' : `${(halfKelly * 100).toFixed(1)}% → R$ ${(halfKelly * b).toFixed(2)}`}
          highlight={halfKelly > 0}
        />
        <ResultRow
          label="Quarter Kelly (conservador)"
          value={isNaN(quarterKelly) || quarterKelly <= 0 ? 'Sem EV+' : `${(quarterKelly * 100).toFixed(1)}% → R$ ${(quarterKelly * b).toFixed(2)}`}
        />
      </div>
      <p style={{ margin: 0, fontSize: 11, color: 'var(--dim)', lineHeight: 1.6 }}>
        O critério de Kelly maximiza o crescimento da banca a longo prazo. Half Kelly é preferido por reduzir volatilidade. Nunca use Kelly completo com probabilidades incertas.
      </p>
    </div>
  );
}

// ─── Calculator 3: Bonus Converter ───────────────────────────────────────────

function BonusCalculator() {
  const [bonusAmount, setBonusAmount] = useState('200');
  const [odd, setOdd] = useState('2.00');
  const [bonusType, setBonusType] = useState<'stake_not_returned' | 'stake_returned'>('stake_not_returned');

  const amount = parseFloat(bonusAmount) || 0;
  const o = parseFloat(odd);
  const cashValue = calcBonusValue(amount, o, bonusType);
  const conversionRate = amount > 0 ? (cashValue / amount) * 100 : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <InputField label="Valor do Bônus (R$)" value={bonusAmount} onChange={setBonusAmount} min={1} />
        <InputField label="Odd de hedge (decimal)" value={odd} onChange={setOdd} min={1.5} step={0.05} />
      </div>

      {/* Bonus type toggle */}
      <div style={{ display: 'flex', gap: 6 }}>
        {(['stake_not_returned', 'stake_returned'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setBonusType(t)}
            style={{
              flex: 1,
              background: bonusType === t ? 'var(--lime)' : 'var(--s2)',
              color: bonusType === t ? '#000' : 'var(--muted)',
              border: '1px solid',
              borderColor: bonusType === t ? 'var(--lime)' : 'var(--border)',
              borderRadius: 8,
              padding: '8px 12px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            {t === 'stake_not_returned' ? 'Bônus sem devolução' : 'Bônus com devolução'}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <ResultRow
          label="Valor em cash estimado"
          value={isNaN(cashValue) ? '—' : `R$ ${cashValue.toFixed(2)}`}
          highlight={cashValue > 0}
        />
        <ResultRow
          label="Taxa de conversão"
          value={isNaN(conversionRate) ? '—' : `${conversionRate.toFixed(1)}%`}
        />
        <ResultRow
          label={'Quanto "perder" para garantir cash'}
          value={isNaN(cashValue) ? '—' : `R$ ${(amount - cashValue).toFixed(2)}`}
        />
      </div>
      <p style={{ margin: 0, fontSize: 11, color: 'var(--dim)', lineHeight: 1.6 }}>
        Estratégia: aposte o bônus na odd desejada e faça hedge na bet oposta em outra casa. O lucro do hedge menos a perda no bônus = valor em cash garantido.
      </p>
    </div>
  );
}

// ─── Calculator 4: Odds Converter ────────────────────────────────────────────

function OddsConverter() {
  const [decimal, setDecimal] = useState('2.00');
  const [american, setAmerican] = useState('');
  const [mode, setMode] = useState<'decimal' | 'american'>('decimal');

  function handleDecimalChange(v: string) {
    setMode('decimal');
    setDecimal(v);
    setAmerican('');
  }

  function handleAmericanChange(v: string) {
    setMode('american');
    setAmerican(v);
    setDecimal('');
  }

  const dec = mode === 'decimal' ? parseFloat(decimal) : americanToDecimal(parseFloat(american));
  const impliedProb = dec > 1 ? (1 / dec) * 100 : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <InputField label="Odd Decimal" value={decimal} onChange={handleDecimalChange} min={1.01} step={0.05} placeholder="2.00" />
        <InputField label="Odd Americana" value={american} onChange={handleAmericanChange} type="number" placeholder="+100" />
      </div>

      {dec > 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <ResultRow label="Decimal" value={isNaN(dec) ? '—' : dec.toFixed(2)} />
          <ResultRow label="Americana" value={isNaN(dec) ? '—' : decimalToAmerican(dec)} />
          <ResultRow label="Fracionária" value={isNaN(dec) ? '—' : decimalToFractional(dec)} />
          <ResultRow
            label="Probabilidade implícita"
            value={isNaN(impliedProb) ? '—' : `${impliedProb.toFixed(2)}%`}
            highlight
          />
        </div>
      )}
      <p style={{ margin: 0, fontSize: 11, color: 'var(--dim)', lineHeight: 1.6 }}>
        Casas brasileiras usam odds decimais. EUA usam americanas (+/-). UK usa fracionárias. A probabilidade implícita inclui a margem da casa.
      </p>
    </div>
  );
}

// ─── Calculator 5: ARB quick calc ────────────────────────────────────────────

function ArbQuickCalc() {
  const [odd1, setOdd1] = useState('2.10');
  const [odd2, setOdd2] = useState('2.05');
  const [odd3, setOdd3] = useState('');
  const [totalStake, setTotalStake] = useState('100');

  const odds = [parseFloat(odd1), parseFloat(odd2), parseFloat(odd3)].filter((o) => !isNaN(o) && o > 1.01);
  const impliedSum = odds.reduce((s, o) => s + 1 / o, 0);
  const isArb = impliedSum < 1 && odds.length >= 2;
  const arbPct = isArb ? ((1 - impliedSum) * 100).toFixed(3) : null;
  const s = parseFloat(totalStake) || 100;
  const stakes = isArb ? odds.map((o) => ((s * (1 / o)) / impliedSum).toFixed(2)) : [];
  const profit = isArb ? (s / impliedSum - s).toFixed(2) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
        <InputField label="Odd 1" value={odd1} onChange={setOdd1} min={1.01} step={0.05} />
        <InputField label="Odd 2" value={odd2} onChange={setOdd2} min={1.01} step={0.05} />
        <InputField label="Odd 3 (opcional)" value={odd3} onChange={setOdd3} min={1.01} step={0.05} placeholder="—" />
        <InputField label="Stake total (R$)" value={totalStake} onChange={setTotalStake} min={1} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <ResultRow
          label="Soma probabilidades implícitas"
          value={isNaN(impliedSum) ? '—' : `${(impliedSum * 100).toFixed(2)}%`}
        />
        <ResultRow
          label="Oportunidade ARB?"
          value={odds.length < 2 ? 'Insira ao menos 2 odds' : isArb ? `✅ SIM — +${arbPct}%` : '❌ Não (sem ARB)'}
          highlight={isArb}
        />
        {isArb && (
          <>
            {stakes.map((st, i) => (
              <ResultRow key={i} label={`Stake Odd ${i + 1}`} value={`R$ ${st}`} />
            ))}
            <ResultRow label="Lucro garantido" value={`+R$ ${profit}`} highlight />
          </>
        )}
      </div>
      <p style={{ margin: 0, fontSize: 11, color: 'var(--dim)', lineHeight: 1.6 }}>
        Cole as melhores odds disponíveis em diferentes casas. Se a soma das probabilidades implícitas for {'<'} 100%, existe arbitragem garantida.
      </p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function FerramentasPage() {
  return (
    <div
      className="theme-marketing"
      style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 80 }}
    >
      {/* Hero */}
      <div
        style={{
          padding: '60px 24px 40px',
          textAlign: 'center',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(204,255,0,0.1)',
            color: 'var(--lime)',
            fontSize: 12,
            fontWeight: 700,
            padding: '4px 12px',
            borderRadius: 20,
            marginBottom: 16,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          100% grátis
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-cond)',
            fontWeight: 900,
            fontSize: 'clamp(32px, 6vw, 52px)',
            color: 'var(--text)',
            margin: '0 0 12px',
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
            lineHeight: 1.1,
          }}
        >
          Calculadoras de{' '}
          <span style={{ color: 'var(--lime)' }}>apostas esportivas</span>
        </h1>
        <p
          style={{
            fontSize: 16,
            color: 'var(--muted)',
            maxWidth: 560,
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          Ferramentas profissionais para calcular EV+, Kelly, conversão de bônus, odds e arbitragem. Use math, não sorte.
        </p>
      </div>

      {/* Calculators grid */}
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '40px 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))',
          gap: 20,
        }}
      >
        <Card title="Calculadora de EV+" icon="📊">
          <EVCalculator />
        </Card>

        <Card title="Critério de Kelly" icon="📐">
          <KellyCalculator />
        </Card>

        <Card title="Conversor de Bônus" icon="🎁">
          <BonusCalculator />
        </Card>

        <Card title="Conversor de Odds" icon="🔄">
          <OddsConverter />
        </Card>

        <div style={{ gridColumn: '1 / -1' }}>
          <Card title="Calculadora de Arbitragem Rápida" icon="⚖️">
            <ArbQuickCalc />
          </Card>
        </div>
      </div>

      {/* CTA */}
      <div
        style={{
          maxWidth: 600,
          margin: '0 auto 0',
          padding: '0 24px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '32px',
          }}
        >
          <p style={{ fontFamily: 'var(--font-cond)', fontWeight: 800, fontSize: 20, color: 'var(--text)', margin: '0 0 8px' }}>
            Quer oportunidades EV+ automáticas?
          </p>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 20px' }}>
            O OddSeek escaneia dezenas de eventos por dia e entrega as melhores apostas com valor esperado positivo já calculado.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="/registro"
              style={{
                background: 'var(--lime)',
                color: '#000',
                fontWeight: 800,
                fontSize: 13,
                padding: '10px 22px',
                borderRadius: 8,
                textDecoration: 'none',
                letterSpacing: '0.02em',
              }}
            >
              CRIAR CONTA GRÁTIS
            </a>
            <a
              href="/login"
              style={{
                background: 'var(--s2)',
                color: 'var(--text)',
                fontWeight: 700,
                fontSize: 13,
                padding: '10px 22px',
                borderRadius: 8,
                textDecoration: 'none',
                border: '1px solid var(--border)',
              }}
            >
              Já tenho conta
            </a>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p
        style={{
          textAlign: 'center',
          fontSize: 11,
          color: 'var(--dim)',
          maxWidth: 600,
          margin: '32px auto 0',
          padding: '0 24px',
          lineHeight: 1.6,
        }}
      >
        Ferramentas educacionais. Apostas envolvem risco de perda. Jogue com responsabilidade. Proibido para menores de 18 anos.
        OddSeek não é uma casa de apostas.
      </p>
    </div>
  );
}
