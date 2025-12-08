import { supabaseAdmin } from '@/lib/supabase/admin';
import { Database } from '@/types/database.types';

type Review = Database['public']['Tables']['review']['Row'];
type ReviewInsert = Database['public']['Tables']['review']['Insert'];
type ReviewUpdate = Database['public']['Tables']['review']['Update'];

export class ReviewRepository {
  // 新增評價
  async create(review: ReviewInsert) {
    const { data, error } = await supabaseAdmin
      .from('review')
      .insert(review)
      .select(`
        *,
        reviewer:reviewer_id(u_id, username, email),
        target:target_id(u_id, username, email),
        order:order_id(order_id, buyer_id, p_id, deal_price, order_date)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  // 查詢評價列表
  async findMany(options?: {
    targetId?: number; // 被評價者 ID
    reviewerId?: number; // 評價者 ID
    orderId?: number; // 訂單 ID
    page?: number;
    limit?: number;
  }) {
    let query = supabaseAdmin
      .from('review')
      .select(`
        *,
        reviewer:reviewer_id(u_id, username, email),
        target:target_id(u_id, username, email),
        order:order_id(order_id, buyer_id, p_id, deal_price, order_date, posting:p_id(p_id, title))
      `, { count: 'exact' });

    if (options?.targetId) {
      query = query.eq('target_id', options.targetId);
    }

    if (options?.reviewerId) {
      query = query.eq('reviewer_id', options.reviewerId);
    }

    if (options?.orderId) {
      query = query.eq('order_id', options.orderId);
    }

    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: data || [], count: count || 0 };
  }

  // 查詢單一評價
  async findById(id: number) {
    const { data, error } = await supabaseAdmin
      .from('review')
      .select(`
        *,
        reviewer:reviewer_id(u_id, username, email),
        target:target_id(u_id, username, email),
        order:order_id(order_id, buyer_id, p_id, deal_price, order_date, posting:p_id(p_id, title))
      `)
      .eq('review_id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // 查詢特定訂單的評價
  async findByOrderId(orderId: number) {
    const { data, error } = await supabaseAdmin
      .from('review')
      .select(`
        *,
        reviewer:reviewer_id(u_id, username, email),
        target:target_id(u_id, username, email)
      `)
      .eq('order_id', orderId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return data || null;
  }

  // 查詢使用者的平均評分
  async getAverageRating(targetId: number) {
    const { data, error } = await supabaseAdmin
      .from('review')
      .select('rating')
      .eq('target_id', targetId);

    if (error) throw error;

    if (!data || data.length === 0) {
      return { average: 0, count: 0 };
    }

    const sum = data.reduce((acc, review) => acc + review.rating, 0);
    const average = sum / data.length;
    return { average: Math.round(average * 10) / 10, count: data.length };
  }

  // 更新評價
  async update(id: number, review: ReviewUpdate) {
    const { data, error } = await supabaseAdmin
      .from('review')
      .update(review)
      .eq('review_id', id)
      .select(`
        *,
        reviewer:reviewer_id(u_id, username, email),
        target:target_id(u_id, username, email),
        order:order_id(order_id, buyer_id, p_id, deal_price, order_date)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  // 刪除評價
  async delete(id: number) {
    const { error } = await supabaseAdmin
      .from('review')
      .delete()
      .eq('review_id', id);

    if (error) throw error;
  }
}

