require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')

const authRoutes = require('./routes/auth')
const setorRoutes = require('./routes/setores')
const usuarioRoutes = require('./routes/usuarios')
const protocoloRoutes = require('./routes/protocolos')
const tramitacaoRoutes = require('./routes/tramitacoes')
const relatorioRoutes = require('./routes/relatorios')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/setores', setorRoutes)
app.use('/api/usuarios', usuarioRoutes)
app.use('/api/protocolos', protocoloRoutes)
app.use('/api/tramitacoes', tramitacaoRoutes)
app.use('/api/relatorios', relatorioRoutes)

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

// Em produção, serve o frontend buildado (frontend/dist)
const distPath = path.join(__dirname, '../../frontend/dist')
app.use(express.static(distPath))
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next()
  res.sendFile(path.join(distPath, 'index.html'))
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))
