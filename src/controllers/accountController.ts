import { Request, Response, NextFunction } from 'express';
import { AccountService } from '@/services/accountService';

export class AccountController {
  private accountService: AccountService;

  constructor() {
    this.accountService = new AccountService();
  }

  async createAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, initialBalance } = req.body;
      const account = await this.accountService.createAccount(name, initialBalance);
      res.status(201).json(account);
    } catch (error) {
      next(error);
    }
  }

  async deposit(req: Request, res: Response, next: NextFunction) {
    try {
      const { accountId } = req.params;
      const { amount } = req.body;
      const account = await this.accountService.deposit(accountId, amount);
      res.json(account);
    } catch (error) {
      next(error);
    }
  }

  async withdraw(req: Request, res: Response, next: NextFunction) {
    try {
      const { accountId } = req.params;
      const { amount } = req.body;
      const account = await this.accountService.withdraw(accountId, amount);
      res.json(account);
    } catch (error) {
      next(error);
    }
  }

  async transfer(req: Request, res: Response, next: NextFunction) {
    try {
      const { fromAccountId, toAccountId, amount } = req.body;
      const transaction = await this.accountService.transfer(fromAccountId, toAccountId, amount);
      res.json(transaction);
    } catch (error) {
      next(error);
    }
  }

  async getTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      const { accountId } = req.params;
      const transactions = await this.accountService.getTransactions(accountId);
      res.json(transactions);
    } catch (error) {
      next(error);
    }
  }

  async getAccountList(req: Request, res: Response, next: NextFunction) {
    try {
      const account = await this.accountService.getAccountList()
      res.json(account);
    } catch (error) {
      next(error);
    }
  }
}