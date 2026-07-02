const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function listar(req, res) {
  const setores = await prisma.setor.findMany({ orderBy: { nome: 'asc' } })
  res.json(setores)
}

async function criar(req, res) {
  const { nome, sigla } = req.body
  if (!nome || !sigla) return res.status(400).json({ erro: 'Nome e sigla obrigatórios' })
  try {
    const setor = await prisma.setor.create({ data: { nome, sigla: sigla.toUpperCase() } })
    res.status(201).json(setor)
  } catch {
    res.status(400).json({ erro: 'Sigla já cadastrada' })
  }
}

async function atualizar(req, res) {
  const { id } = req.params
  const { nome, sigla, ativo } = req.body
  try {
    const setor = await prisma.setor.update({
      where: { id: Number(id) },
      data: { nome, sigla: sigla?.toUpperCase(), ativo },
    })
    res.json(setor)
  } catch {
    res.status(404).json({ erro: 'Setor não encontrado' })
  }
}

module.exports = { listar, criar, atualizar }
