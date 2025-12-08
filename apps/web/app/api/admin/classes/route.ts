import { NextRequest, NextResponse } from 'next/server';
import { ClassService } from '@/lib/services/class.service';
import { getCurrentUserId } from '@/lib/auth/session';
import { UserRepository } from '@/lib/repositories/user.repository';

const classService = new ClassService();
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

// GET /api/admin/classes - 查詢所有分類
export async function GET(request: NextRequest) {
  try {
    await checkAdmin();

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
      { status: error.message?.includes('無權限') ? 403 : error.message?.includes('登入') ? 401 : 500 }
    );
  }
}

// POST /api/admin/classes - 新增分類
export async function POST(request: NextRequest) {
  try {
    await checkAdmin();

    const body = await request.json();
    const { class_name, description } = body;

    if (!class_name) {
      return NextResponse.json(
        { success: false, error: '缺少必要欄位：class_name' },
        { status: 400 }
      );
    }

    const classData = await classService.createClass({
      class_name,
      description,
    });

    return NextResponse.json({
      success: true,
      data: classData,
      message: '分類新增成功',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '新增分類失敗',
      },
      { status: error.message?.includes('無權限') ? 403 : error.message?.includes('登入') ? 401 : 500 }
    );
  }
}

