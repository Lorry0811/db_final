import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/lib/services/order.service';
import { getCurrentUserId } from '@/lib/auth/session';

const orderService = new OrderService();

// GET /api/orders - 查詢訂單列表
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
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20;

    // 只查詢當前使用者的訂單
    const result = await orderService.getOrders(currentUserId, page, limit);

    return NextResponse.json({
      success: true,
      data: result.data,
      count: result.count,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '查詢訂單失敗',
      },
      { status: 500 }
    );
  }
}

// POST /api/orders - 建立訂單（購買商品）
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
        { success: false, error: '缺少必要參數：postingId' },
        { status: 400 }
      );
    }

    // 使用資料庫函數執行購買流程（確保 ACID 特性）
    const result = await orderService.purchaseBook(currentUserId, postingId);

    if (!result || !result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result?.message || '購買失敗',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: '購買成功',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '購買失敗',
      },
      { status: 500 }
    );
  }
}

