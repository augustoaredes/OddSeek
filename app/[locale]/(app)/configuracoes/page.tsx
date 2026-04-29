'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  loadInitialBankroll, saveInitialBankroll,
  loadRiskProfile, saveRiskProfile,
} from '@/lib/banca/store';
import type { RiskProfile } from '@/lib/banca/store';

const RISK_PROFILES = [
  { key: 'conservador' as RiskProfile, label: 'Conservador', cap: '1%', desc: 'Stake máximo de 1% por aposta' },
  { key: 'moderado'    as RiskProfile, label: 'Moderado',    cap: '3%', desc: 'Stake máximo de 3% por aposta' },
  { key: 'agressivo'   as RiskProfile, label: 'Agressivo',   cap: '5%', desc: 'Stake máximo de 5% por aposta' },
];

export default function ConfiguracoesPage() {
  const locale = useLocale();

  const [bankrollInput, setBankrollInput] = useState('2000');
  const [riskProfile,   setRiskProfile]   = useState<RiskProfile>('moderado');
  const [savedBankroll, setSavedBankroll] = useState<number | null>(null);
  const [bankrollDirty, setBankrollDirty] = useState(false);
  const [notifications, setNotifications] = useState({
    bancaAlerts: true,
    newTips:     true,
    favoriteOdds: false,
    newsletter:  false,
  });
  const [publicProfile, setPublicProfile] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const num     = loadInitialBankroll();
    const profile = loadRiskProfile();
    setSavedBankroll(num);
    setBankrollInput(num.toFixed(2).replace('.', ','));
    setRiskProfile(profile);
  }, []);

  function handleBankrollChange(val: string) {
    setBankrollInput(val.replace(/[^0-9,\.]/g, ''));
    setBankrollDirty(true);
  }

  function saveBancaSettings() {
    const num = parseFloat(bankrollInput.replace(',', '.'));
    if (isNaN(num) || num <= 0) return;
    saveInitialBankroll(num);
    saveRiskProfile(riskProfile);
    setSavedBankroll(num);
    setBankrollDirty(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function toggleNotif(key: keyof typeof notifications) {
    setNotifications(n => ({ ...n, [key]: !n[key] }));
  }

  const notifItems: { key: keyof typeof notifications; label: string }[] = [
    { key: 'bancaAlerts',  label: 'Alertas de banca' },
    { key: 'newTips',      label: 'Novas tips EV+' },
    { key: 'favoriteOdds', label: 'Odds favoráveis' },
    { key: 'newsletter',   label: 'Newsletter semanal' },
  ];

  const sectionLabel = (text: string, danger?: boolean) => (
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: danger ? 'var(--red)' : 'var(--muted)', marginBottom: 12 }}>
      {text}
    </div>
  );

  const card = (children: React.ReactNode) => (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
      {children}
    </div>
  );

  const row = (children: React.ReactNode, last?: boolean) => (
    <div style={{ padding: '14px 20px', borderBottom: last ? 'none' : '1px solid var(--border)' }}>
      {children}
    </div>
  );

  const toggle = (on: boolean, onToggle: () => void) => (
    <button
      type="button"
      onClick={onToggle}
      style={{ width: 36, height: 20, borderRadius: 10, background: on ? 'var(--lime)' : 'var(--dim)', position: 'relative', cursor: 'pointer', flexShrink: 0, border: 'none', padding: 0, transition: 'background 0.2s' }}
      aria-pressed={on}
    >
      <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: on ? 18 : 4, transition: 'left 0.2s' }} />
    </button>
  );

  return (
    <div className="page-padded" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-cond)', fontSize: 28, fontWeight: 800, letterSpacing: '-0.01em', textTransform: 'uppercase', color: 'var(--text)', margin: 0 }}>
          Configurações
        </h1>
      </div>

      {/* ── Conta ── */}
      <section style={{ marginBottom: 20 }}>
        {sectionLabel('Conta')}
        {card(<>
          {[
            { label: 'Nome',   value: 'Demo User',        action: 'Editar' },
            { label: 'E-mail', value: 'demo@oddseek.app', action: 'Alterar' },
            { label: 'Senha',  value: '••••••••',          action: 'Alterar' },
            { label: 'Handle', value: '@demo',             action: 'Editar' },
          ].map((r, i, arr) => (
            <div key={r.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.04em' }}>{r.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginTop: 2 }}>{r.value}</div>
              </div>
              <button type="button" style={{ fontSize: 11, fontWeight: 700, color: 'var(--lime)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}>{r.action}</button>
            </div>
          ))}
        </>)}
      </section>

      {/* ── Banca ── */}
      <section style={{ marginBottom: 20 }}>
        {sectionLabel('Banca')}
        {card(<>
          {/* Banca Inicial */}
          {row(<>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>Banca Inicial (R$)</div>
                <div style={{ fontSize: 11, color: 'var(--dim)', marginTop: 2 }}>Referência para cálculo de ROI e Kelly</div>
              </div>
              {savedBankroll !== null && !bankrollDirty && (
                <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700, flexShrink: 0 }}>
                  Salvo ✓
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
              <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>R$</span>
              <input
                type="text"
                inputMode="decimal"
                value={bankrollInput}
                onChange={e => handleBankrollChange(e.target.value)}
                style={{
                  flex: 1, background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 8,
                  padding: '10px 12px', fontSize: 15, fontWeight: 700, color: 'var(--text)',
                  fontFamily: 'var(--font-cond)', outline: 'none', minWidth: 0,
                }}
                placeholder="2000,00"
              />
            </div>
          </>)}

          {/* Perfil de risco */}
          {row(<>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 10 }}>Perfil de Risco</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {RISK_PROFILES.map(p => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setRiskProfile(p.key)}
                  style={{
                    flex: 1, minWidth: 90, padding: '10px 8px', borderRadius: 8, cursor: 'pointer',
                    border: riskProfile === p.key ? '2px solid var(--lime)' : '1px solid var(--border)',
                    background: riskProfile === p.key ? 'oklch(85% 0.3 115 / 0.08)' : 'var(--s2)',
                    color: riskProfile === p.key ? 'var(--lime)' : 'var(--muted)',
                    textAlign: 'center', transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-cond)', textTransform: 'uppercase' }}>{p.label}</div>
                  <div style={{ fontSize: 10, marginTop: 3, color: riskProfile === p.key ? 'var(--lime)' : 'var(--dim)' }}>cap {p.cap}</div>
                </button>
              ))}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>
              {RISK_PROFILES.find(p => p.key === riskProfile)?.desc}
            </div>
          </>)}

          {/* Save button */}
          <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={saveBancaSettings}
              style={{
                padding: '10px 24px', borderRadius: 8, background: 'var(--lime)', color: '#000',
                fontSize: 12, fontWeight: 800, fontFamily: 'var(--font-cond)', textTransform: 'uppercase',
                border: 'none', cursor: 'pointer', letterSpacing: '0.04em', transition: 'opacity 0.15s',
              }}
            >
              {saved ? 'Salvo ✓' : 'Salvar configurações de banca'}
            </button>
          </div>
        </>)}
      </section>

      {/* ── Notificações ── */}
      <section style={{ marginBottom: 20 }}>
        {sectionLabel('Notificações')}
        {card(<>
          {notifItems.map((item, i) => (
            <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: i < notifItems.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{item.label}</div>
              {toggle(notifications[item.key], () => toggleNotif(item.key))}
            </div>
          ))}
        </>)}
      </section>

      {/* ── Privacidade / LGPD ── */}
      <section style={{ marginBottom: 20 }}>
        {sectionLabel('Privacidade')}
        {card(<>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Exportar meus dados</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Receba um arquivo com todos seus dados (LGPD Art. 18)</div>
            </div>
            <button type="button" style={{ fontSize: 11, fontWeight: 700, color: 'var(--lime)', background: 'none', border: 'none', cursor: 'pointer' }}>Solicitar</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Perfil público</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Visível no ranking e comunidade</div>
            </div>
            {toggle(publicProfile, () => setPublicProfile(v => !v))}
          </div>
        </>)}
      </section>

      {/* ── Zona de Risco ── */}
      <section>
        {sectionLabel('Zona de Risco', true)}
        <div style={{ background: 'oklch(50% 0.2 25 / 0.08)', border: '1px solid oklch(50% 0.2 25 / 0.3)', borderRadius: 12, padding: '20px' }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Excluir conta</div>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
              Seus dados pessoais serão anonimizados. O histórico de apostas é mantido de forma anônima para preservar integridade contábil (obrigação legal). Esta ação é irreversível.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              style={{ padding: '9px 20px', borderRadius: 8, background: 'oklch(50% 0.2 25 / 0.2)', border: '1px solid oklch(50% 0.2 25 / 0.5)', color: 'var(--red)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              Excluir minha conta
            </button>
            <Link href={`/${locale}/privacidade`} style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'none' }}>
              Ler política de privacidade →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
