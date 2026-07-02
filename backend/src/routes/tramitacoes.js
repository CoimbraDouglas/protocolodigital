const router = require('express').Router()
const { authMiddleware } = require('../middlewares/auth')
const { tramitar } = require('../controllers/tramitacaoController')
router.use(authMiddleware)
router.post('/', tramitar)
module.exports = router
