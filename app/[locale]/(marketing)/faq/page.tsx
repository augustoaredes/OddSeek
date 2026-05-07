'use client';

import { useState } from 'react';
import Link from 'next/link';

const FAQS = [
  {
    category: 'Sobre a OddSeek',
    items: [
      {
        q: 'O que é a OddSeek?',
        a: 'A OddSeek é uma plataforma de inteligência de apostas esportivas. Agregamos odds de múltiplas casas, calculamos o Expected Value (EV) de cada mercado e ajudamos apostadores a identificar oportunidades com vantagem matemática real.',
      },
      {
        q: 'A OddSeek é uma casa de apostas?',
        a: 'Não. A OddSeek não opera como casa de apostas, não recebe dinheiro de apostas e não tem licença de operadora de jogos. Somos uma plataforma de análise e gestão — todas as apostas são feitas diretamente nas casas parceiras.',
      },
      {
        q: 'A OddSeek é gratuita?',
        a: 'Sim, o plano Explorador é gratuito para sempre. Você tem acesso às principais funcionalidades de análise, comparação de odds e gestão de banca sem precisar de cartão de crédito.',
      },
      {
        q: 'A OddSeek é legal no Brasil?',
        a: 'Sim. A OddSeek opera como agregador de informações e ferramenta de análise, sem envolvimento em transações de apostas. Seguimos a LGPD e as leis brasileiras aplicáveis a plataformas de software.',
      },
    ],
  },
  {
    category: 'EV e Probabilidade',
    items: [
      {
        q: 'O que é Expected Value (EV)?',
        a: 'EV é o retorno matemático esperado de uma aposta no longo prazo. EV+ significa que a odd disponível supera a probabilidade real estimada do evento — há uma vantagem matemática. EV- significa que a casa tem vantagem sobre você naquela aposta.',
      },
      {
        q: 'Como a OddSeek calcula a probabilidade real?',
        a: 'Usamos o método Devigorize (Power Method) para remover a margem da casa (vig) das odds coletadas. O consensus das probabilidades devigiorizadas de múltiplas casas é nossa estimativa da probabilidade real do evento.',
      },
      {
        q: 'EV+ garante lucro em todas as apostas?',
        a: 'Não. EV+ indica vantagem matemática esperada no longo prazo — não garante resultado em apostas individuais. Você pode ter EV+ e ainda perder uma aposta. A vantagem se manifesta em centenas de apostas, não em uma única.',
      },
      {
        q: 'O que é o Critério de Kelly?',
        a: 'Kelly é uma fórmula matemática para calcular o tamanho ideal de stake baseado no EV e na probabilidade estimada. Usamos half-Kelly (50% da fórmula original) para reduzir o risco. O stake sugerido também é limitado pelo perfil de risco da sua banca.',
      },
    ],
  },
  {
    category: 'Gestão de Banca',
    items: [
      {
        q: 'Como funciona a gestão de banca?',
        a: 'Você define sua banca inicial e seu perfil de risco (conservador, moderado ou agressivo). Para cada tip, calculamos o stake sugerido com base no Kelly e no seu perfil. A plataforma monitora seu ROI, hit rate e evolução patrimonial.',
      },
      {
        q: 'Quais são os perfis de risco?',
        a: 'Conservador: stake máximo de 1% da banca por aposta. Moderado: 3%. Agressivo: 5%. Todos usam half-Kelly como base, respeitando esses caps por segurança.',
      },
      {
        q: 'O que são os alertas de banca?',
        a: 'Alertas automáticos são disparados quando: você registra 3 perdas consecutivas, o stake é muito acima do sugerido, o drawdown diário ultrapassa 10% ou sua banca cai abaixo de 50% do valor inicial.',
      },
    ],
  },
  {
    category: 'Conta e Privacidade',
    items: [
      {
        q: 'Como deletar minha conta?',
        a: 'Acesse Configurações → Conta → Excluir conta. Seus dados pessoais são anonimizados imediatamente (conformidade com LGPD). O histórico de apostas é preservado de forma anonimizada para manter integridade das estatísticas da plataforma.',
      },
      {
        q: 'A OddSeek compartilha meus dados?',
        a: 'Não vendemos dados pessoais. Dados são compartilhados apenas com fornecedores de infraestrutura (banco de dados, cache) sob contratos de processamento adequados. Veja nossa Política de Privacidade para detalhes completos.',
      },
      {
        q: 'Posso usar o login do Google?',
        a: 'Sim. Aceitamos login via Google OAuth além de email/senha tradicionais. O login social não compartilha sua senha com a OddSeek — apenas email e nome são recebidos do Google.',
      },
    ],
  },
];

export default function FaqPage() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '80px 32px 120px' }}>

      {/* Header */}
      <div style={{ marginBottom: 56 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--lime)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 20, height: 2, background: 'var(--lime)', display: 'inline-block', borderRadius: 2 }} />
          Perguntas Frequentes
        </div>
        <h1 style={{ fontFamily: 'var(--font-cond)', fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-.02em', lineHeight: .95, color: 'var(--text)', margin: '0 0 16px' }}>
          FAQ
        </h1>
        <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.6 }}>
          Não encontrou o que procura?{' '}
          <Link href="/pt-BR/contato" style={{ color: 'var(--lime)', textDecoration: 'none' }}>Fale conosco →</Link>
        </p>
      </div>

      {/* Accordion */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        {FAQS.map(section => (
          <div key={section.category}>
            <div style={{ fontFamily: 'var(--font-cond)', fontSize: 13, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--lime)', marginBottom: 16 }}>
              {section.category}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, background: 'var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              {section.items.map(item => {
                const key = `${section.category}:${item.q}`;
                const isOpen = open === key;
                return (
                  <div key={key} style={{ background: 'var(--surface)' }}>
                    <button
                      onClick={() => setOpen(isOpen ? null : key)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer',
                        textAlign: 'left', gap: 12,
                      }}
                    >
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', lineHeight: 1.4 }}>{item.q}</span>
                      <span style={{ color: 'var(--lime)', flexShrink: 0, fontSize: 18, fontWeight: 300, lineHeight: 1, transform: isOpen ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span>
                    </button>
                    {isOpen && (
                      <div style={{ padding: '0 20px 18px', fontSize: 13, color: 'var(--muted)', lineHeight: 1.8 }}>
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div style={{ marginTop: 64, padding: '28px 28px', background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 12, textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-cond)', fontSize: 22, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-.01em', color: 'var(--text)', marginBottom: 8 }}>
          Ainda tem dúvidas?
        </div>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.6 }}>Nossa equipe responde em até 24 horas.</p>
        <Link href="/pt-BR/contato" style={{ fontFamily: 'var(--font-cond)', fontWeight: 800, fontSize: 13, letterSpacing: '.06em', textTransform: 'uppercase', background: 'var(--lime)', color: '#000', padding: '11px 24px', borderRadius: 8, textDecoration: 'none' }}>
          Enviar mensagem
        </Link>
      </div>
    </div>
  );
}
