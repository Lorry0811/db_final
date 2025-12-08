import { NextRequest, NextResponse } from 'next/server';
import { UserRepository } from '@/lib/repositories/user.repository';

const userRepo = new UserRepository();

// GET /api/users/[id] - 查詢使用者資訊
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, error: '無效的使用者 ID' },
        { status: 400 }
      );
    }

    const user = await userRepo.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: '找不到此使用者' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '查詢使用者失敗',
      },
      { status: 500 }
    );
  }
}

