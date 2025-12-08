import { NextRequest, NextResponse } from 'next/server';
import { ReviewService } from '@/lib/services/review.service';
import { getCurrentUserId } from '@/lib/auth/session';

const reviewService = new ReviewService();

// GET /api/reviews - 查詢評價列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const targetId = searchParams.get('targetId') ? parseInt(searchParams.get('targetId')!) : undefined;
    const reviewerId = searchParams.get('reviewerId') ? parseInt(searchParams.get('reviewerId')!) : undefined;
    const orderId = searchParams.get('orderId') ? parseInt(searchParams.get('orderId')!) : undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    // 如果查詢 reviewerId，需要驗證使用者身份
    if (reviewerId) {
      const currentUserId = await getCurrentUserId();
      if (!currentUserId) {
        return NextResponse.json(
          { success: false, error: '請先登入' },
          { status: 401 }
        );
      }
      // 只能查詢自己的評價紀錄
      if (reviewerId !== currentUserId) {
        return NextResponse.json(
          { success: false, error: '無權限查詢此使用者的評價紀錄' },
          { status: 403 }
        );
      }
    }

    let result;
    if (reviewerId) {
      // 查詢使用者的評價紀錄
      result = await reviewService.getUserReviews(reviewerId, { page, limit });
    } else if (targetId) {
      // 查詢賣家的評價列表
      result = await reviewService.getSellerReviews(targetId, { page, limit });
    } else if (orderId) {
      // 查詢特定訂單的評價
      const review = await reviewService.getOrderReview(orderId);
      result = { data: review ? [review] : [], count: review ? 1 : 0 };
    } else {
      // 沒有指定條件，返回空結果
      result = { data: [], count: 0 };
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      count: result.count,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '查詢評價失敗',
      },
      { status: 500 }
    );
  }
}

// POST /api/reviews - 新增評價
export async function POST(request: NextRequest) {
  try {
    const currentUserId = await getCurrentUserId();

    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: '請先登入' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId, rating, comment } = body;

    if (!orderId || !rating) {
      return NextResponse.json(
        { success: false, error: '缺少必要欄位' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: '評分必須在 1 到 5 之間' },
        { status: 400 }
      );
    }

    const review = await reviewService.createReview(
      currentUserId,
      orderId,
      rating,
      comment
    );

    return NextResponse.json({
      success: true,
      data: review,
      message: '評價成功',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '評價失敗',
      },
      { status: 500 }
    );
  }
}

