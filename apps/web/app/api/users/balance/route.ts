import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/services/user.service';
import { getCurrentUserId } from '@/lib/auth/session';

const userService = new UserService();

// GET /api/users/balance - 查詢餘額
export async function GET(request: NextRequest) {
  try {
    const currentUserId = await getCurrentUserId();

    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: '請先登入' },
        { status: 401 }
      );
    }

    const user = await userService.getUserById(currentUserId);

    return NextResponse.json({
      success: true,
      data: {
        balance: user.balance,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '查詢餘額失敗',
      },
      { status: 500 }
    );
  }
}

