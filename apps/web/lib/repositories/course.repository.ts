import { supabaseAdmin } from '@/lib/supabase/admin';
import { Database } from '@/types/database.types';

type Course = Database['public']['Tables']['course']['Row'];
type CourseInsert = Database['public']['Tables']['course']['Insert'];
type CourseUpdate = Database['public']['Tables']['course']['Update'];

export class CourseRepository {
  // 查詢所有課程
  async findAll() {
    const { data, error } = await supabaseAdmin
      .from('course')
      .select(`
        *,
        department:dept_id(dept_id, dept_name),
        class:class_id(class_id, class_name)
      `)
      .order('course_name', { ascending: true });

    if (error) throw error;
    return data;
  }

  // 根據關鍵字搜尋課程（搜尋課程名稱和課程代碼）
  async search(keyword: string) {
    if (!keyword || keyword.trim() === '') {
      return this.findAll();
    }

    const searchTerm = `%${keyword.trim()}%`;
    
    const { data, error } = await supabaseAdmin
      .from('course')
      .select(`
        *,
        department:dept_id(dept_id, dept_name),
        class:class_id(class_id, class_name)
      `)
      .or(`course_name.ilike.${searchTerm},course_code.ilike.${searchTerm}`)
      .order('course_name', { ascending: true });

    if (error) throw error;
    return data;
  }

  // 根據 ID 查詢單一課程
  async findById(id: number) {
    const { data, error } = await supabaseAdmin
      .from('course')
      .select(`
        *,
        department:dept_id(dept_id, dept_name),
        class:class_id(class_id, class_name)
      `)
      .eq('course_id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // 新增課程
  async create(course: CourseInsert) {
    const { data, error } = await supabaseAdmin
      .from('course')
      .insert(course)
      .select(`
        *,
        department:dept_id(dept_id, dept_name),
        class:class_id(class_id, class_name)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  // 更新課程
  async update(id: number, course: CourseUpdate) {
    const { data, error } = await supabaseAdmin
      .from('course')
      .update(course)
      .eq('course_id', id)
      .select(`
        *,
        department:dept_id(dept_id, dept_name),
        class:class_id(class_id, class_name)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  // 刪除課程
  async delete(id: number) {
    const { error } = await supabaseAdmin
      .from('course')
      .delete()
      .eq('course_id', id);

    if (error) throw error;
  }
}

