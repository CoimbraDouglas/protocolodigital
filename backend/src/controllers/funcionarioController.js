const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function listar(req, res) {
  const { setorId } = req.params
  const funcionarios = await prisma.funcionario.findMany({
    where: { setorId: Number(setorId) },
    orderBy: { nome: 'asc' },
  })
  res.json(funcionarios)
}

async function criar(req, res) {
  const { setorId } = req.params
  const { nome, email } = req.body
  if (!nome) return res.status(400).json({ erro: 'Nome do funcionário é obrigatório' })
  const funcionario = await prisma.funcionario.create({
    data: { nome, email: email || null, setorId: Number(setorId) },
  })
  res.status(201).json(funcionario)
}

async function atualizar(req, res) {
  const { funcId } = req.params
  const { nome, email } = req.body
  try {
    const funcionario = await prisma.funcionario.update({
      where: { id: Number(funcId) },
      data: { nome, email: email || null },
    })
    res.json(funcionario)
  } catch {
    res.status(404).json({ erro: 'Funcionário não encontrado' })
  }
}

async function remover(req, res) {
  const { funcId } = req.params
  try {
    await prisma.funcionario.delete({ where: { id: Number(funcId) } })
    res.status(204).end()
  } catch {
    res.status(404).json({ erro: 'Funcionário não encontrado' })
  }
}

module.exports = { listar, criar, atualizar, remover }
