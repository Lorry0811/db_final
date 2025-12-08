import { supabaseAdmin } from '@/lib/supabase/admin';
import { Database } from '@/types/database.types';

type FavoriteInsert = Database['public']['Tables']['favorite_posts']['Insert'];

export class FavoriteRepository {
  // 新增收藏
  async create(favorite: FavoriteInsert) {
    const { data, error } = await supabaseAdmin
      .from('favorite_posts')
      .insert(favorite)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // 取消收藏
  async delete(userId: number, postingId: number) {
    const { error } = await supabaseAdmin
      .from('favorite_posts')
      .delete()
      .eq('u_id', userId)
      .eq('p_id', postingId);

    if (error) throw error;
  }

  // 檢查是否已收藏
  async isFavorited(userId: number, postingId: number): Promise<boolean> {
    const { data, error } = await supabaseAdmin
      .from('favorite_posts')
      .select('u_id')
      .eq('u_id', userId)
      .eq('p_id', postingId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 是「找不到資料」的錯誤碼，這是正常的
      throw error;
    }

    return !!data;
  }

  // 查詢使用者的所有收藏
  async findByUserId(userId: number) {
    const { data, error } = await supabaseAdmin
      .from('favorite_posts')
      .select(`
        *,
        posting:p_id(
          p_id,
          title,
          price,
          status,
          image_url,
          created_at,
          user:u_id(username),
          class:class_id(class_name)
        )
      `)
      .eq('u_id', userId)
      .order('added_time', { ascending: false });

    if (error) throw error;
    return data;
  }

  // 查詢刊登的收藏數量
  async getFavoriteCount(postingId: number): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from('favorite_posts')
      .select('*', { count: 'exact', head: true })
      .eq('p_id', postingId);

    if (error) throw error;
    return count || 0;
  }
}

