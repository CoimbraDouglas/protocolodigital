const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function tramitar(req, res) {
  const { protocoloId, setorDestinoId, observacao } = req.body
  if (!protocoloId || !setorDestinoId) return res.status(400).json({ erro: 'Protocolo e setor de destino obrigatórios' })

  const protocolo = await prisma.protocolo.findUnique({ where: { id: Number(protocoloId) } })
  if (!protocolo) return res.status(404).json({ erro: 'Protocolo não encontrado' })
  if (protocolo.status === 'CONCLUIDO' || protocolo.status === 'ARQUIVADO') {
    return res.status(400).json({ erro: 'Protocolo encerrado não pode ser tramitado' })
  }

  const tramitacao = await prisma.tramitacao.create({
    data: {
      protocoloId: Number(protocoloId),
      setorOrigemId: protocolo.setorId,
      setorDestinoId: Number(setorDestinoId),
      usuarioId: req.usuario.id,
      observacao,
    },
    include: { setorOrigem: true, setorDestino: true, usuario: { select: { id: true, nome: true } } },
  })

  await prisma.protocolo.update({
    where: { id: Number(protocoloId) },
    data: { setorId: Number(setorDestinoId), status: 'EM_TRAMITACAO' },
  })

  res.status(201).json(tramitacao)
}

module.exports = { tramitar }
