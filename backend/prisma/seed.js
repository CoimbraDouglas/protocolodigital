const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const setores = await Promise.all([
    prisma.setor.upsert({ where: { sigla: 'ADM' }, update: {}, create: { nome: 'Administração', sigla: 'ADM' } }),
    prisma.setor.upsert({ where: { sigla: 'RH' }, update: {}, create: { nome: 'Recursos Humanos', sigla: 'RH' } }),
    prisma.setor.upsert({ where: { sigla: 'FIN' }, update: {}, create: { nome: 'Financeiro', sigla: 'FIN' } }),
    prisma.setor.upsert({ where: { sigla: 'TI' }, update: {}, create: { nome: 'Tecnologia da Informação', sigla: 'TI' } }),
  ])

  const senhaHash = await bcrypt.hash('admin123', 10)

  await prisma.user.upsert({
    where: { email: 'admin@protocolo.com' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@protocolo.com',
      senha: senhaHash,
      perfil: 'ADMIN',
      setorId: setores[0].id,
    },
  })

  console.log('Seed concluído. Admin: admin@protocolo.com / admin123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
