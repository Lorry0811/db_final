import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/services/user.service';
import { getCurrentUserId } from '@/lib/auth/session';
import { UserRepository } from '@/lib/repositories/user.repository';
import { supabaseAdmin } from '@/lib/supabase/admin';

const userService = new UserService();
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

// GET /api/admin/users/[id] - 查詢使用者詳情
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

    const user = await userService.getUserById(userId);

    // 取得使用者的統計資訊
    let statistics;
    try {
      statistics = await userService.getUserStatistics(userId);
    } catch (error) {
      // 如果視圖不存在，手動計算
      const { count: totalPosts } = await supabaseAdmin
        .from('posting')
        .select('*', { count: 'exact', head: true })
        .eq('u_id', userId);

      const { count: soldPosts } = await supabaseAdmin
        .from('posting')
        .select('*', { count: 'exact', head: true })
        .eq('u_id', userId)
        .eq('status', 'sold');

      statistics = {
        total_posts: totalPosts || 0,
        sold_posts: soldPosts || 0,
      };
    }

    // 取得使用者的刊登列表
    const { data: postings } = await supabaseAdmin
      .from('posting')
      .select('p_id, title, price, status, created_at')
      .eq('u_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // 取得使用者的違規紀錄（舉報）
    const { data: reports } = await supabaseAdmin
      .from('report')
      .select(`
        *,
        reporter:reporter_id(username, email),
        posting:p_id(title)
      `)
      .or(`p_id.in.(SELECT p_id FROM posting WHERE u_id = ${userId}),target_user_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(20);

    return NextResponse.json({
      success: true,
      data: {
        user,
        statistics,
        postings: postings || [],
        reports: reports || [],
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '查詢使用者詳情失敗',
      },
      { status: error.message?.includes('無權限') ? 403 : error.message?.includes('登入') ? 401 : 500 }
    );
  }
}

// PUT /api/admin/users/[id] - 更新使用者（封鎖/解封）
export async function PUT(
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

    const body = await request.json();
    const { is_blocked } = body;

    if (typeof is_blocked !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'is_blocked 必須是布林值' },
        { status: 400 }
      );
    }

    // 檢查不能封鎖自己
    const currentUserId = await getCurrentUserId();
    if (userId === currentUserId) {
      return NextResponse.json(
        { success: false, error: '不能封鎖自己' },
        { status: 400 }
      );
    }

    const updatedUser = await userRepo.update(userId, { is_blocked });
    const { password_hash, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({
      success: true,
      data: userWithoutPassword,
      message: is_blocked ? '使用者已封鎖' : '使用者已解封',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '更新使用者失敗',
      },
      { status: error.message?.includes('無權限') ? 403 : error.message?.includes('登入') ? 401 : 500 }
    );
  }
}

