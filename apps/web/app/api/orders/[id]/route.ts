import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/lib/services/order.service';
import { getCurrentUserId } from '@/lib/auth/session';

const orderService = new OrderService();

// GET /api/orders/:id - 查詢訂單詳情
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

    const orderId = parseInt(params.id);

    if (isNaN(orderId)) {
      return NextResponse.json(
        { success: false, error: '無效的訂單 ID' },
        { status: 400 }
      );
    }

    const order = await orderService.getOrderById(orderId);

    // 檢查是否為訂單的買家或賣家
    const isBuyer = order.buyer_id === currentUserId;
    const sellerId = order.posting?.u_id;
    const isSeller = sellerId === currentUserId;

    if (!isBuyer && !isSeller) {
      return NextResponse.json(
        { success: false, error: '您沒有權限查看此訂單' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
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

