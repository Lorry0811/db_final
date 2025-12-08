import { OrderRepository } from '@/lib/repositories/order.repository';
import { PostingRepository } from '@/lib/repositories/posting.repository';
import { UserRepository } from '@/lib/repositories/user.repository';
import { supabaseAdmin } from '@/lib/supabase/admin';

export class OrderService {
  private orderRepo = new OrderRepository();
  private postingRepo = new PostingRepository();
  private userRepo = new UserRepository();

  /**
   * 購買商品 - 使用資料庫函數確保 ACID 特性
   */
  async purchaseBook(buyerId: number, postingId: number) {
    // 使用資料庫函數執行交易（已在資料庫層確保 ACID）
    const { data, error } = await supabaseAdmin.rpc('purchase_book', {
      p_buyer_id: buyerId,
      p_posting_id: postingId,
    });

    if (error) {
      throw new Error(`購買失敗: ${error.message}`);
    }

    return data;
  }

  /**
   * 購買商品 - 應用層交易管理（備用方案）
   * 如果資料庫函數不可用，可以使用這個方法
   */
  async purchaseBookWithTransaction(buyerId: number, postingId: number) {
    // 開始交易
    const { data: result, error } = await supabaseAdmin.rpc('exec_transaction', {
      sql: `
        BEGIN;
        
        -- 1. 檢查並鎖定 posting
        SELECT * FROM posting WHERE p_id = ${postingId} FOR UPDATE;
        
        -- 2. 檢查商品狀態
        -- 3. 檢查買家餘額
        -- 4. 扣款
        -- 5. 入帳
        -- 6. 更新商品狀態
        -- 7. 建立訂單
        
        COMMIT;
      `,
    });

    if (error) {
      throw new Error(`交易失敗: ${error.message}`);
    }

    return result;
  }

  /**
   * 查詢訂單列表
   */
  async getOrders(buyerId?: number, page: number = 1, limit: number = 20) {
    return this.orderRepo.findMany({ buyerId, page, limit });
  }

  /**
   * 查詢訂單詳情
   */
  async getOrderById(orderId: number) {
    return this.orderRepo.findById(orderId);
  }

  /**
   * 取消訂單
   */
  async cancelOrder(orderId: number) {
    return this.orderRepo.cancel(orderId);
  }
}

