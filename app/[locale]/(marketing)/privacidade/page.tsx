export default function PrivacidadePage() {
  return (
    <div style={{ maxWidth: 720, margin: '80px auto', padding: '24px 32px' }}>
      <h1 style={{ fontFamily: 'var(--font-cond)', fontSize: 36, fontWeight: 900, letterSpacing: '-0.01em', textTransform: 'uppercase', color: 'var(--text)', marginBottom: 8 }}>
        Política de Privacidade
      </h1>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 32 }}>Última atualização: Abril 2025 · Conforme Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018)</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28, fontSize: 14, lineHeight: 1.8, color: 'var(--text)' }}>
        {[
          {
            title: '1. Controlador de Dados',
            body: 'A OddSeek atua como controladora dos dados pessoais coletados na plataforma. Dúvidas ou solicitações podem ser enviadas ao encarregado de dados (DPO) via privacidade@oddseek.app.',
          },
          {
            title: '2. Dados Coletados',
            body: 'Coletamos: (a) dados de cadastro (nome, e-mail, data de nascimento); (b) dados de uso (apostas registradas, preferências, histórico de navegação na plataforma); (c) dados técnicos (IP anonimizado, tipo de dispositivo, logs de acesso). Não coletamos dados financeiros de cartões ou contas bancárias.',
          },
          {
            title: '3. Bases Legais (LGPD)',
            body: 'Tratamos seus dados com base em: execução de contrato (prestação do serviço), consentimento (comunicações de marketing e cookies analíticos), legítimo interesse (segurança e prevenção a fraudes) e cumprimento de obrigação legal (registros de auditoria exigidos por regulação).',
          },
          {
            title: '4. Uso dos Dados',
            body: 'Utilizamos seus dados para: prestar e melhorar o serviço, personalizar recomendações de tips, enviar alertas de gestão de banca, processar links de afiliado (IP anonimizado via SHA-256), garantir segurança da conta e cumprir obrigações legais.',
          },
          {
            title: '5. Compartilhamento',
            body: 'Não vendemos dados pessoais. Compartilhamos apenas com: provedores de infraestrutura (Neon, Upstash, Vercel) sob contratos com garantias de privacidade, e autoridades legais quando exigido por lei. Dados compartilhados com afiliados são restritos a cliques anônimos (sem PII).',
          },
          {
            title: '6. Retenção',
            body: 'Dados de conta são mantidos enquanto a conta estiver ativa e por até 5 anos após encerramento (obrigação contábil). Logs de acesso são retidos por 6 meses. Solicitações de exclusão são processadas em até 15 dias úteis.',
          },
          {
            title: '7. Seus Direitos (LGPD)',
            body: 'Você tem direito a: confirmar o tratamento dos seus dados, acessar seus dados, corrigir dados incompletos, solicitar anonimização ou exclusão, revogar consentimento, e solicitar portabilidade. Exercite seus direitos via Configurações > Privacidade > Exclusão de Conta ou por e-mail ao DPO.',
          },
          {
            title: '8. Cookies',
            body: 'Utilizamos cookies essenciais (autenticação, preferências de idioma) e analíticos (comportamento agregado). Cookies de marketing só são ativados com consentimento explícito. Gerencie preferências a qualquer momento nas configurações do navegador.',
          },
        ].map(section => (
          <section key={section.title}>
            <h2 style={{ fontFamily: 'var(--font-cond)', fontSize: 18, fontWeight: 700, color: 'var(--lime)', marginBottom: 10 }}>{section.title}</h2>
            <p style={{ color: 'var(--muted)', margin: 0 }}>{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
