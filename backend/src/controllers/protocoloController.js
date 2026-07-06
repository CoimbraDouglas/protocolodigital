const { PrismaClient } = require('@prisma/client')
const { enviarEmailNovoProtocolo } = require('../services/email')
const prisma = new PrismaClient()

function gerarNumero(ano, seq) {
  return `${String(seq).padStart(5, '0')}/${ano}`
}

// Notifica por e-mail o destinatário escolhido na abertura do protocolo.
// O e-mail é obtido a partir do funcionário (nome + setor) já cadastrado.
// Falhas aqui não afetam a criação do protocolo — apenas são logadas.
async function notificarDestinatario(protocolo, { nomeDestinatario, setorDestinatarioId }) {
  if (!nomeDestinatario || !setorDestinatarioId) return
  const funcionario = await prisma.funcionario.findFirst({
    where: { nome: nomeDestinatario, setorId: Number(setorDestinatarioId) },
  })
  if (!funcionario?.email) {
    console.warn(`[email] Destinatário "${nomeDestinatario}" sem e-mail cadastrado — notificação não enviada.`)
    return
  }
  await enviarEmailNovoProtocolo({ para: funcionario.email, nomeDestinatario, protocolo })
}

async function listar(req, res) {
  const { status, tipo, setorId, busca, pagina = 1 } = req.query
  const where = {}
  if (status) where.status = status
  if (tipo) where.tipo = tipo
  if (setorId) where.setorId = Number(setorId)
  if (busca) {
    where.OR = [
      { numero: { contains: busca, mode: 'insensitive' } },
      { assunto: { contains: busca, mode: 'insensitive' } },
      { remetente: { contains: busca, mode: 'insensitive' } },
    ]
  }

  const [total, protocolos] = await Promise.all([
    prisma.protocolo.count({ where }),
    prisma.protocolo.findMany({
      where,
      include: { setor: true, usuario: { select: { id: true, nome: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (Number(pagina) - 1) * 20,
      take: 20,
    }),
  ])

  res.json({ total, paginas: Math.ceil(total / 20), pagina: Number(pagina), protocolos })
}

async function buscarPorId(req, res) {
  const { id } = req.params
  const protocolo = await prisma.protocolo.findUnique({
    where: { id: Number(id) },
    include: {
      setor: true,
      setorDestinatario: true,
      usuario: { select: { id: true, nome: true } },
      tramitacoes: {
        include: {
          setorOrigem: true,
          setorDestino: true,
          usuario: { select: { id: true, nome: true } },
        },
        orderBy: { dataHora: 'asc' },
      },
    },
  })
  if (!protocolo) return res.status(404).json({ erro: 'Protocolo não encontrado' })
  res.json(protocolo)
}

async function criar(req, res) {
  const { assunto, tipo, remetente, descricao, setorId, setorDestinatarioId,
    dataRemetido, nomeDestinatario, lembreteData, lembreteNota } = req.body
  if (!assunto || !remetente || !setorId) return res.status(400).json({ erro: 'Campos obrigatórios faltando' })

  const ano = new Date().getFullYear()
  const ultimo = await prisma.protocolo.findFirst({
    where: { numero: { endsWith: `/${ano}` } },
    orderBy: { id: 'desc' },
  })
  const seq = ultimo ? Number(ultimo.numero.split('/')[0]) + 1 : 1
  const numero = gerarNumero(ano, seq)

  const protocolo = await prisma.protocolo.create({
    data: {
      numero,
      assunto,
      tipo: tipo || 'ENTRADA',
      remetente,
      descricao,
      setorId: Number(setorId),
      setorDestinatarioId: setorDestinatarioId ? Number(setorDestinatarioId) : null,
      dataRemetido: dataRemetido ? new Date(dataRemetido) : null,
      nomeDestinatario: nomeDestinatario || null,
      lembreteData: lembreteData ? new Date(lembreteData) : null,
      lembreteNota: lembreteNota || null,
      usuarioId: req.usuario.id,
    },
    include: { setor: true, setorDestinatario: true },
  })
  res.status(201).json(protocolo)

  // Notificação de abertura (não bloqueia a resposta e não derruba o cadastro).
  notificarDestinatario(protocolo, { nomeDestinatario, setorDestinatarioId }).catch((err) =>
    console.error(`[email] Falha ao notificar destinatário do protocolo ${protocolo.numero}:`, err.message)
  )
}

async function atualizar(req, res) {
  const { id } = req.params
  const { assunto, remetente, descricao, status, dataFecho } = req.body
  try {
    const protocolo = await prisma.protocolo.update({
      where: { id: Number(id) },
      data: { assunto, remetente, descricao, status, dataFecho: dataFecho ? new Date(dataFecho) : undefined },
    })
    res.json(protocolo)
  } catch {
    res.status(404).json({ erro: 'Protocolo não encontrado' })
  }
}

// Exclui o protocolo e todo o seu histórico. As tramitações têm FK para o
// protocolo, então são removidas antes, na mesma transação (tudo ou nada).
async function excluir(req, res) {
  const protocoloId = Number(req.params.id)
  try {
    await prisma.$transaction([
      prisma.tramitacao.deleteMany({ where: { protocoloId } }),
      prisma.protocolo.delete({ where: { id: protocoloId } }),
    ])
    res.status(204).end()
  } catch {
    res.status(404).json({ erro: 'Protocolo não encontrado' })
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir }
