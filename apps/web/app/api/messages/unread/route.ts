import { NextRequest, NextResponse } from 'next/server';
import { MessageService } from '@/lib/services/message.service';
import { getCurrentUserId } from '@/lib/auth/session';

const messageService = new MessageService();

// GET /api/messages/unread - 取得未讀私訊數量
export async function GET(request: NextRequest) {
  try {
    const currentUserId = await getCurrentUserId();

    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: '請先登入' },
        { status: 401 }
      );
    }

    const count = await messageService.getUnreadCount(currentUserId);

    return NextResponse.json({
      success: true,
      data: { count },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '查詢未讀私訊失敗',
      },
      { status: 500 }
    );
  }
}

