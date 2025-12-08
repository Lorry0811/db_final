import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

// GET /api/users/me - 取得目前登入的使用者資訊
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: '未登入' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '取得使用者資訊失敗',
      },
      { status: 500 }
    );
  }
}

