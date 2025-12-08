import { supabaseAdmin } from '@/lib/supabase/admin';
import { Database } from '@/types/database.types';

type Posting = Database['public']['Tables']['posting']['Row'];
type PostingInsert = Database['public']['Tables']['posting']['Insert'];
type PostingUpdate = Database['public']['Tables']['posting']['Update'];
type PostingImage = Database['public']['Tables']['posting_images']['Row'];
type PostingImageInsert = Database['public']['Tables']['posting_images']['Insert'];

export class PostingRepository {
  // 查詢刊登列表（支援篩選、搜尋、分頁）
  async findMany(options?: {
    status?: string;
    classId?: number;
    courseId?: number;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  }) {
    let query = supabaseAdmin
      .from('posting')
      .select(`
        *,
        user:u_id(username, email),
        class:class_id(class_name),
        course:course_id(course_name, course_code),
        images:posting_images(*)
      `);

    // 強制過濾狀態：如果指定了 status，使用指定的；否則預設只顯示 listed
    // 這確保已售出的商品不會出現在列表中
    if (options?.status) {
      query = query.eq('status', options.status);
    } else {
      // 預設只顯示 listed 狀態的商品
      query = query.eq('status', 'listed');
    }
    if (options?.classId) {
      query = query.eq('class_id', options.classId);
    }
    if (options?.courseId) {
      query = query.eq('course_id', options.courseId);
    }
    if (options?.search) {
      query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`);
    }
    if (options?.minPrice !== undefined) {
      query = query.gte('price', options.minPrice);
    }
    if (options?.maxPrice !== undefined) {
      query = query.lte('price', options.maxPrice);
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

  // 查詢單一刊登詳情
  async findById(id: number) {
    const { data, error } = await supabaseAdmin
      .from('posting')
      .select(`
        *,
        user:u_id(u_id, username, email),
        class:class_id(class_id, class_name),
        course:course_id(course_id, course_name, course_code),
        images:posting_images(*)
      `)
      .eq('p_id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // 查詢使用者的刊登
  async findByUserId(userId: number, options?: { status?: string }) {
    let query = supabaseAdmin
      .from('posting')
      .select('*')
      .eq('u_id', userId);

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // 新增刊登
  async create(posting: PostingInsert) {
    const { data, error } = await supabaseAdmin
      .from('posting')
      .insert(posting)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // 更新刊登
  async update(id: number, posting: PostingUpdate) {
    const { data, error } = await supabaseAdmin
      .from('posting')
      .update(posting)
      .eq('p_id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // 下架刊登（軟刪除）
  async remove(id: number) {
    return this.update(id, { status: 'removed' });
  }

  // 新增刊登圖片
  async addImage(image: PostingImageInsert) {
    const { data, error } = await supabaseAdmin
      .from('posting_images')
      .insert(image)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // 查詢刊登的所有圖片
  async getImages(postingId: number) {
    const { data, error } = await supabaseAdmin
      .from('posting_images')
      .select('*')
      .eq('p_id', postingId)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data;
  }

  // 刪除圖片
  async deleteImage(imageId: number) {
    const { error } = await supabaseAdmin
      .from('posting_images')
      .delete()
      .eq('image_id', imageId);

    if (error) throw error;
  }

  // 使用視圖查詢熱門書籍
  async findPopular(limit: number = 10) {
    // 先從視圖取得熱門書籍的基本資訊
    const { data: popularData, error: viewError } = await supabaseAdmin
      .from('v_popular_books')
      .select('*')
      .order('favorite_count', { ascending: false })
      .limit(limit);

    if (viewError) throw viewError;
    if (!popularData || popularData.length === 0) return [];

    // 取得每個刊登的第一張圖片
    const pIds = popularData.map((book: any) => book.p_id);
    const { data: imagesData, error: imagesError } = await supabaseAdmin
      .from('posting_images')
      .select('p_id, image_url, display_order')
      .in('p_id', pIds)
      .order('display_order', { ascending: true });

    if (imagesError) throw imagesError;

    // 將圖片資料合併到書籍資料中
    const imagesMap = new Map<number, string>();
    if (imagesData) {
      imagesData.forEach((img: any) => {
        if (!imagesMap.has(img.p_id)) {
          imagesMap.set(img.p_id, img.image_url);
        }
      });
    }

    // 合併資料
    return popularData.map((book: any) => ({
      ...book,
      image_url: imagesMap.get(book.p_id) || null,
    }));
  }
}

