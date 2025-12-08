import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth/session';
import { UserRepository } from '@/lib/repositories/user.repository';
import { supabaseAdmin } from '@/lib/supabase/admin';

const userRepo = new UserRepository();

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

// GET /api/admin/statistics - 取得平台統計資訊
export async function GET(request: NextRequest) {
  try {
    await checkAdmin();

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'platform';

    if (type === 'platform') {
      // 平台統計
      const [
        { count: totalUsers },
        { count: totalPostings },
        { count: activePostings },
        { count: soldPostings },
        { count: totalOrders },
        { count: totalTransactions },
        { count: totalReports },
        { count: pendingReports },
      ] = await Promise.all([
        supabaseAdmin.from('user').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('posting').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('posting').select('*', { count: 'exact', head: true }).eq('status', 'listed'),
        supabaseAdmin.from('posting').select('*', { count: 'exact', head: true }).eq('status', 'sold'),
        supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('transaction_record').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('report').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('report').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      // 計算總交易金額
      const { data: transactions } = await supabaseAdmin
        .from('transaction_record')
        .select('amount')
        .in('trans_type', ['payment', 'income']);

      const totalRevenue = transactions
        ? transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
        : 0;

      return NextResponse.json({
        success: true,
        data: {
          total_users: totalUsers || 0,
          total_postings: totalPostings || 0,
          active_postings: activePostings || 0,
          sold_postings: soldPostings || 0,
          total_orders: totalOrders || 0,
          total_transactions: totalTransactions || 0,
          total_revenue: totalRevenue,
          total_reports: totalReports || 0,
          pending_reports: pendingReports || 0,
        },
      });
    } else if (type === 'class') {
      // 分類統計
      const { data, error } = await supabaseAdmin
        .from('v_class_statistics')
        .select('*')
        .order('total_postings', { ascending: false });

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data: data || [],
      });
    } else if (type === 'course') {
      // 課程統計
      const { data, error } = await supabaseAdmin
        .from('v_course_statistics')
        .select('*')
        .order('total_postings', { ascending: false })
        .limit(50); // 限制前 50 個最熱門的課程

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data: data || [],
      });
    } else if (type === 'transaction') {
      // 交易統計
      const { data: transactions, error } = await supabaseAdmin
        .from('transaction_record')
        .select('amount, trans_type, trans_time')
        .order('trans_time', { ascending: false })
        .limit(100);

      if (error) throw error;

      // 按類型統計
      const stats = {
        top_up: { count: 0, total: 0 },
        payment: { count: 0, total: 0 },
        income: { count: 0, total: 0 },
        refund: { count: 0, total: 0 },
      };

      transactions?.forEach((t) => {
        const type = t.trans_type as keyof typeof stats;
        if (stats[type]) {
          stats[type].count++;
          stats[type].total += Math.abs(t.amount);
        }
      });

      return NextResponse.json({
        success: true,
        data: {
          recent_transactions: transactions || [],
          statistics: stats,
        },
      });
    } else {
      return NextResponse.json(
        { success: false, error: '無效的統計類型' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '查詢統計失敗',
      },
      { status: error.message?.includes('無權限') ? 403 : error.message?.includes('登入') ? 401 : 500 }
    );
  }
}

