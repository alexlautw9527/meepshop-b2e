import { Router } from 'express';
import { AccountController } from '@/controllers/accountController';

const router = Router();
const accountController = new AccountController();

router.post('/accounts', accountController.createAccount.bind(accountController));
router.post('/accounts/:accountId/deposit', accountController.deposit.bind(accountController));
router.post('/accounts/:accountId/withdraw', accountController.withdraw.bind(accountController));
router.post('/transfers', accountController.transfer.bind(accountController));
router.get('/accounts/:accountId/transactions', accountController.getTransactions.bind(accountController));
router.get('/accounts', accountController.getAccountList.bind(accountController));
export default router;