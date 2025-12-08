import { NextRequest, NextResponse } from 'next/server';
import { ReportService } from '@/lib/services/report.service';
import { getCurrentUserId } from '@/lib/auth/session';

const reportService = new ReportService();

// GET /api/reports - 查詢使用者的舉報列表
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
    const reportType = searchParams.get('reportType') as 'posting' | 'comment' | 'order_violation' | null;
    const status = searchParams.get('status') as 'pending' | 'approved' | 'rejected' | null;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    const result = await reportService.getUserReports(currentUserId, {
      reportType: reportType || undefined,
      status: status || undefined,
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
        error: error.message || '查詢舉報失敗',
      },
      { status: 500 }
    );
  }
}

// POST /api/reports - 新增舉報
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
    const { reportType, targetId, reason, targetUserId } = body;

    if (!reportType || !targetId || !reason || reason.trim() === '') {
      return NextResponse.json(
        { success: false, error: '缺少必要欄位' },
        { status: 400 }
      );
    }

    let report;

    switch (reportType) {
      case 'posting':
        report = await reportService.reportPosting(currentUserId, targetId, reason);
        break;
      case 'comment':
        report = await reportService.reportComment(currentUserId, targetId, reason);
        break;
      case 'order_violation':
        if (!targetUserId) {
          return NextResponse.json(
            { success: false, error: '逃單舉報需要指定目標使用者' },
            { status: 400 }
          );
        }
        report = await reportService.reportOrderViolation(currentUserId, targetId, targetUserId, reason);
        break;
      default:
        return NextResponse.json(
          { success: false, error: '無效的舉報類型' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: report,
      message: '舉報成功，管理員將盡快處理',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '舉報失敗',
      },
      { status: 500 }
    );
  }
}

