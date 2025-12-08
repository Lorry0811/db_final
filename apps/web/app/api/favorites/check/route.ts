import { NextRequest, NextResponse } from 'next/server';
import { FavoriteService } from '@/lib/services/favorite.service';
import { getCurrentUserId } from '@/lib/auth/session';

const favoriteService = new FavoriteService();

// GET /api/favorites/check?postingId=xxx - 檢查是否已收藏
export async function GET(request: NextRequest) {
  try {
    const currentUserId = await getCurrentUserId();

    if (!currentUserId) {
      return NextResponse.json({
        success: true,
        data: { isFavorited: false },
      });
    }

    const searchParams = request.nextUrl.searchParams;
    const postingId = searchParams.get('postingId');

    if (!postingId) {
      return NextResponse.json(
        { success: false, error: '缺少刊登 ID' },
        { status: 400 }
      );
    }

    const isFavorited = await favoriteService.isFavorited(
      currentUserId,
      parseInt(postingId)
    );

    return NextResponse.json({
      success: true,
      data: { isFavorited },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '查詢收藏狀態失敗',
      },
      { status: 500 }
    );
  }
}

