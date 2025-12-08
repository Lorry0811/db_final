import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth/session';
import { UserRepository } from '@/lib/repositories/user.repository';
import { ReportRepository } from '@/lib/repositories/report.repository';
import { PostingService } from '@/lib/services/posting.service';
import { supabaseAdmin } from '@/lib/supabase/admin';

const userRepo = new UserRepository();
const reportRepo = new ReportRepository();
const postingService = new PostingService();

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

// GET /api/admin/reports/[id] - 查詢舉報詳情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await checkAdmin();

    const reportId = parseInt(params.id);
    if (isNaN(reportId)) {
      return NextResponse.json(
        { success: false, error: '無效的舉報 ID' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('report')
      .select(`
        *,
        reporter:reporter_id(u_id, username, email),
        posting:p_id(p_id, title, description, price, status, u_id, user:u_id(u_id, username, email)),
        comment:comment_id(comment_id, content, u_id, p_id, user:u_id(u_id, username, email)),
        order:order_id(order_id, buyer_id, p_id, deal_price, order_date, buyer:buyer_id(u_id, username, email)),
        target_user:target_user_id(u_id, username, email),
        reviewer:reviewed_by(u_id, username, email)
      `)
      .eq('report_id', reportId)
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '查詢舉報詳情失敗',
      },
      { status: error.message?.includes('無權限') ? 403 : error.message?.includes('登入') ? 401 : 500 }
    );
  }
}

// PUT /api/admin/reports/[id] - 審核舉報（通過/駁回）
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUserId = await checkAdmin();

    const reportId = parseInt(params.id);
    if (isNaN(reportId)) {
      return NextResponse.json(
        { success: false, error: '無效的舉報 ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, removePosting } = body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: '狀態必須是 approved 或 rejected' },
        { status: 400 }
      );
    }

    // 取得舉報資訊
    const { data: report, error: reportError } = await supabaseAdmin
      .from('report')
      .select('*')
      .eq('report_id', reportId)
      .single();

    if (reportError || !report) {
      return NextResponse.json(
        { success: false, error: '找不到此舉報' },
        { status: 404 }
      );
    }

    // 更新舉報狀態
    const { data: updatedReport, error: updateError } = await supabaseAdmin
      .from('report')
      .update({
        status,
        reviewed_by: currentUserId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('report_id', reportId)
      .select(`
        *,
        reporter:reporter_id(u_id, username, email),
        posting:p_id(p_id, title, status),
        comment:comment_id(comment_id, content),
        order:order_id(order_id),
        target_user:target_user_id(u_id, username, email),
        reviewer:reviewed_by(u_id, username, email)
      `)
      .single();

    if (updateError) throw updateError;

    // 如果審核通過且需要移除刊登
    if (status === 'approved' && removePosting && report.report_type === 'posting' && report.p_id) {
      try {
        await postingService.updatePosting(report.p_id, { status: 'removed' });
      } catch (error) {
        console.error('移除刊登失敗:', error);
        // 不影響舉報審核的結果
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedReport,
      message: status === 'approved' ? '舉報已通過' : '舉報已駁回',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '審核舉報失敗',
      },
      { status: error.message?.includes('無權限') ? 403 : error.message?.includes('登入') ? 401 : 500 }
    );
  }
}

