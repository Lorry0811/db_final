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

// GET /api/admin/courses - 查詢所有課程（支援搜尋）
export async function GET(request: NextRequest) {
  try {
    await checkAdmin();

    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get('keyword');

    let courses;
    if (keyword) {
      courses = await courseService.searchCourses(keyword);
    } else {
      courses = await courseService.getAllCourses();
    }

    return NextResponse.json({
      success: true,
      data: courses,
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

// POST /api/admin/courses - 新增課程
export async function POST(request: NextRequest) {
  try {
    await checkAdmin();

    const body = await request.json();
    const { course_code, course_name, dept_id, class_id } = body;

    if (!course_code || !course_name) {
      return NextResponse.json(
        { success: false, error: '缺少必要欄位：course_code 和 course_name' },
        { status: 400 }
      );
    }

    const course = await courseService.createCourse({
      course_code,
      course_name,
      dept_id: dept_id || null,
      class_id: class_id || null,
    });

    return NextResponse.json({
      success: true,
      data: course,
      message: '課程新增成功',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '新增課程失敗',
      },
      { status: error.message?.includes('無權限') ? 403 : error.message?.includes('登入') ? 401 : 500 }
    );
  }
}

