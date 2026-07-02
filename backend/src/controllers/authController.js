const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const prisma = new PrismaClient()

async function login(req, res) {
  const { email, senha } = req.body
  if (!email || !senha) return res.status(400).json({ erro: 'Email e senha obrigatórios' })

  const usuario = await prisma.user.findUnique({ where: { email }, include: { setor: true } })
  if (!usuario || !usuario.ativo) return res.status(401).json({ erro: 'Credenciais inválidas' })

  const senhaOk = await bcrypt.compare(senha, usuario.senha)
  if (!senhaOk) return res.status(401).json({ erro: 'Credenciais inválidas' })

  const token = jwt.sign(
    { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil, setorId: usuario.setorId },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  )

  res.json({ token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil, setor: usuario.setor } })
}

async function alterarSenha(req, res) {
  const { senhaAtual, novaSenha } = req.body
  if (!senhaAtual || !novaSenha) return res.status(400).json({ erro: 'Senha atual e nova senha são obrigatórias' })
  if (novaSenha.length < 6) return res.status(400).json({ erro: 'A nova senha deve ter pelo menos 6 caracteres' })

  const usuario = await prisma.user.findUnique({ where: { id: req.usuario.id } })
  if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' })

  const senhaOk = await bcrypt.compare(senhaAtual, usuario.senha)
  if (!senhaOk) return res.status(400).json({ erro: 'Senha atual incorreta' })

  const novaHash = await bcrypt.hash(novaSenha, 10)
  await prisma.user.update({ where: { id: usuario.id }, data: { senha: novaHash } })

  res.json({ mensagem: 'Senha alterada com sucesso' })
}

module.exports = { login, alterarSenha }
