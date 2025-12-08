import { NextRequest, NextResponse } from 'next/server';
import { CourseService } from '@/lib/services/course.service';
import { getCurrentUserId } from '@/lib/auth/session';
import { UserRepository } from '@/lib/repositories/user.repository';

const courseService = new CourseService();
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

// GET /api/admin/courses/[id] - 查詢單一課程
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await checkAdmin();

    const courseId = parseInt(params.id);
    if (isNaN(courseId)) {
      return NextResponse.json(
        { success: false, error: '無效的課程 ID' },
        { status: 400 }
      );
    }

    const course = await courseService.getCourseById(courseId);
    return NextResponse.json({
      success: true,
      data: course,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '查詢課程失敗',
      },
      { status: error.message?.includes('無權限') ? 403 : error.message?.includes('登入') ? 401 : 500 }
    );
  }
}

// PUT /api/admin/courses/[id] - 更新課程
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await checkAdmin();

    const courseId = parseInt(params.id);
    if (isNaN(courseId)) {
      return NextResponse.json(
        { success: false, error: '無效的課程 ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { course_code, course_name, dept_id, class_id } = body;

    const course = await courseService.updateCourse(courseId, {
      course_code,
      course_name,
      dept_id: dept_id !== undefined ? dept_id : undefined,
      class_id: class_id !== undefined ? class_id : undefined,
    });

    return NextResponse.json({
      success: true,
      data: course,
      message: '課程更新成功',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '更新課程失敗',
      },
      { status: error.message?.includes('無權限') ? 403 : error.message?.includes('登入') ? 401 : 500 }
    );
  }
}

// DELETE /api/admin/courses/[id] - 刪除課程
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await checkAdmin();

    const courseId = parseInt(params.id);
    if (isNaN(courseId)) {
      return NextResponse.json(
        { success: false, error: '無效的課程 ID' },
        { status: 400 }
      );
    }

    await courseService.deleteCourse(courseId);

    return NextResponse.json({
      success: true,
      message: '課程刪除成功',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '刪除課程失敗',
      },
      { status: error.message?.includes('無權限') ? 403 : error.message?.includes('登入') ? 401 : 500 }
    );
  }
}

