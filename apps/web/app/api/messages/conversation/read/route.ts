import { NextRequest, NextResponse } from 'next/server';
import { MessageService } from '@/lib/services/message.service';
import { getCurrentUserId } from '@/lib/auth/session';

const messageService = new MessageService();

// POST /api/messages/conversation/read - 標記與特定使用者的所有私訊為已讀
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
    const { otherUserId } = body;

    if (!otherUserId) {
      return NextResponse.json(
        { success: false, error: '缺少必要參數：otherUserId' },
        { status: 400 }
      );
    }

    await messageService.markConversationAsRead(currentUserId, otherUserId);

    return NextResponse.json({
      success: true,
      message: '已標記為已讀',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '標記對話失敗',
      },
      { status: 500 }
    );
  }
}

