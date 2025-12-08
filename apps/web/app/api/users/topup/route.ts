import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/services/user.service';
import { TransactionService } from '@/lib/services/transaction.service';
import { getCurrentUserId } from '@/lib/auth/session';

const userService = new UserService();
const transactionService = new TransactionService();

// POST /api/users/topup - 儲值
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
    const { amount } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: '儲值金額必須大於 0' },
        { status: 400 }
      );
    }

    // 儲值
    await userService.topUp(currentUserId, amount);

    // 記錄交易
    await transactionService.createTransaction({
      u_id: currentUserId,
      amount: amount,
      trans_type: 'top_up',
    });

    // 取得更新後的餘額
    const user = await userService.getUserById(currentUserId);

    return NextResponse.json({
      success: true,
      message: '儲值成功',
      data: {
        balance: user.balance,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '儲值失敗',
      },
      { status: 500 }
    );
  }
}

