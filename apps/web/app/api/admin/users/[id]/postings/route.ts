import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth/session';
import { UserRepository } from '@/lib/repositories/user.repository';
import { PostingRepository } from '@/lib/repositories/posting.repository';

const userRepo = new UserRepository();
const postingRepo = new PostingRepository();

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

// GET /api/admin/users/[id]/postings - 查詢使用者的所有刊登
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await checkAdmin();

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, error: '無效的使用者 ID' },
        { status: 400 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20;

    // 使用 PostingRepository 查詢，但移除預設的 status 過濾
    const { supabaseAdmin } = await import('@/lib/supabase/admin');
    let query = supabaseAdmin
      .from('posting')
      .select(`
        *,
        user:u_id(username, email),
        class:class_id(class_name),
        course:course_id(course_name, course_code),
        images:posting_images(*)
      `, { count: 'exact' })
      .eq('u_id', userId);

    if (status) {
      query = query.eq('status', status);
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

