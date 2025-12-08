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

// GET /api/admin/classes/[id] - 查詢單一分類
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await checkAdmin();

    const classId = parseInt(params.id);
    if (isNaN(classId)) {
      return NextResponse.json(
        { success: false, error: '無效的分類 ID' },
        { status: 400 }
      );
    }

    const classData = await classService.getClassById(classId);
    return NextResponse.json({
      success: true,
      data: classData,
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

// PUT /api/admin/classes/[id] - 更新分類
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await checkAdmin();

    const classId = parseInt(params.id);
    if (isNaN(classId)) {
      return NextResponse.json(
        { success: false, error: '無效的分類 ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { class_name, description } = body;

    const classData = await classService.updateClass(classId, {
      class_name,
      description,
    });

    return NextResponse.json({
      success: true,
      data: classData,
      message: '分類更新成功',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '更新分類失敗',
      },
      { status: error.message?.includes('無權限') ? 403 : error.message?.includes('登入') ? 401 : 500 }
    );
  }
}

// DELETE /api/admin/classes/[id] - 刪除分類
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await checkAdmin();

    const classId = parseInt(params.id);
    if (isNaN(classId)) {
      return NextResponse.json(
        { success: false, error: '無效的分類 ID' },
        { status: 400 }
      );
    }

    await classService.deleteClass(classId);

    return NextResponse.json({
      success: true,
      message: '分類刪除成功',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '刪除分類失敗',
      },
      { status: error.message?.includes('無權限') ? 403 : error.message?.includes('登入') ? 401 : 500 }
    );
  }
}

