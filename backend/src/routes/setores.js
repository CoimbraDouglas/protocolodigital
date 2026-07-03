const router = require('express').Router()
const { authMiddleware, adminOnly } = require('../middlewares/auth')
const { listar, criar, atualizar } = require('../controllers/setorController')
const funcionario = require('../controllers/funcionarioController')
router.use(authMiddleware)
router.get('/', listar)
router.post('/', adminOnly, criar)
router.patch('/:id', adminOnly, atualizar)

// Funcionários de um setor (não são usuários do sistema)
router.get('/:setorId/funcionarios', funcionario.listar)
router.post('/:setorId/funcionarios', adminOnly, funcionario.criar)
router.patch('/:setorId/funcionarios/:funcId', adminOnly, funcionario.atualizar)
router.delete('/:setorId/funcionarios/:funcId', adminOnly, funcionario.remover)

module.exports = router
