import { NextRequest, NextResponse } from 'next/server';
import { ReviewService } from '@/lib/services/review.service';
import { getCurrentUserId } from '@/lib/auth/session';

const reviewService = new ReviewService();

// GET /api/reviews/[id] - 查詢單一評價
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reviewId = parseInt(params.id);
    if (isNaN(reviewId)) {
      return NextResponse.json(
        { success: false, error: '無效的評價 ID' },
        { status: 400 }
      );
    }

    const review = await reviewService.reviewRepo.findById(reviewId);
    return NextResponse.json({
      success: true,
      data: review,
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

// PUT /api/reviews/[id] - 更新評價
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUserId = await getCurrentUserId();

    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: '請先登入' },
        { status: 401 }
      );
    }

    const reviewId = parseInt(params.id);
    if (isNaN(reviewId)) {
      return NextResponse.json(
        { success: false, error: '無效的評價 ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { rating, comment } = body;

    if (!rating) {
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

    const review = await reviewService.updateReview(
      reviewId,
      currentUserId,
      rating,
      comment
    );

    return NextResponse.json({
      success: true,
      data: review,
      message: '評價更新成功',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '更新評價失敗',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/reviews/[id] - 刪除評價
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUserId = await getCurrentUserId();

    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: '請先登入' },
        { status: 401 }
      );
    }

    const reviewId = parseInt(params.id);
    if (isNaN(reviewId)) {
      return NextResponse.json(
        { success: false, error: '無效的評價 ID' },
        { status: 400 }
      );
    }

    await reviewService.deleteReview(reviewId, currentUserId);

    return NextResponse.json({
      success: true,
      message: '評價刪除成功',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '刪除評價失敗',
      },
      { status: 500 }
    );
  }
}

