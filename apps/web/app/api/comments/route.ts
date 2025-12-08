import { NextRequest, NextResponse } from 'next/server';
import { CommentService } from '@/lib/services/comment.service';
import { getCurrentUserId } from '@/lib/auth/session';

const commentService = new CommentService();

// GET /api/comments?postingId=xxx - 查詢刊登的所有留言
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const postingId = searchParams.get('postingId');

    if (!postingId) {
      return NextResponse.json(
        { success: false, error: '缺少刊登 ID' },
        { status: 400 }
      );
    }

    const comments = await commentService.getPostingComments(parseInt(postingId));

    return NextResponse.json({
      success: true,
      data: comments,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '查詢留言失敗',
      },
      { status: 500 }
    );
  }
}

// POST /api/comments - 新增留言
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
    const { postingId, content } = body;

    if (!postingId || !content || content.trim() === '') {
      return NextResponse.json(
        { success: false, error: '缺少必要欄位' },
        { status: 400 }
      );
    }

    const comment = await commentService.createComment({
      p_id: postingId,
      u_id: currentUserId,
      content: content.trim(),
    });

    return NextResponse.json({
      success: true,
      data: comment,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '新增留言失敗',
      },
      { status: 500 }
    );
  }
}

