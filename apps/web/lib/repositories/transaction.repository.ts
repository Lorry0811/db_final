import { supabaseAdmin } from '@/lib/supabase/admin';
import { Database } from '@/types/database.types';

type TransactionRecord = Database['public']['Tables']['transaction_record']['Row'];
type TransactionInsert = Database['public']['Tables']['transaction_record']['Insert'];

export class TransactionRepository {
  // 新增交易紀錄
  async create(transaction: TransactionInsert) {
    const { data, error } = await supabaseAdmin
      .from('transaction_record')
      .insert(transaction)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // 查詢使用者的交易紀錄
  async findByUserId(userId: number, options?: {
    transType?: string;
    page?: number;
    limit?: number;
  }) {
    let query = supabaseAdmin
      .from('transaction_record')
      .select('*')
      .eq('u_id', userId);

    if (options?.transType) {
      query = query.eq('trans_type', options.transType);
    }

    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.order('trans_time', { ascending: false }).range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data, count };
  }

  // 查詢單一交易紀錄
  async findById(recordId: number) {
    const { data, error } = await supabaseAdmin
      .from('transaction_record')
      .select('*')
      .eq('record_id', recordId)
      .single();

    if (error) throw error;
    return data;
  }
}

