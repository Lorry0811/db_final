import { ReportRepository } from '@/lib/repositories/report.repository';

type ReportInsert = {
  reporter_id: number;
  report_type: 'posting' | 'comment' | 'order_violation';
  reason: string;
  p_id?: number | null;
  comment_id?: number | null;
  order_id?: number | null;
  target_user_id?: number | null;
};

export class ReportService {
  private reportRepo = new ReportRepository();

  /**
   * 舉報不當刊登
   */
  async reportPosting(reporterId: number, postingId: number, reason: string) {
    // 檢查是否已經舉報過
    const existing = await this.reportRepo.checkExistingReport(reporterId, 'posting', postingId);
    if (existing) {
      throw new Error('您已經舉報過此刊登');
    }

    return this.reportRepo.create({
      reporter_id: reporterId,
      report_type: 'posting',
      p_id: postingId,
      reason: reason.trim(),
      comment_id: null,
      order_id: null,
      target_user_id: null,
    });
  }

  /**
   * 舉報不當留言
   */
  async reportComment(reporterId: number, commentId: number, reason: string) {
    // 檢查是否已經舉報過
    const existing = await this.reportRepo.checkExistingReport(reporterId, 'comment', commentId);
    if (existing) {
      throw new Error('您已經舉報過此留言');
    }

    // 需要先取得留言的 p_id
    const { supabaseAdmin } = await import('@/lib/supabase/admin');
    const { data: comment, error } = await supabaseAdmin
      .from('comment')
      .select('p_id')
      .eq('comment_id', commentId)
      .single();

    if (error || !comment) {
      throw new Error('找不到此留言');
    }

    return this.reportRepo.create({
      reporter_id: reporterId,
      report_type: 'comment',
      p_id: comment.p_id,
      comment_id: commentId,
      reason: reason.trim(),
      order_id: null,
      target_user_id: null,
    });
  }

  /**
   * 舉報逃單（賣家不寄送或買家不付錢）
   */
  async reportOrderViolation(
    reporterId: number,
    orderId: number,
    targetUserId: number,
    reason: string
  ) {
    // 檢查是否已經舉報過
    const existing = await this.reportRepo.checkExistingReport(reporterId, 'order_violation', orderId);
    if (existing) {
      throw new Error('您已經舉報過此訂單');
    }

    // 驗證訂單是否存在，以及 reporter 是否有權限舉報
    const { supabaseAdmin } = await import('@/lib/supabase/admin');
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('buyer_id, p_id')
      .eq('order_id', orderId)
      .single();

    if (error || !order) {
      throw new Error('找不到此訂單');
    }

    // 取得賣家 ID
    const { data: posting } = await supabaseAdmin
      .from('posting')
      .select('u_id')
      .eq('p_id', order.p_id)
      .single();

    if (!posting) {
      throw new Error('找不到對應的商品');
    }

    const sellerId = posting.u_id;

    // 驗證：只有買家或賣家可以舉報對方
    if (reporterId !== order.buyer_id && reporterId !== sellerId) {
      throw new Error('您沒有權限舉報此訂單');
    }

    // 驗證：不能舉報自己
    if (targetUserId === reporterId) {
      throw new Error('不能舉報自己');
    }

    // 驗證：目標使用者必須是買家或賣家
    if (targetUserId !== order.buyer_id && targetUserId !== sellerId) {
      throw new Error('目標使用者必須是此訂單的買家或賣家');
    }

    return this.reportRepo.create({
      reporter_id: reporterId,
      report_type: 'order_violation',
      order_id: orderId,
      target_user_id: targetUserId,
      reason: reason.trim(),
      p_id: null,
      comment_id: null,
    });
  }

  /**
   * 取得使用者的所有舉報
   */
  async getUserReports(userId: number, options?: {
    reportType?: 'posting' | 'comment' | 'order_violation';
    status?: 'pending' | 'approved' | 'rejected';
    page?: number;
    limit?: number;
  }) {
    return this.reportRepo.findByReporterId(userId, options);
  }

  /**
   * 取得單一舉報
   */
  async getReportById(reportId: number) {
    return this.reportRepo.findById(reportId);
  }

  /**
   * 取得特定刊登的所有舉報
   */
  async getPostingReports(postingId: number) {
    return this.reportRepo.findByPostingId(postingId);
  }

  /**
   * 取得特定留言的所有舉報
   */
  async getCommentReports(commentId: number) {
    return this.reportRepo.findByCommentId(commentId);
  }

  /**
   * 取得特定訂單的所有舉報
   */
  async getOrderReports(orderId: number) {
    return this.reportRepo.findByOrderId(orderId);
  }
}

