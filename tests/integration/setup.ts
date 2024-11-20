import { PrismaClient } from '@prisma/client'

if (process.env.NODE_ENV !== 'test') {
  throw new Error('NODE_ENV is not set to test')
}

beforeAll(async () => {
  const prisma = new PrismaClient()
  
  // 清空資料庫
  await prisma.transaction.deleteMany()
  await prisma.account.deleteMany()
  
  await prisma.$disconnect()
})

afterAll(done => {
  done()
})