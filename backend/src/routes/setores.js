const router = require('express').Router()
const { authMiddleware, adminOnly } = require('../middlewares/auth')
const { listar, criar, atualizar } = require('../controllers/setorController')
router.use(authMiddleware)
router.get('/', listar)
router.post('/', adminOnly, criar)
router.patch('/:id', adminOnly, atualizar)
module.exports = router
