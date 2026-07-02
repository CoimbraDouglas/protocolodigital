const jwt = require('jsonwebtoken')

function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header) return res.status(401).json({ erro: 'Token não informado' })

  const token = header.split(' ')[1]
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.usuario = payload
    next()
  } catch {
    return res.status(401).json({ erro: 'Token inválido' })
  }
}

function adminOnly(req, res, next) {
  if (req.usuario.perfil !== 'ADMIN') {
    return res.status(403).json({ erro: 'Acesso restrito ao administrador' })
  }
  next()
}

module.exports = { authMiddleware, adminOnly }
