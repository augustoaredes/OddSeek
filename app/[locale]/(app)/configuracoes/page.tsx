'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useSession, signOut } from 'next-auth/react';
import type { RiskProfile } from '@/lib/banca/store';

const RISK_PROFILES = [
  { key: 'conservador' as RiskProfile, label: 'Conservador', cap: '1%', desc: 'Stake máximo de 1% por aposta' },
  { key: 'moderado'    as RiskProfile, label: 'Moderado',    cap: '3%', desc: 'Stake máximo de 3% por aposta' },
  { key: 'agressivo'   as RiskProfile, label: 'Agressivo',   cap: '5%', desc: 'Stake máximo de 5% por aposta' },
];

export default function ConfiguracoesPage() {
  const locale     = useLocale();
  const { data: session } = useSession();
  const isAuth     = Boolean(session?.user?.id);

  // Account
  const [name,   setName]   = useState('');
  const [handle, setHandle] = useState('');
  const [email,  setEmail]  = useState('');
  const [editName,   setEditName]   = useState(false);
  const [editHandle, setEditHandle] = useState(false);
  const [accountMsg, setAccountMsg] = useState('');

  // Banca
  const [bankrollInput, setBankrollInput] = useState('2000');
  const [riskProfile,   setRiskProfile]   = useState<RiskProfile>('moderado');
  const [bancaMsg,      setBancaMsg]      = useState('');

  // Danger zone
  const [deleteConfirm,  setDeleteConfirm]  = useState(false);
  const [deletePending, startDeleteTransition] = useTransition();

  // Notifications (UI only for now)
  const [notifications, setNotifications] = useState({
    bancaAlerts: true,
    newTips:     true,
    favoriteOdds: false,
    newsletter:  false,
  });

  // Load user data
  useEffect(() => {
    if (!isAuth) return;
    Promise.all([
      fetch('/api/account').then(r => r.json()),
      fetch('/api/banca/bankroll').then(r => r.json()),
    ]).then(([acc, banca]) => {
      setName(acc.name ?? '');
      setHandle(acc.handle ?? '');
      setEmail(acc.email ?? '');
      const amt = banca.initialAmount ?? banca.currentAmount ?? 2000;
      setBankrollInput(String(Math.round(amt)));
      setRiskProfile((banca.riskProfile as RiskProfile) ?? 'moderado');
    }).catch(() => {});
  }, [isAuth]);

  async function saveAccount(field: 'name' | 'handle') {
    const body = field === 'name' ? { name } : { handle };
    const res = await fetch('/api/account', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setAccountMsg('Salvo!');
      if (field === 'name')   setEditName(false);
      if (field === 'handle') setEditHandle(false);
      setTimeout(() => setAccountMsg(''), 2000);
    } else {
      const err = await res.json().catch(() => ({}));
      setAccountMsg(err?.error ?? 'Erro ao salvar');
      setTimeout(() => setAccountMsg(''), 3000);
    }
  }

  async function saveBanca() {
    const num = parseFloat(bankrollInput.replace(',', '.'));
    if (isNaN(num) || num < 10) { setBancaMsg('Valor mínimo R$10'); return; }
    const res = await fetch('/api/banca/bankroll', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initialAmount: num, riskProfile }),
    });
    if (res.ok) {
      setBancaMsg('Salvo!');
      setTimeout(() => setBancaMsg(''), 2000);
    } else {
      setBancaMsg('Erro ao salvar');
      setTimeout(() => setBancaMsg(''), 3000);
    }
  }

  function handleDeleteAccount() {
    if (!deleteConfirm) { setDeleteConfirm(true); return; }
    startDeleteTransition(async () => {
      await fetch('/api/account', { method: 'DELETE' });
      await signOut({ callbackUrl: `/${locale}` });
    });
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

  const inputStyle: React.CSSProperties = {
    flex: 1, background: 'var(--s2)', border: '1px solid var(--lime)', borderRadius: 8,
    padding: '8px 12px', fontSize: 13, fontWeight: 600, color: 'var(--text)',
    outline: 'none', minWidth: 0,
  };

  return (
    <div className="page-padded" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-cond)', fontSize: 28, fontWeight: 800, letterSpacing: '-0.01em', textTransform: 'uppercase', color: 'var(--text)', margin: 0 }}>
          Configurações
        </h1>
        {accountMsg && (
          <div style={{ marginTop: 8, fontSize: 12, color: accountMsg === 'Salvo!' ? 'var(--green)' : 'var(--red)' }}>
            {accountMsg}
          </div>
        )}
      </div>

      {/* ── Conta ── */}
      <section style={{ marginBottom: 20 }}>
        {sectionLabel('Conta')}
        {card(<>
          {/* Nome */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.04em', marginBottom: 4 }}>Nome</div>
              {editName ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
                  <button type="button" onClick={() => saveAccount('name')} style={{ fontSize: 11, fontWeight: 700, color: '#000', background: 'var(--lime)', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer' }}>Salvar</button>
                  <button type="button" onClick={() => setEditName(false)} style={{ fontSize: 11, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                </div>
              ) : (
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{name || '—'}</div>
              )}
            </div>
            {!editName && (
              <button type="button" onClick={() => setEditName(true)} style={{ fontSize: 11, fontWeight: 700, color: 'var(--lime)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', flexShrink: 0 }}>Editar</button>
            )}
          </div>

          {/* Handle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.04em', marginBottom: 4 }}>Handle</div>
              {editHandle ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>@</span>
                    <input value={handle} onChange={e => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} style={{ ...inputStyle, flex: 1 }} />
                  </div>
                  <button type="button" onClick={() => saveAccount('handle')} style={{ fontSize: 11, fontWeight: 700, color: '#000', background: 'var(--lime)', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer' }}>Salvar</button>
                  <button type="button" onClick={() => setEditHandle(false)} style={{ fontSize: 11, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                </div>
              ) : (
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{handle ? `@${handle}` : '—'}</div>
              )}
            </div>
            {!editHandle && (
              <button type="button" onClick={() => setEditHandle(true)} style={{ fontSize: 11, fontWeight: 700, color: 'var(--lime)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', flexShrink: 0 }}>Editar</button>
            )}
          </div>

          {/* Email (read-only) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.04em' }}>E-mail</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginTop: 2 }}>{email || '—'}</div>
            </div>
            <span style={{ fontSize: 10, color: 'var(--muted)', padding: '3px 8px', borderRadius: 4, background: 'var(--s2)', border: '1px solid var(--border)' }}>Verificado</span>
          </div>
        </>)}
      </section>

      {/* ── Banca ── */}
      <section style={{ marginBottom: 20 }}>
        {sectionLabel('Banca')}
        {card(<>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>Banca Inicial (R$)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>R$</span>
              <input
                type="text"
                inputMode="decimal"
                value={bankrollInput}
                onChange={e => setBankrollInput(e.target.value.replace(/[^0-9,\.]/g, ''))}
                style={{
                  flex: 1, background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 8,
                  padding: '10px 12px', fontSize: 15, fontWeight: 700, color: 'var(--text)',
                  fontFamily: 'var(--font-cond)', outline: 'none', minWidth: 0,
                }}
              />
            </div>
          </div>

          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
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
                  <div style={{ fontSize: 10, marginTop: 3 }}>cap {p.cap}</div>
                </button>
              ))}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>
              {RISK_PROFILES.find(p => p.key === riskProfile)?.desc}
            </div>
          </div>

          <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              onClick={saveBanca}
              style={{
                padding: '10px 24px', borderRadius: 8, background: 'var(--lime)', color: '#000',
                fontSize: 12, fontWeight: 800, fontFamily: 'var(--font-cond)', textTransform: 'uppercase',
                border: 'none', cursor: 'pointer', letterSpacing: '0.04em',
              }}
            >
              Salvar banca
            </button>
            {bancaMsg && (
              <span style={{ fontSize: 12, color: bancaMsg === 'Salvo!' ? 'var(--green)' : 'var(--red)' }}>
                {bancaMsg}
              </span>
            )}
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

      {/* ── Privacidade ── */}
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
          <div style={{ padding: '14px 20px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>Mais sobre privacidade</div>
            <Link href={`/${locale}/privacidade`} style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'none' }}>
              Ler política de privacidade →
            </Link>
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
              Seus dados pessoais serão anonimizados. O histórico de apostas é mantido de forma anônima para preservar integridade contábil. Esta ação é irreversível.
            </p>
          </div>
          {deleteConfirm ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ fontSize: 12, color: 'var(--red)', margin: 0, fontWeight: 700 }}>
                Tem certeza? Esta ação não pode ser desfeita.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deletePending}
                  style={{ padding: '9px 20px', borderRadius: 8, background: 'var(--red)', border: 'none', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: deletePending ? 0.7 : 1 }}
                >
                  {deletePending ? 'Excluindo...' : 'Confirmar exclusão'}
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(false)}
                  style={{ padding: '9px 16px', borderRadius: 8, background: 'var(--s2)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleDeleteAccount}
              style={{ padding: '9px 20px', borderRadius: 8, background: 'oklch(50% 0.2 25 / 0.2)', border: '1px solid oklch(50% 0.2 25 / 0.5)', color: 'var(--red)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              Excluir minha conta
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
