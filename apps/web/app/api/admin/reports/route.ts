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

// GET /api/admin/reports - 查詢所有舉報列表（支援篩選和分頁）
export async function GET(request: NextRequest) {
  try {
    await checkAdmin();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || undefined;
    const reportType = searchParams.get('reportType') || undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20;

    let query = supabaseAdmin
      .from('report')
      .select(`
        *,
        reporter:reporter_id(u_id, username, email),
        posting:p_id(p_id, title, u_id, status),
        comment:comment_id(comment_id, content, u_id),
        order:order_id(order_id, buyer_id, p_id, deal_price),
        target_user:target_user_id(u_id, username, email),
        reviewer:reviewed_by(u_id, username, email)
      `, { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    if (reportType) {
      query = query.eq('report_type', reportType);
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
        error: error.message || '查詢舉報失敗',
      },
      { status: error.message?.includes('無權限') ? 403 : error.message?.includes('登入') ? 401 : 500 }
    );
  }
}

