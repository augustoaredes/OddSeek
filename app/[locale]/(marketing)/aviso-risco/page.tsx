export default function AvisoRiscoPage() {
  return (
    <div style={{ maxWidth: 720, margin: '80px auto', padding: '24px 32px' }}>
      {/* Warning banner */}
      <div style={{ padding: '20px 24px', background: 'oklch(50% 0.2 25 / 0.15)', border: '2px solid oklch(50% 0.2 25 / 0.5)', borderRadius: 12, marginBottom: 32, display: 'flex', gap: 16 }}>
        <span style={{ fontSize: 32, flexShrink: 0 }}>⚠️</span>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--red)', fontFamily: 'var(--font-cond)', letterSpacing: '-0.01em', marginBottom: 6 }}>
            APOSTAS ENVOLVEM RISCO FINANCEIRO REAL
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            Você pode perder todo o dinheiro apostado. Aposte apenas o que pode perder sem comprometer seu sustento e de sua família. Menores de 18 anos estão proibidos de participar.
          </p>
        </div>
      </div>

      <h1 style={{ fontFamily: 'var(--font-cond)', fontSize: 36, fontWeight: 900, letterSpacing: '-0.01em', textTransform: 'uppercase', color: 'var(--text)', marginBottom: 8 }}>
        Aviso de Risco
      </h1>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 32 }}>Leia com atenção antes de utilizar qualquer análise ou tip da plataforma.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28, fontSize: 14, lineHeight: 1.8 }}>
        {[
          {
            icon: '📊',
            title: 'EV+ não garante lucro imediato',
            body: 'Expected Value positivo é uma métrica matemática de longo prazo. Em amostras pequenas (menos de 200 apostas), a variância pode gerar sequências de perdas mesmo com edge real. Resultados negativos em curto prazo são esperados e fazem parte da natureza estatística das apostas.',
          },
          {
            icon: '💰',
            title: 'Risco de ruína',
            body: 'Apostar valores acima dos sugeridos pelo critério de Kelly aumenta significativamente o risco de ruína (perda total da banca). Nunca ignore os alertas de stake da plataforma. Gestão de banca é mais importante do que encontrar boas apostas.',
          },
          {
            icon: '🧠',
            title: 'Viés cognitivo e controle emocional',
            body: 'Perdas consecutivas podem levar ao "tilt" — estado emocional que compromete decisões racionais. A plataforma emite alertas após 3+ derrotas seguidas. Nesses momentos, recomendamos pausar e revisar a estratégia com calma, não aumentar stakes para "recuperar".',
          },
          {
            icon: '⚖️',
            title: 'Legalidade por jurisdição',
            body: 'A legalidade de apostas esportivas varia por país e estado. É responsabilidade exclusiva do usuário verificar se apostas são permitidas em sua jurisdição. A OddSeek não oferece serviço em jurisdições onde apostas online são expressamente proibidas.',
          },
          {
            icon: '🆘',
            title: 'Jogo responsável — recursos de ajuda',
            body: 'Se você ou alguém que você conhece perdeu o controle sobre apostas, procure ajuda:\n• Jogadores Anônimos Brasil: jogadoresanonimos.com.br\n• CVV (Centro de Valorização da Vida): 188\n• CAPS (Centro de Atenção Psicossocial): procure a unidade mais próxima',
          },
          {
            icon: '🔞',
            title: 'Restrição de idade',
            body: 'A OddSeek é estritamente proibida para menores de 18 anos. Verificamos a idade no cadastro e podemos solicitar comprovação adicional. Contas de menores identificados serão encerradas imediatamente e o acesso bloqueado.',
          },
        ].map(section => (
          <section key={section.title} style={{ display: 'flex', gap: 16 }}>
            <span style={{ fontSize: 24, flexShrink: 0, lineHeight: 1.4 }}>{section.icon}</span>
            <div>
              <h2 style={{ fontFamily: 'var(--font-cond)', fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{section.title}</h2>
              <p style={{ color: 'var(--muted)', margin: 0, whiteSpace: 'pre-line' }}>{section.body}</p>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
