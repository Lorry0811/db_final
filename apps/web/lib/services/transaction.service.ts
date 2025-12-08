import { TransactionRepository } from '@/lib/repositories/transaction.repository';
import { Database } from '@/types/database.types';

type TransactionInsert = Database['public']['Tables']['transaction_record']['Insert'];

export class TransactionService {
  private transactionRepo = new TransactionRepository();

  /**
   * 新增交易紀錄
   */
  async createTransaction(transaction: TransactionInsert) {
    return this.transactionRepo.create(transaction);
  }

  /**
   * 取得使用者的交易紀錄
   */
  async getUserTransactions(userId: number, options?: {
    transType?: string;
    page?: number;
    limit?: number;
  }) {
    return this.transactionRepo.findByUserId(userId, options);
  }

  /**
   * 取得單一交易紀錄
   */
  async getTransactionById(recordId: number) {
    return this.transactionRepo.findById(recordId);
  }
}

