import { NextRequest, NextResponse } from 'next/server';
import { TransactionService } from '@/lib/services/transaction.service';
import { getCurrentUserId } from '@/lib/auth/session';

const transactionService = new TransactionService();

// GET /api/transactions - 查詢使用者的交易紀錄
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
    const transType = searchParams.get('transType') || undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20;

    const result = await transactionService.getUserTransactions(currentUserId, {
      transType,
      page,
      limit,
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
        error: error.message || '查詢交易紀錄失敗',
      },
      { status: 500 }
    );
  }
}

