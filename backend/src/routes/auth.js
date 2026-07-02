const router = require('express').Router()
const { login, alterarSenha } = require('../controllers/authController')
const { authMiddleware } = require('../middlewares/auth')

router.post('/login', login)
router.post('/alterar-senha', authMiddleware, alterarSenha)

module.exports = router
