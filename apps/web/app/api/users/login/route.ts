import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/services/user.service';
import { setSession } from '@/lib/auth/session';

const userService = new UserService();

// POST /api/users/login - 登入
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: '缺少必要欄位：email, password' },
        { status: 400 }
      );
    }

    const user = await userService.login(email, password);

    // 設定 Session
    await setSession({
      u_id: user.u_id,
      email: user.email,
      username: user.username,
      is_admin: user.is_admin,
      is_blocked: user.is_blocked,
    });

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '登入失敗',
      },
      { status: 401 }
    );
  }
}

