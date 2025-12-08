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

// GET /api/admin/users - 查詢所有使用者列表（支援搜尋和分頁）
export async function GET(request: NextRequest) {
  try {
    await checkAdmin();

    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20;
    const search = searchParams.get('search') || undefined;
    const isBlocked = searchParams.get('isBlocked');

    let query = supabaseAdmin.from('user').select('*', { count: 'exact' });

    // 搜尋功能（搜尋使用者名稱或電子郵件）
    if (search) {
      query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // 篩選封鎖狀態
    if (isBlocked !== null && isBlocked !== undefined) {
      query = query.eq('is_blocked', isBlocked === 'true');
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    // 移除密碼雜湊
    const users = (data || []).map((user: any) => {
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return NextResponse.json({
      success: true,
      data: users,
      count: count || 0,
      page,
      limit,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '查詢使用者失敗',
      },
      { status: error.message?.includes('無權限') ? 403 : error.message?.includes('登入') ? 401 : 500 }
    );
  }
}

