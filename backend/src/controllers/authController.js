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

module.exports = { login }
