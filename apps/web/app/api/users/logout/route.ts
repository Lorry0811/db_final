import { NextRequest, NextResponse } from 'next/server';
import { clearSession } from '@/lib/auth/session';

// POST /api/users/logout - 登出
export async function POST(request: NextRequest) {
  try {
    await clearSession();

    return NextResponse.json({
      success: true,
      message: '已成功登出',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '登出失敗',
      },
      { status: 500 }
    );
  }
}

