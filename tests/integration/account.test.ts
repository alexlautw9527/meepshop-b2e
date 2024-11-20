import { PrismaClient } from '@prisma/client'
import request from 'supertest'
import { Express } from 'express'
import { createApp } from '../../src/server' 
import { Account } from '../../src/types/entities'

describe('Banking System API Integration Tests', () => {
  let app: Express
  let prisma: PrismaClient
  
  beforeAll(async () => {
    app = await createApp()
    prisma = new PrismaClient()
  })

  beforeEach(async () => {
    // 清理測試資料庫
    await prisma.transaction.deleteMany()
    await prisma.account.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('POST /api/accounts', () => {
    it('should create a new account with valid data', async () => {
      const response = await request(app)
        .post('/api/accounts')
        .send({
          name: '王大明',
          initialBalance: 1000
        })
        .expect(201)

      expect(response.body).toMatchObject({
        name: '王大明',
        balance: 1000
      })
      expect(response.body.id).toBeDefined()
    })

    it('should reject negative initial balance', async () => {
      const response = await request(app)
        .post('/api/accounts')
        .send({
          name: '王大明',
          initialBalance: -100
        })
        .expect(400)

      expect(response.body.error).toBe('Initial balance cannot be negative')
    })
  })

  describe('POST /api/accounts/:accountId/deposit', () => {
    let account: Account

    beforeEach(async () => {
      account = await prisma.account.create({
        data: {
          name: 'Test Account',
          balance: 1000
        }
      })
    })

    it('should deposit money to an account', async () => {
      const response = await request(app)
        .post(`/api/accounts/${account.id}/deposit`)
        .send({ amount: 500 })
        .expect(200)

      expect(response.body.balance).toBe(1500)
    })

    it('should reject negative deposit amount', async () => {
      const response = await request(app)
        .post(`/api/accounts/${account.id}/deposit`)
        .send({ amount: -100 })
        .expect(400)

      expect(response.body.error).toBe('Deposit amount must be positive')
    })
  })

  describe('POST /api/accounts/:accountId/withdraw', () => {
    let account: Account

    beforeEach(async () => {
      account = await prisma.account.create({
        data: {
          name: 'Test Account',
          balance: 1000
        }
      })
    })

    it('should withdraw money from an account', async () => {
      const response = await request(app)
        .post(`/api/accounts/${account.id}/withdraw`)
        .send({ amount: 500 })
        .expect(200)

      expect(response.body.balance).toBe(500)
    })

    it('should reject withdrawal exceeding balance', async () => {
      const response = await request(app)
        .post(`/api/accounts/${account.id}/withdraw`)
        .send({ amount: 1500 })
        .expect(400)

      expect(response.body.error).toBe('Insufficient funds')
    })

    it('should reject negative withdrawal amount', async () => {
      const response = await request(app)
        .post(`/api/accounts/${account.id}/withdraw`)
        .send({ amount: -100 })
        .expect(400)

      expect(response.body.error).toBe('Withdrawal amount must be positive')
    })
  })

  describe('POST /api/transfers', () => {
    let sourceAccount: Account
    let targetAccount: Account

    beforeEach(async () => {
      sourceAccount = await prisma.account.create({
        data: {
          name: 'Source Account',
          balance: 1000
        }
      })
      
      targetAccount = await prisma.account.create({
        data: {
          name: 'Target Account',
          balance: 0
        }
      })
    })

    it('should transfer money between accounts', async () => {
      const response = await request(app)
        .post('/api/transfers')
        .send({
          fromAccountId: sourceAccount.id,
          toAccountId: targetAccount.id,
          amount: 500
        })
        .expect(200)

      // 驗證交易紀錄
      expect(response.body).toMatchObject({
        amount: 500,
        fromAccountId: sourceAccount.id,
        toAccountId: targetAccount.id
      })

      // 驗證帳戶餘額
      const updatedSourceAccount = await prisma.account.findUnique({
        where: { id: sourceAccount.id }
      })
      const updatedTargetAccount = await prisma.account.findUnique({
        where: { id: targetAccount.id }
      })

      expect(updatedSourceAccount?.balance).toBe(500)
      expect(updatedTargetAccount?.balance).toBe(500)
    })

    it('should reject transfer with insufficient funds', async () => {
      const response = await request(app)
        .post('/api/transfers')
        .send({
          fromAccountId: sourceAccount.id,
          toAccountId: targetAccount.id,
          amount: 1500
        })
        .expect(400)

      expect(response.body.error).toBe('Insufficient funds')

      // 驗證帳戶餘額沒有變動
      const updatedSourceAccount = await prisma.account.findUnique({
        where: { id: sourceAccount.id }
      })
      const updatedTargetAccount = await prisma.account.findUnique({
        where: { id: targetAccount.id }
      })

      expect(updatedSourceAccount?.balance).toBe(1000)
      expect(updatedTargetAccount?.balance).toBe(0)
    })

    it('should reject transfer with negative amount', async () => {
      const response = await request(app)
        .post('/api/transfers')
        .send({
          fromAccountId: sourceAccount.id,
          toAccountId: targetAccount.id,
          amount: -100
        })
        .expect(400)

      expect(response.body.error).toBe('Transfer amount must be positive')
    })

    it('should reject transfer with non-existent source account', async () => {
      const response = await request(app)
        .post('/api/transfers')
        .send({
          fromAccountId: 'non-existent-id',
          toAccountId: targetAccount.id,
          amount: 500
        })
        .expect(400)

      expect(response.body.error).toBe('Source account not found')
    })
  })

  describe('GET /api/accounts/:accountId/transactions', () => {
    let account1: Account
    let account2: Account

    beforeEach(async () => {
      account1 = await prisma.account.create({
        data: {
          name: 'Account 1',
          balance: 1000
        }
      })
      
      account2 = await prisma.account.create({
        data: {
          name: 'Account 2',
          balance: 1000
        }
      })

      // 創建一些測試交易紀錄
      await prisma.transaction.createMany({
        data: [
          {
            amount: 200,
            fromAccountId: account1.id,
            toAccountId: account2.id
          },
          {
            amount: 300,
            fromAccountId: account2.id,
            toAccountId: account1.id
          }
        ]
      })
    })

    it('should return all transactions related to an account', async () => {
      const response = await request(app)
        .get(`/api/accounts/${account1.id}/transactions`)
        .expect(200)

      expect(response.body).toHaveLength(2)
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            amount: 200,
            fromAccountId: account1.id,
            toAccountId: account2.id
          }),
          expect.objectContaining({
            amount: 300,
            fromAccountId: account2.id,
            toAccountId: account1.id
          })
        ])
      )
    })
  })
})