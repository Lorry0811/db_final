import { NextRequest, NextResponse } from 'next/server';
import { ReviewService } from '@/lib/services/review.service';

const reviewService = new ReviewService();

// GET /api/reviews/average?userId=xxx - 查詢使用者的平均評分
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '缺少 userId 參數' },
        { status: 400 }
      );
    }

    const userIdNum = parseInt(userId);
    if (isNaN(userIdNum)) {
      return NextResponse.json(
        { success: false, error: '無效的 userId' },
        { status: 400 }
      );
    }

    const result = await reviewService.getAverageRating(userIdNum);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '查詢平均評分失敗',
      },
      { status: 500 }
    );
  }
}

