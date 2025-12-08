import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/services/user.service';
import { getCurrentUserId } from '@/lib/auth/session';
import { ReviewService } from '@/lib/services/review.service';

const userService = new UserService();
const reviewService = new ReviewService();

// GET /api/users/profile - 取得當前使用者的個人資料和統計資訊
export async function GET(request: NextRequest) {
  try {
    const currentUserId = await getCurrentUserId();

    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: '請先登入' },
        { status: 401 }
      );
    }

    // 取得使用者基本資料
    const user = await userService.getUserById(currentUserId);

    // 取得統計資訊
    let statistics;
    try {
      statistics = await userService.getUserStatistics(currentUserId);
    } catch (error) {
      // 如果視圖不存在，手動計算統計資訊
      const { supabaseAdmin } = await import('@/lib/supabase/admin');
      
      // 查詢刊登數
      const { count: totalPosts } = await supabaseAdmin
        .from('posting')
        .select('*', { count: 'exact', head: true })
        .eq('u_id', currentUserId);

      // 查詢已售出數
      const { count: soldPosts } = await supabaseAdmin
        .from('posting')
        .select('*', { count: 'exact', head: true })
        .eq('u_id', currentUserId)
        .eq('status', 'sold');

      // 查詢訂單數（作為買家）
      const { count: totalOrders } = await supabaseAdmin
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('buyer_id', currentUserId);

      // 查詢平均評分（作為賣家）
      const avgRatingResult = await reviewService.getAverageRating(currentUserId);

      statistics = {
        total_posts: totalPosts || 0,
        sold_posts: soldPosts || 0,
        total_orders_as_buyer: totalOrders || 0,
        average_rating: avgRatingResult.average,
        review_count: avgRatingResult.count,
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        user,
        statistics,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '查詢個人資料失敗',
      },
      { status: 500 }
    );
  }
}

// PUT /api/users/profile - 更新個人資料
export async function PUT(request: NextRequest) {
  try {
    const currentUserId = await getCurrentUserId();

    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: '請先登入' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { username, email, password } = body;

    // 驗證輸入
    const updateData: any = {};

    if (username !== undefined) {
      if (username.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: '使用者名稱不能為空' },
          { status: 400 }
        );
      }
      if (username.trim().length < 3) {
        return NextResponse.json(
          { success: false, error: '使用者名稱至少需要 3 個字元' },
          { status: 400 }
        );
      }
      updateData.username = username.trim();
    }

    if (email !== undefined) {
      if (email.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: '電子郵件不能為空' },
          { status: 400 }
        );
      }
      // 簡單的 email 驗證
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return NextResponse.json(
          { success: false, error: '電子郵件格式不正確' },
          { status: 400 }
        );
      }
      updateData.email = email.trim();
    }

    if (password !== undefined) {
      if (password.length < 6) {
        return NextResponse.json(
          { success: false, error: '密碼至少需要 6 個字元' },
          { status: 400 }
        );
      }
      // 雜湊密碼
      const bcrypt = await import('bcryptjs');
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: '沒有要更新的欄位' },
        { status: 400 }
      );
    }

    // 檢查 username 和 email 是否已被其他使用者使用
    const { UserRepository } = await import('@/lib/repositories/user.repository');
    const userRepo = new UserRepository();
    const currentUser = await userRepo.findById(currentUserId);

    if (updateData.username && updateData.username !== currentUser.username) {
      try {
        await userRepo.findByUsername(updateData.username);
        return NextResponse.json(
          { success: false, error: '使用者名稱已被使用' },
          { status: 400 }
        );
      } catch (error) {
        // Username 不存在，可以繼續
      }
    }

    if (updateData.email && updateData.email !== currentUser.email) {
      try {
        await userRepo.findByEmail(updateData.email);
        return NextResponse.json(
          { success: false, error: '電子郵件已被使用' },
          { status: 400 }
        );
      } catch (error) {
        // Email 不存在，可以繼續
      }
    }

    // 更新使用者資料
    const updatedUser = await userService.updateUser(currentUserId, updateData);
    const { password_hash, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({
      success: true,
      data: userWithoutPassword,
      message: '個人資料更新成功',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '更新個人資料失敗',
      },
      { status: 500 }
    );
  }
}

