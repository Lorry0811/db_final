import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth/session';
import { UserRepository } from '@/lib/repositories/user.repository';
import { supabaseAdmin } from '@/lib/supabase/admin';

const userRepo = new UserRepository();

// 檢查是否為管理員
async function checkAdmin() {
  const currentUserId = await getCurrentUserId();
  if (!currentUserId) {
    throw new Error('請先登入');
  }

  const user = await userRepo.findById(currentUserId);
  if (!user.is_admin) {
    throw new Error('無權限：僅管理員可執行此操作');
  }

  return currentUserId;
}

// GET /api/admin/postings - 查詢所有刊登列表（支援搜尋、篩選、分頁）
export async function GET(request: NextRequest) {
  try {
    await checkAdmin();

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const classId = searchParams.get('classId') ? parseInt(searchParams.get('classId')!) : undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20;

    let query = supabaseAdmin
      .from('posting')
      .select(`
        *,
        user:u_id(u_id, username, email),
        class:class_id(class_id, class_name),
        course:course_id(course_id, course_name, course_code),
        images:posting_images(*)
      `, { count: 'exact' });

    // 搜尋功能
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // 狀態篩選
    if (status) {
      query = query.eq('status', status);
    }

    // 分類篩選
    if (classId) {
      query = query.eq('class_id', classId);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
      count: count || 0,
      page,
      limit,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '查詢刊登失敗',
      },
      { status: error.message?.includes('無權限') ? 403 : error.message?.includes('登入') ? 401 : 500 }
    );
  }
}

