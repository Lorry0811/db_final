import { NextRequest, NextResponse } from 'next/server';
import { CommentService } from '@/lib/services/comment.service';
import { getCurrentUserId } from '@/lib/auth/session';

const commentService = new CommentService();

// PUT /api/comments/:id - 更新留言
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

    const commentId = parseInt(params.id);
    const body = await request.json();
    const { content } = body;

    if (!content || content.trim() === '') {
      return NextResponse.json(
        { success: false, error: '留言內容不能為空' },
        { status: 400 }
      );
    }

    // 檢查是否為留言者本人
    const comment = await commentService.getCommentById(commentId);
    if (comment.u_id !== currentUserId) {
      return NextResponse.json(
        { success: false, error: '您沒有權限編輯此留言' },
        { status: 403 }
      );
    }

    const updatedComment = await commentService.updateComment(commentId, {
      content: content.trim(),
    });

    return NextResponse.json({
      success: true,
      data: updatedComment,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '更新留言失敗',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/comments/:id - 刪除留言
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

    const commentId = parseInt(params.id);

    // 檢查是否為留言者本人
    const comment = await commentService.getCommentById(commentId);
    if (comment.u_id !== currentUserId) {
      return NextResponse.json(
        { success: false, error: '您沒有權限刪除此留言' },
        { status: 403 }
      );
    }

    await commentService.deleteComment(commentId);

    return NextResponse.json({
      success: true,
      message: '留言已刪除',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '刪除留言失敗',
      },
      { status: 500 }
    );
  }
}

