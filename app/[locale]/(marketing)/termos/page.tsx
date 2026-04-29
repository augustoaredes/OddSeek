export default function TermosPage() {
  return (
    <div style={{ maxWidth: 720, margin: '80px auto', padding: '24px 32px' }}>
      <h1 style={{ fontFamily: 'var(--font-cond)', fontSize: 36, fontWeight: 900, letterSpacing: '-0.01em', textTransform: 'uppercase', color: 'var(--text)', marginBottom: 8 }}>
        Termos de Uso
      </h1>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 32 }}>Última atualização: Abril 2025</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28, fontSize: 14, lineHeight: 1.8, color: 'var(--text)' }}>
        {[
          {
            title: '1. Natureza do Serviço',
            body: 'A OddSeek é uma plataforma de inteligência de apostas esportivas que agrega odds de casas de apostas terceiras, identifica apostas com Expected Value positivo (EV+) e fornece ferramentas de gestão de banca. A OddSeek NÃO é uma casa de apostas, NÃO opera como operadora de jogos e NÃO recebe dinheiro de apostas dos usuários. Toda e qualquer aposta é realizada diretamente nas plataformas parceiras, sob total responsabilidade do usuário.',
          },
          {
            title: '2. Elegibilidade',
            body: 'O uso da plataforma é restrito a maiores de 18 anos. Ao criar uma conta, o usuário declara ter idade mínima exigida e que as apostas esportivas são legalmente permitidas em sua jurisdição. A OddSeek reserva-se o direito de encerrar contas de usuários menores de idade ou em jurisdições que proíbam tais atividades.',
          },
          {
            title: '3. Sem Garantia de Lucro',
            body: 'As análises e tips fornecidas pela OddSeek são baseadas em modelos estatísticos e probabilísticos. O Expected Value positivo indica uma vantagem matemática esperada no longo prazo — não garante resultado em apostas individuais. Apostas envolvem risco inerente de perda. A OddSeek não garante, expressa ou implicitamente, qualquer retorno financeiro.',
          },
          {
            title: '4. Uso Responsável',
            body: 'O usuário compromete-se a apostar somente valores que pode perder sem prejuízo ao seu sustento. Em caso de perda de controle sobre apostas, recomendamos contato com serviços de apoio ao jogo responsável (ex.: Jogadores Anônimos). A OddSeek oferece ferramentas de limite de banca e alertas de risco como apoio, mas não substitui suporte profissional.',
          },
          {
            title: '5. Propriedade Intelectual',
            body: 'Todo conteúdo da plataforma — incluindo algoritmos, design, marca OddSeek e textos — é propriedade exclusiva da OddSeek. É proibida reprodução, distribuição ou uso comercial sem autorização prévia por escrito.',
          },
          {
            title: '6. Limitação de Responsabilidade',
            body: 'A OddSeek não se responsabiliza por perdas financeiras decorrentes do uso das análises ou tips. A plataforma é fornecida "como está", sem garantias de disponibilidade ininterrupta. Em nenhuma hipótese a responsabilidade total da OddSeek excederá o valor pago pelo usuário nos últimos 12 meses.',
          },
          {
            title: '7. Alterações',
            body: 'Estes termos podem ser atualizados periodicamente. Alterações materiais serão comunicadas com pelo menos 15 dias de antecedência via e-mail cadastrado. O uso continuado da plataforma após as alterações constitui aceitação dos novos termos.',
          },
        ].map(section => (
          <section key={section.title}>
            <h2 style={{ fontFamily: 'var(--font-cond)', fontSize: 18, fontWeight: 700, color: 'var(--lime)', marginBottom: 10, letterSpacing: '-0.01em' }}>{section.title}</h2>
            <p style={{ color: 'var(--muted)', margin: 0 }}>{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
