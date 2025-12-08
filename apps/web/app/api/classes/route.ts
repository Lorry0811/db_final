import { NextRequest, NextResponse } from 'next/server';
import { ClassService } from '@/lib/services/class.service';

const classService = new ClassService();

// GET /api/classes - 查詢所有分類（公開 API，不需要登入）
export async function GET(request: NextRequest) {
  try {
    const classes = await classService.getAllClasses();

    return NextResponse.json({
      success: true,
      data: classes,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '查詢分類失敗',
      },
      { status: 500 }
    );
  }
}

