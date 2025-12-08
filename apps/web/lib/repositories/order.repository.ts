import { supabaseAdmin } from '@/lib/supabase/admin';
import { Database } from '@/types/database.types';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderInsert = Database['public']['Tables']['orders']['Insert'];
type OrderUpdate = Database['public']['Tables']['orders']['Update'];

export class OrderRepository {
  // 查詢訂單列表
  async findMany(options?: {
    buyerId?: number;
    page?: number;
    limit?: number;
  }) {
    let query = supabaseAdmin
      .from('orders')
      .select(`
        *,
        buyer:buyer_id(u_id, username, email),
        posting:p_id(p_id, title, price, image_url, status)
      `);

    if (options?.buyerId) {
      query = query.eq('buyer_id', options.buyerId);
    }

    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.order('order_date', { ascending: false }).range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count };
  }

  // 查詢單一訂單
  async findById(id: number) {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        buyer:buyer_id(u_id, username, email),
        posting:p_id(p_id, title, price, description, image_url, status, u_id, user:u_id(u_id, username, email))
      `)
      .eq('order_id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // 新增訂單
  async create(order: OrderInsert) {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert(order)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // 更新訂單
  async update(id: number, order: OrderUpdate) {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update(order)
      .eq('order_id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // 取消訂單
  async cancel(id: number) {
    return this.update(id, { status: 'cancelled' });
  }
}

