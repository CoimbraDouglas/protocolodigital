const router = require('express').Router()
const { authMiddleware } = require('../middlewares/auth')
const { resumo, porSetor, porPeriodo } = require('../controllers/relatorioController')
router.use(authMiddleware)
router.get('/resumo', resumo)
router.get('/por-setor', porSetor)
router.get('/por-periodo', porPeriodo)
module.exports = router
