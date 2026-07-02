const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function resumo(req, res) {
  const [pendente, em_tramitacao, concluido, arquivado, total] = await Promise.all([
    prisma.protocolo.count({ where: { status: 'PENDENTE' } }),
    prisma.protocolo.count({ where: { status: 'EM_TRAMITACAO' } }),
    prisma.protocolo.count({ where: { status: 'CONCLUIDO' } }),
    prisma.protocolo.count({ where: { status: 'ARQUIVADO' } }),
    prisma.protocolo.count(),
  ])
  res.json({ total, pendente, em_tramitacao, concluido, arquivado })
}

async function porSetor(req, res) {
  const setores = await prisma.setor.findMany({ where: { ativo: true } })
  const resultado = await Promise.all(
    setores.map(async (s) => ({
      setor: s.nome,
      sigla: s.sigla,
      pendente: await prisma.protocolo.count({ where: { setorId: s.id, status: 'PENDENTE' } }),
      em_tramitacao: await prisma.protocolo.count({ where: { setorId: s.id, status: 'EM_TRAMITACAO' } }),
      total: await prisma.protocolo.count({ where: { setorId: s.id } }),
    }))
  )
  res.json(resultado)
}

async function porPeriodo(req, res) {
  const { inicio, fim } = req.query
  if (!inicio || !fim) return res.status(400).json({ erro: 'Informe início e fim do período' })

  const protocolos = await prisma.protocolo.findMany({
    where: { dataEntrada: { gte: new Date(inicio), lte: new Date(fim) } },
    include: { setor: true, usuario: { select: { nome: true } } },
    orderBy: { dataEntrada: 'asc' },
  })
  res.json(protocolos)
}

module.exports = { resumo, porSetor, porPeriodo }
