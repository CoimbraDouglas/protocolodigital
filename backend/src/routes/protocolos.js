const router = require('express').Router()
const { authMiddleware } = require('../middlewares/auth')
const { listar, buscarPorId, criar, atualizar } = require('../controllers/protocoloController')
router.use(authMiddleware)
router.get('/', listar)
router.get('/:id', buscarPorId)
router.post('/', criar)
router.patch('/:id', atualizar)
module.exports = router
