import { NextRequest, NextResponse } from 'next/server';
import { MessageService } from '@/lib/services/message.service';
import { getCurrentUserId } from '@/lib/auth/session';

const messageService = new MessageService();

// GET /api/messages/:id - 查詢單一私訊
export async function GET(
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

    const msgId = parseInt(params.id);
    if (isNaN(msgId)) {
      return NextResponse.json(
        { success: false, error: '無效的私訊 ID' },
        { status: 400 }
      );
    }

    const message = await messageService.getMessageById(msgId);

    // 檢查權限：只有發送者或接收者可以查看
    if (message.sender_id !== currentUserId && message.receiver_id !== currentUserId) {
      return NextResponse.json(
        { success: false, error: '您沒有權限查看此私訊' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: message,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '查詢私訊失敗',
      },
      { status: 500 }
    );
  }
}

// PUT /api/messages/:id/read - 標記私訊為已讀
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

    const msgId = parseInt(params.id);
    if (isNaN(msgId)) {
      return NextResponse.json(
        { success: false, error: '無效的私訊 ID' },
        { status: 400 }
      );
    }

    const message = await messageService.getMessageById(msgId);

    // 檢查權限：只有接收者可以標記為已讀
    if (message.receiver_id !== currentUserId) {
      return NextResponse.json(
        { success: false, error: '您沒有權限標記此私訊' },
        { status: 403 }
      );
    }

    const updatedMessage = await messageService.markAsRead(msgId);

    return NextResponse.json({
      success: true,
      data: updatedMessage,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '標記私訊失敗',
      },
      { status: 500 }
    );
  }
}

