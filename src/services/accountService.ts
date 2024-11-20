import { PrismaClient } from '@prisma/client';
import { Account, Transaction } from '@/types/entities';
import { AppError } from '@/types/error';

export class AccountService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async createAccount(name: string, initialBalance: number): Promise<Account> {
    if (initialBalance < 0) {
      throw new AppError(400, 'Initial balance cannot be negative');
    }

    return this.prisma.account.create({
      data: {
        name,
        balance: initialBalance,
      },
    });
  }

  async deposit(accountId: string, amount: number): Promise<Account> {
    if (amount <= 0) {
      throw new AppError(400, 'Deposit amount must be positive');
    }

    return this.prisma.account.update({
      where: { id: accountId },
      data: {
        balance: {
          increment: amount,
        },
      },
    });
  }

  async withdraw(accountId: string, amount: number): Promise<Account> {
    if (amount <= 0) {
      throw new AppError(400, 'Withdrawal amount must be positive');
    }

    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new AppError(400, 'Account not found');
    }

    if (account.balance < amount) {
      throw new AppError(400, 'Insufficient funds');
    }

    return this.prisma.account.update({
      where: { id: accountId },
      data: {
        balance: {
          decrement: amount,
        },
      },
    });
  }

  async transfer(fromAccountId: string, toAccountId: string, amount: number): Promise<Transaction> {
    if (amount <= 0) {
      throw new AppError(400, 'Transfer amount must be positive');
    }

    return this.prisma.$transaction(async (prisma) => {
      const fromAccount = await prisma.account.findUnique({
        where: { id: fromAccountId },
      });

      if (!fromAccount) {
        throw new AppError(400, 'Source account not found');
      }

      if (fromAccount.balance < amount) {
        throw new AppError(400, 'Insufficient funds');
      }

      await prisma.account.update({
        where: { id: fromAccountId },
        data: {
          balance: {
            decrement: amount,
          },
        },
      });

      await prisma.account.update({
        where: { id: toAccountId },
        data: {
          balance: {
            increment: amount,
          },
        },
      });

      return prisma.transaction.create({
        data: {
          amount,
          fromAccountId,
          toAccountId,
        },
      });
    });
  }

  async getTransactions(accountId: string): Promise<Transaction[]> {
    return this.prisma.transaction.findMany({
      where: {
        OR: [
          { fromAccountId: accountId },
          { toAccountId: accountId },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getAccountList(): Promise<Account[]> {
    return this.prisma.account.findMany();
  } 
}