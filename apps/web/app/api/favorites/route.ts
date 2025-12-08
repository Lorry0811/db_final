import { NextRequest, NextResponse } from 'next/server';
import { FavoriteService } from '@/lib/services/favorite.service';
import { getCurrentUserId } from '@/lib/auth/session';

const favoriteService = new FavoriteService();

// GET /api/favorites - 查詢使用者的收藏列表
export async function GET(request: NextRequest) {
  try {
    const currentUserId = await getCurrentUserId();

    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: '請先登入' },
        { status: 401 }
      );
    }

    const favorites = await favoriteService.getUserFavorites(currentUserId);

    return NextResponse.json({
      success: true,
      data: favorites,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '查詢收藏失敗',
      },
      { status: 500 }
    );
  }
}

// POST /api/favorites - 新增收藏
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
    const { postingId } = body;

    if (!postingId) {
      return NextResponse.json(
        { success: false, error: '缺少刊登 ID' },
        { status: 400 }
      );
    }

    // 檢查是否已收藏
    const isFavorited = await favoriteService.isFavorited(currentUserId, postingId);
    if (isFavorited) {
      return NextResponse.json(
        { success: false, error: '已經收藏過此刊登' },
        { status: 400 }
      );
    }

    await favoriteService.addFavorite(currentUserId, postingId);

    return NextResponse.json({
      success: true,
      message: '收藏成功',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '收藏失敗',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/favorites - 取消收藏
export async function DELETE(request: NextRequest) {
  try {
    const currentUserId = await getCurrentUserId();

    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: '請先登入' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const postingId = searchParams.get('postingId');

    if (!postingId) {
      return NextResponse.json(
        { success: false, error: '缺少刊登 ID' },
        { status: 400 }
      );
    }

    await favoriteService.removeFavorite(currentUserId, parseInt(postingId));

    return NextResponse.json({
      success: true,
      message: '取消收藏成功',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '取消收藏失敗',
      },
      { status: 500 }
    );
  }
}

