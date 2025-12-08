import { NextRequest, NextResponse } from 'next/server';
import { CourseService } from '@/lib/services/course.service';

const courseService = new CourseService();

// GET /api/courses - 查詢課程列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get('search') || '';

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
      { status: 500 }
    );
  }
}

