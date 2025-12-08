import { supabaseAdmin } from '@/lib/supabase/admin';
import { Database } from '@/types/database.types';

type Comment = Database['public']['Tables']['comment']['Row'];
type CommentInsert = Database['public']['Tables']['comment']['Insert'];
type CommentUpdate = Database['public']['Tables']['comment']['Update'];

export class CommentRepository {
  // 新增留言
  async create(comment: CommentInsert) {
    const { data, error } = await supabaseAdmin
      .from('comment')
      .insert(comment)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // 查詢刊登的所有留言
  async findByPostingId(postingId: number) {
    const { data, error } = await supabaseAdmin
      .from('comment')
      .select(`
        *,
        user:u_id(u_id, username, email)
      `)
      .eq('p_id', postingId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  // 查詢單一留言
  async findById(commentId: number) {
    const { data, error } = await supabaseAdmin
      .from('comment')
      .select('*')
      .eq('comment_id', commentId)
      .single();

    if (error) throw error;
    return data;
  }

  // 更新留言
  async update(commentId: number, comment: CommentUpdate) {
    const { data, error } = await supabaseAdmin
      .from('comment')
      .update(comment)
      .eq('comment_id', commentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // 刪除留言
  async delete(commentId: number) {
    const { error } = await supabaseAdmin
      .from('comment')
      .delete()
      .eq('comment_id', commentId);

    if (error) throw error;
  }

  // 查詢刊登的留言數量
  async getCommentCount(postingId: number): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from('comment')
      .select('*', { count: 'exact', head: true })
      .eq('p_id', postingId);

    if (error) throw error;
    return count || 0;
  }
}

