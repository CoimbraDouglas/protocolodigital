const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function listar(req, res) {
  const usuarios = await prisma.user.findMany({
    select: { id: true, nome: true, email: true, perfil: true, ativo: true, setor: true, createdAt: true },
    orderBy: { nome: 'asc' },
  })
  res.json(usuarios)
}

async function criar(req, res) {
  const { nome, email, senha, perfil, setorId } = req.body
  if (!nome || !email || !senha) return res.status(400).json({ erro: 'Nome, email e senha obrigatórios' })
  try {
    const senhaHash = await bcrypt.hash(senha, 10)
    const usuario = await prisma.user.create({
      data: { nome, email, senha: senhaHash, perfil: perfil || 'OPERADOR', setorId: setorId ? Number(setorId) : null },
      select: { id: true, nome: true, email: true, perfil: true, setorId: true },
    })
    res.status(201).json(usuario)
  } catch {
    res.status(400).json({ erro: 'Email já cadastrado' })
  }
}

async function atualizar(req, res) {
  const { id } = req.params
  const { nome, perfil, setorId, ativo, senha } = req.body
  const data = { nome, perfil, ativo, setorId: setorId ? Number(setorId) : undefined }
  if (senha) data.senha = await bcrypt.hash(senha, 10)
  try {
    const usuario = await prisma.user.update({
      where: { id: Number(id) },
      data,
      select: { id: true, nome: true, email: true, perfil: true, ativo: true, setorId: true },
    })
    res.json(usuario)
  } catch {
    res.status(404).json({ erro: 'Usuário não encontrado' })
  }
}

module.exports = { listar, criar, atualizar }
