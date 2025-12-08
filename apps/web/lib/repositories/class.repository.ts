import { supabaseAdmin } from '@/lib/supabase/admin';
import { Database } from '@/types/database.types';

type Class = Database['public']['Tables']['class']['Row'];
type ClassInsert = Database['public']['Tables']['class']['Insert'];
type ClassUpdate = Database['public']['Tables']['class']['Update'];

export class ClassRepository {
  // 查詢所有分類
  async findAll() {
    const { data, error } = await supabaseAdmin
      .from('class')
      .select('*')
      .order('class_name', { ascending: true });

    if (error) throw error;
    return data;
  }

  // 根據 ID 查詢單一分類
  async findById(id: number) {
    const { data, error } = await supabaseAdmin
      .from('class')
      .select('*')
      .eq('class_id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // 新增分類
  async create(classData: ClassInsert) {
    const { data, error } = await supabaseAdmin
      .from('class')
      .insert(classData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // 更新分類
  async update(id: number, classData: ClassUpdate) {
    const { data, error } = await supabaseAdmin
      .from('class')
      .update(classData)
      .eq('class_id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // 刪除分類
  async delete(id: number) {
    const { error } = await supabaseAdmin
      .from('class')
      .delete()
      .eq('class_id', id);

    if (error) throw error;
  }
}

