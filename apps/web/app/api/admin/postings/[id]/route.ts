import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth/session';
import { UserRepository } from '@/lib/repositories/user.repository';
import { PostingService } from '@/lib/services/posting.service';

const userRepo = new UserRepository();
const postingService = new PostingService();

// 檢查是否為管理員
async function checkAdmin() {
  const currentUserId = await getCurrentUserId();
  if (!currentUserId) {
    throw new Error('請先登入');
  }

  const user = await userRepo.findById(currentUserId);
  if (!user.is_admin) {
    throw new Error('無權限：僅管理員可執行此操作');
  }

  return currentUserId;
}

// GET /api/admin/postings/[id] - 查詢刊登詳情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await checkAdmin();

    const postingId = parseInt(params.id);
    if (isNaN(postingId)) {
      return NextResponse.json(
        { success: false, error: '無效的刊登 ID' },
        { status: 400 }
      );
    }

    const posting = await postingService.getPostingById(postingId);

    return NextResponse.json({
      success: true,
      data: posting,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '查詢刊登詳情失敗',
      },
      { status: error.message?.includes('無權限') ? 403 : error.message?.includes('登入') ? 401 : 500 }
    );
  }
}

// DELETE /api/admin/postings/[id] - 移除違規刊登
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await checkAdmin();

    const postingId = parseInt(params.id);
    if (isNaN(postingId)) {
      return NextResponse.json(
        { success: false, error: '無效的刊登 ID' },
        { status: 400 }
      );
    }

    // 將刊登狀態改為 removed（而不是真正刪除）
    await postingService.updatePosting(postingId, { status: 'removed' });

    return NextResponse.json({
      success: true,
      message: '違規刊登已移除',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '移除刊登失敗',
      },
      { status: error.message?.includes('無權限') ? 403 : error.message?.includes('登入') ? 401 : 500 }
    );
  }
}

