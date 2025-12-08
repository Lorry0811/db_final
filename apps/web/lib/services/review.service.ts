import { ReviewRepository } from '@/lib/repositories/review.repository';

type ReviewInsert = {
  order_id: number;
  reviewer_id: number;
  target_id: number;
  rating: number;
  comment?: string | null;
};

export class ReviewService {
  private reviewRepo = new ReviewRepository();

  /**
   * 建立評價（買家對賣家）
   */
  async createReview(
    reviewerId: number,
    orderId: number,
    rating: number,
    comment?: string
  ) {
    // 驗證評分範圍
    if (rating < 1 || rating > 5) {
      throw new Error('評分必須在 1 到 5 之間');
    }

    // 驗證訂單是否存在，並取得賣家 ID
    const { supabaseAdmin } = await import('@/lib/supabase/admin');
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('buyer_id, p_id, posting:p_id(u_id)')
      .eq('order_id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error('找不到此訂單');
    }

    // 驗證：只有買家可以評價
    if (order.buyer_id !== reviewerId) {
      throw new Error('只有買家可以評價此訂單');
    }

    // 取得賣家 ID
    const posting = order.posting as any;
    if (!posting || !posting.u_id) {
      throw new Error('找不到對應的商品');
    }
    const targetId = posting.u_id;

    // 驗證：不能評價自己
    if (targetId === reviewerId) {
      throw new Error('不能評價自己');
    }

    // 檢查是否已經評價過此訂單
    const existingReview = await this.reviewRepo.findByOrderId(orderId);
    if (existingReview) {
      throw new Error('您已經評價過此訂單');
    }

    // 建立評價
    return this.reviewRepo.create({
      order_id: orderId,
      reviewer_id: reviewerId,
      target_id: targetId,
      rating,
      comment: comment?.trim() || null,
    });
  }

  /**
   * 查詢賣家的評價列表
   */
  async getSellerReviews(sellerId: number, options?: { page?: number; limit?: number }) {
    return this.reviewRepo.findMany({
      targetId: sellerId,
      page: options?.page,
      limit: options?.limit,
    });
  }

  /**
   * 查詢使用者的評價紀錄（自己給別人的評價）
   */
  async getUserReviews(userId: number, options?: { page?: number; limit?: number }) {
    return this.reviewRepo.findMany({
      reviewerId: userId,
      page: options?.page,
      limit: options?.limit,
    });
  }

  /**
   * 查詢特定訂單的評價
   */
  async getOrderReview(orderId: number) {
    return this.reviewRepo.findByOrderId(orderId);
  }

  /**
   * 查詢使用者的平均評分
   */
  async getAverageRating(userId: number) {
    return this.reviewRepo.getAverageRating(userId);
  }

  /**
   * 更新評價
   */
  async updateReview(reviewId: number, reviewerId: number, rating: number, comment?: string) {
    // 驗證評分範圍
    if (rating < 1 || rating > 5) {
      throw new Error('評分必須在 1 到 5 之間');
    }

    // 驗證評價是否存在且屬於該使用者
    const review = await this.reviewRepo.findById(reviewId);
    if (!review) {
      throw new Error('找不到此評價');
    }

    if (review.reviewer_id !== reviewerId) {
      throw new Error('您沒有權限修改此評價');
    }

    return this.reviewRepo.update(reviewId, {
      rating,
      comment: comment?.trim() || null,
    });
  }

  /**
   * 刪除評價
   */
  async deleteReview(reviewId: number, reviewerId: number) {
    // 驗證評價是否存在且屬於該使用者
    const review = await this.reviewRepo.findById(reviewId);
    if (!review) {
      throw new Error('找不到此評價');
    }

    if (review.reviewer_id !== reviewerId) {
      throw new Error('您沒有權限刪除此評價');
    }

    return this.reviewRepo.delete(reviewId);
  }
}

