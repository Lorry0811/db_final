import { NextRequest, NextResponse } from 'next/server';
import { MessageService } from '@/lib/services/message.service';
import { getCurrentUserId } from '@/lib/auth/session';

const messageService = new MessageService();

// GET /api/messages - 查詢使用者的私訊列表或對話
export async function GET(request: NextRequest) {
  try {
    const currentUserId = await getCurrentUserId();

    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: '請先登入' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const otherUserId = searchParams.get('otherUserId');
    const conversationList = searchParams.get('conversationList') === 'true';
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    // 如果請求對話列表
    if (conversationList) {
      const conversations = await messageService.getConversationList(currentUserId);
      return NextResponse.json({
        success: true,
        data: conversations,
      });
    }

    // 如果指定了其他使用者，查詢對話
    if (otherUserId) {
      const result = await messageService.getConversation(
        currentUserId,
        parseInt(otherUserId),
        { page, limit }
      );
      return NextResponse.json({
        success: true,
        data: result.data,
        count: result.count,
      });
    }

    // 否則查詢所有私訊
    const result = await messageService.getUserMessages(currentUserId, {
      page,
      limit,
      unreadOnly,
    });

    return NextResponse.json({
      success: true,
      data: result.data,
      count: result.count,
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

// POST /api/messages - 發送私訊
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
    const { receiverId, content } = body;

    if (!receiverId || !content || content.trim() === '') {
      return NextResponse.json(
        { success: false, error: '缺少必要欄位' },
        { status: 400 }
      );
    }

    const message = await messageService.sendMessage({
      sender_id: currentUserId,
      receiver_id: receiverId,
      content: content.trim(),
    });

    return NextResponse.json({
      success: true,
      data: message,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '發送私訊失敗',
      },
      { status: 500 }
    );
  }
}

