import { NextRequest, NextResponse } from 'next/server';
import { PostingService } from '@/lib/services/posting.service';
import { getCurrentUserId } from '@/lib/auth/session';

const postingService = new PostingService();

// GET /api/postings/:id - 查詢刊登詳情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: '無效的刊登 ID' },
        { status: 400 }
      );
    }

    const posting = await postingService.getPostingById(id);

    return NextResponse.json({
      success: true,
      data: posting,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '查詢刊登失敗',
      },
      { status: 500 }
    );
  }
}

// PUT /api/postings/:id - 更新刊登
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const currentUserId = await getCurrentUserId();

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: '無效的刊登 ID' },
        { status: 400 }
      );
    }

    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: '請先登入' },
        { status: 401 }
      );
    }

    // 檢查是否為刊登者本人
    const posting = await postingService.getPostingById(id);
    if (posting.u_id !== currentUserId) {
      return NextResponse.json(
        { success: false, error: '您沒有權限編輯此刊登' },
        { status: 403 }
      );
    }

    // 處理圖片更新
    const { images, ...postingData } = body;
    const postingImages = images?.map((img: any, index: number) => ({
      image_url: typeof img === 'string' ? img : img.url || img.image_url,
      display_order: img.display_order ?? index,
    }));

    const updatedPosting = await postingService.updatePosting(id, postingData);

    // 如果有新圖片，更新圖片
    if (postingImages && postingImages.length > 0) {
      // 先刪除舊圖片
      const oldImages = await postingService.getImages(id);
      for (const img of oldImages) {
        await postingService.deleteImage(img.image_id);
      }
      // 新增新圖片
      for (const img of postingImages) {
        await postingService.addImage({
          p_id: id,
          image_url: img.image_url,
          display_order: img.display_order,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedPosting,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '更新刊登失敗',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/postings/:id - 下架刊登
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const currentUserId = await getCurrentUserId();

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: '無效的刊登 ID' },
        { status: 400 }
      );
    }

    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: '請先登入' },
        { status: 401 }
      );
    }

    // 檢查是否為刊登者本人
    const posting = await postingService.getPostingById(id);
    if (posting.u_id !== currentUserId) {
      return NextResponse.json(
        { success: false, error: '您沒有權限下架此刊登' },
        { status: 403 }
      );
    }

    await postingService.removePosting(id);

    return NextResponse.json({
      success: true,
      message: '刊登已下架',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '下架刊登失敗',
      },
      { status: 500 }
    );
  }
}

