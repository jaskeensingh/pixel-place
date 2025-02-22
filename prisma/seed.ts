import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.user.create({
    data: {
      id: '1'
    }
  })
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect()) 