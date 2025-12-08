import { supabaseAdmin } from '@/lib/supabase/admin';
import { Database } from '@/types/database.types';

type User = Database['public']['Tables']['user']['Row'];
type UserInsert = Database['public']['Tables']['user']['Insert'];
type UserUpdate = Database['public']['Tables']['user']['Update'];

export class UserRepository {
  // 查詢使用者列表
  async findMany(options?: { page?: number; limit?: number; isAdmin?: boolean }) {
    let query = supabaseAdmin.from('user').select('*');

    if (options?.isAdmin !== undefined) {
      query = query.eq('is_admin', options.isAdmin);
    }

    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count };
  }

  // 查詢單一使用者
  async findById(id: number) {
    const { data, error } = await supabaseAdmin
      .from('user')
      .select('*')
      .eq('u_id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // 依 email 查詢使用者
  async findByEmail(email: string) {
    const { data, error } = await supabaseAdmin
      .from('user')
      .select('*')
      .eq('email', email)
      .single();

    if (error) throw error;
    return data;
  }

  // 依 username 查詢使用者
  async findByUsername(username: string) {
    const { data, error } = await supabaseAdmin
      .from('user')
      .select('*')
      .eq('username', username)
      .single();

    if (error) throw error;
    return data;
  }

  // 新增使用者
  async create(user: UserInsert) {
    const { data, error } = await supabaseAdmin
      .from('user')
      .insert(user)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // 更新使用者
  async update(id: number, user: UserUpdate) {
    const { data, error } = await supabaseAdmin
      .from('user')
      .update(user)
      .eq('u_id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // 更新餘額
  async updateBalance(userId: number, amount: number) {
    const { data, error } = await supabaseAdmin.rpc('update_user_balance', {
      p_user_id: userId,
      p_amount: amount,
    });

    if (error) {
      // 如果 RPC 不存在，使用直接更新
      const user = await this.findById(userId);
      return this.update(userId, { balance: user.balance + amount });
    }

    return data;
  }

  // 查詢使用者統計（使用視圖）
  async getStatistics(userId: number) {
    const { data, error } = await supabaseAdmin
      .from('v_user_statistics')
      .select('*')
      .eq('u_id', userId)
      .single();

    if (error) throw error;
    return data;
  }
}

