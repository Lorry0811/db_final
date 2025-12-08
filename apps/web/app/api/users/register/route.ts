import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/services/user.service';

const userService = new UserService();

// POST /api/users/register - 註冊使用者
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username, password } = body;

    if (!email || !username || !password) {
      return NextResponse.json(
        { success: false, error: '缺少必要欄位：email, username, password' },
        { status: 400 }
      );
    }

    const user = await userService.register({ email, username, password });

    // 移除密碼雜湊
    const { password_hash, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '註冊失敗',
      },
      { status: 500 }
    );
  }
}

