// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createAccounts() {
  const accounts = [
    { name: '王小明', balance: 1000 },
    { name: '劉大廷', balance: 2000 },
    { name: '許小睿', balance: 1500 }
  ];

  const createdAccounts = await Promise.all(
    accounts.map(account => 
      prisma.account.create({
        data: account
      })
    )
  );

  console.log('Created accounts:', createdAccounts);
  return createdAccounts;
}

async function createTransactions(accounts: any[]) {
  const transactions = [
    {
      fromAccountId: accounts[0].id,
      toAccountId: accounts[1].id,
      amount: 100,
      createdAt: new Date('2024-01-01')
    },
    {
      fromAccountId: accounts[1].id,
      toAccountId: accounts[2].id,
      amount: 150,
      createdAt: new Date('2024-01-02')
    },
    {
      fromAccountId: accounts[2].id,
      toAccountId: accounts[0].id,
      amount: 200,
      createdAt: new Date('2024-01-03')
    }
  ];

  const createdTransactions = await prisma.transaction.createMany({
    data: transactions
  });

  console.log('Created transactions:', createdTransactions);
}

async function main() {
  try {
    await prisma.transaction.deleteMany();
    await prisma.account.deleteMany();

    const accounts = await createAccounts();
    await createTransactions(accounts);

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();