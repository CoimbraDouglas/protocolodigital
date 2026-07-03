// Serviço de e-mail (notificações do Protocolo Digital)
//
// Envio via SMTP genérico, configurado por variáveis de ambiente. Funciona com
// Gmail / Google Workspace (csa.g12.br) usando uma "Senha de app".
//
// Se as variáveis SMTP não estiverem definidas, o envio é ignorado de forma
// silenciosa (no-op) — o sistema continua funcionando normalmente sem e-mail.
const nodemailer = require('nodemailer')

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
  EMAIL_FROM,
  APP_URL,
} = process.env

let transporter = null

function emailConfigurado() {
  return Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS)
}

function getTransporter() {
  if (transporter) return transporter
  if (!emailConfigurado()) return null
  const port = Number(SMTP_PORT) || 587
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    // secure=true para porta 465 (SSL); false para 587 (STARTTLS)
    secure: SMTP_SECURE != null ? SMTP_SECURE === 'true' : port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  })
  return transporter
}

// Envio genérico. Retorna { enviado: boolean, ... } e nunca lança por falta de
// configuração — a decisão de logar/tratar fica com quem chama.
async function enviar({ to, subject, text, html }) {
  if (!to) return { enviado: false, motivo: 'sem-destinatario' }
  const t = getTransporter()
  if (!t) {
    console.warn(`[email] SMTP não configurado — e-mail não enviado: "${subject}"`)
    return { enviado: false, motivo: 'smtp-nao-configurado' }
  }
  const from = EMAIL_FROM || SMTP_USER
  const info = await t.sendMail({ from, to, subject, text, html })
  console.log(`[email] enviado: ${info.messageId} → ${to}`)
  return { enviado: true, messageId: info.messageId }
}

function linkProtocolo(protocolo) {
  if (!APP_URL || !protocolo?.id) return null
  return `${APP_URL.replace(/\/$/, '')}/protocolos/${protocolo.id}`
}

function formatarData(valor) {
  if (!valor) return '—'
  try {
    return new Date(valor).toLocaleDateString('pt-BR')
  } catch {
    return String(valor)
  }
}

// --- Template base (HTML) --------------------------------------------------

function linha(rotulo, valor) {
  if (valor == null || valor === '') return ''
  return `<tr>
    <td style="padding:6px 12px 6px 0;color:#6b7280;font-size:13px;white-space:nowrap;vertical-align:top">${rotulo}</td>
    <td style="padding:6px 0;color:#111827;font-size:14px">${valor}</td>
  </tr>`
}

function moldura({ titulo, saudacao, intro, linhas, link, textoBotao }) {
  const botao = link
    ? `<div style="margin-top:24px">
         <a href="${link}" style="display:inline-block;background:#6d1f2b;color:#fff;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:14px">${textoBotao || 'Abrir protocolo'}</a>
       </div>`
    : ''
  return `<div style="font-family:Arial,Helvetica,sans-serif;background:#f3f4f6;padding:24px">
    <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb">
      <div style="background:#6d1f2b;color:#fff;padding:16px 24px;font-size:16px;font-weight:bold">${titulo}</div>
      <div style="padding:24px">
        <p style="margin:0 0 12px;color:#111827;font-size:14px">${saudacao}</p>
        <p style="margin:0 0 16px;color:#374151;font-size:14px">${intro}</p>
        <table style="border-collapse:collapse;width:100%">${linhas}</table>
        ${botao}
      </div>
      <div style="padding:12px 24px;background:#fafafa;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:12px">
        Mensagem automática do Sistema de Protocolo Digital.
      </div>
    </div>
  </div>`
}

// --- E-mail 1: abertura do protocolo (enviado ao destinatário escolhido) ---

function montarEmailNovoProtocolo(protocolo, nomeDestinatario) {
  const link = linkProtocolo(protocolo)
  const subject = `Novo protocolo ${protocolo.numero} — ${protocolo.assunto || ''}`.trim()

  const dados = [
    ['Número', protocolo.numero],
    ['Tipo documental', protocolo.assunto],
    ['Tipo', protocolo.tipo],
    ['Remetente', protocolo.remetente],
    ['Setor responsável', protocolo.setor?.nome],
    ['Setor destinatário', protocolo.setorDestinatario?.nome],
    ['Aberto em', formatarData(protocolo.dataEntrada || protocolo.createdAt)],
    ['Descrição', protocolo.descricao],
  ]

  const text = [
    `Olá ${nomeDestinatario || ''},`.trim(),
    '',
    'Um novo protocolo foi aberto e endereçado a você:',
    '',
    ...dados.filter(([, v]) => v).map(([r, v]) => `${r}: ${v}`),
    ...(link ? ['', `Acesse: ${link}`] : []),
    '',
    'Mensagem automática do Sistema de Protocolo Digital.',
  ].join('\n')

  const html = moldura({
    titulo: 'Novo protocolo endereçado a você',
    saudacao: `Olá ${nomeDestinatario || ''},`.trim(),
    intro: 'Um novo protocolo foi aberto e endereçado a você. Confira os dados abaixo:',
    linhas: dados.map(([r, v]) => linha(r, v)).join(''),
    link,
    textoBotao: 'Abrir protocolo',
  })

  return { subject, text, html }
}

async function enviarEmailNovoProtocolo({ para, nomeDestinatario, protocolo }) {
  if (!para) return { enviado: false, motivo: 'sem-email' }
  const { subject, text, html } = montarEmailNovoProtocolo(protocolo, nomeDestinatario)
  return enviar({ to: para, subject, text, html })
}

// --- E-mail 2: lembrete do prazo -------------------------------------------
//
// DESABILITADO POR ENQUANTO. A função de envio está pronta, mas ainda não há
// agendador que a acione. Para habilitar o disparo automático no prazo
// (protocolo.lembreteData), será preciso:
//   1. Adicionar o campo `lembreteEnviado Boolean @default(false)` no Protocolo
//      (schema.prisma) para evitar envios duplicados.
//   2. Criar um agendador (node-cron no backend OU um Render Cron Job) que rode
//      periodicamente, busque protocolos com lembreteData <= hoje e
//      lembreteEnviado = false, chame enviarEmailLembrete() e marque como enviado.

function montarEmailLembrete(protocolo, nomeDestinatario) {
  const link = linkProtocolo(protocolo)
  const subject = `Lembrete — protocolo ${protocolo.numero}`

  const dados = [
    ['Número', protocolo.numero],
    ['Tipo documental', protocolo.assunto],
    ['Remetente', protocolo.remetente],
    ['Setor responsável', protocolo.setor?.nome],
    ['Prazo do lembrete', formatarData(protocolo.lembreteData)],
    ['Nota', protocolo.lembreteNota],
  ]

  const text = [
    `Olá ${nomeDestinatario || ''},`.trim(),
    '',
    'Este é um lembrete referente ao protocolo abaixo:',
    '',
    ...dados.filter(([, v]) => v).map(([r, v]) => `${r}: ${v}`),
    ...(link ? ['', `Acesse: ${link}`] : []),
  ].join('\n')

  const html = moldura({
    titulo: 'Lembrete de protocolo',
    saudacao: `Olá ${nomeDestinatario || ''},`.trim(),
    intro: 'Este é um lembrete referente ao protocolo abaixo:',
    linhas: dados.map(([r, v]) => linha(r, v)).join(''),
    link,
    textoBotao: 'Abrir protocolo',
  })

  return { subject, text, html }
}

async function enviarEmailLembrete({ para, nomeDestinatario, protocolo }) {
  if (!para) return { enviado: false, motivo: 'sem-email' }
  const { subject, text, html } = montarEmailLembrete(protocolo, nomeDestinatario)
  return enviar({ to: para, subject, text, html })
}

module.exports = {
  emailConfigurado,
  enviar,
  montarEmailNovoProtocolo,
  enviarEmailNovoProtocolo,
  montarEmailLembrete,
  enviarEmailLembrete,
}
