import { BankrollChart } from './BankrollChart';

interface BankCardProps {
  currentBalance: number;
  initialBalance: number;
  totalProfit: number;
  roi: number;
  equityCurve: Array<{ date: string; balance: number }>;
  riskProfile: 'conservador' | 'moderado' | 'agressivo';
}

const PROFILE_LABELS = {
  conservador: 'Conservador',
  moderado:    'Moderado',
  agressivo:   'Agressivo',
};

export function BankCard({
  currentBalance,
  initialBalance,
  totalProfit,
  roi,
  equityCurve,
  riskProfile,
}: BankCardProps) {
  const isPositive = totalProfit >= 0;

  return (
    <div
      className="bank-card"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '20px 24px 0',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
            Banca Atual
          </div>
          <div
            style={{
              fontFamily: 'var(--font-serif), Instrument Serif, serif',
              fontSize: 36,
              color: 'var(--text)',
              lineHeight: 1,
            }}
          >
            R${currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: isPositive ? 'var(--green)' : 'var(--red)',
              marginTop: 6,
            }}
          >
            {isPositive ? '↑' : '↓'}{' '}
            R${Math.abs(totalProfit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            <span style={{ fontWeight: 400, color: 'var(--muted)', marginLeft: 4 }}>
              ({isPositive ? '+' : ''}{roi.toFixed(1)}% ROI)
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Perfil</div>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              background: 'var(--s2)',
              border: '1px solid var(--border)',
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--lime)',
              letterSpacing: '0.04em',
            }}
          >
            {PROFILE_LABELS[riskProfile]}
          </span>
          <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 6 }}>
            Inicial: R${initialBalance.toLocaleString('pt-BR')}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ padding: '16px 0 0' }}>
        <BankrollChart data={equityCurve} height={130} />
      </div>
    </div>
  );
}
