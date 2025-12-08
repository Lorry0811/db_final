import { NextRequest, NextResponse } from 'next/server';
import { PostingService } from '@/lib/services/posting.service';

const postingService = new PostingService();

// GET /api/postings - 查詢刊登列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // 如果指定了 userId，查詢該使用者的刊登
    const userId = searchParams.get('userId') ? parseInt(searchParams.get('userId')!) : undefined;
    
    if (userId) {
      const status = searchParams.get('status') || undefined;
      const postings = await postingService.getUserPostings(userId, status);
      return NextResponse.json({
        success: true,
        data: postings,
        count: postings.length,
      });
    }
    
    const filters = {
      status: searchParams.get('status') || undefined,
      classId: searchParams.get('classId') ? parseInt(searchParams.get('classId')!) : undefined,
      courseId: searchParams.get('courseId') ? parseInt(searchParams.get('courseId')!) : undefined,
      search: searchParams.get('search') || undefined,
      minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
    };

    const result = await postingService.searchPostings(filters);

    return NextResponse.json({
      success: true,
      data: result.data,
      count: result.count,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '查詢刊登失敗',
      },
      { status: 500 }
    );
  }
}

// POST /api/postings - 新增刊登
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { images, ...postingData } = body;

    // 如果有 images 陣列，轉換為 PostingImageInsert 格式
    const postingImages = images?.map((img: any, index: number) => ({
      image_url: typeof img === 'string' ? img : img.url || img.image_url,
      display_order: img.display_order ?? index,
    }));

    const posting = await postingService.createPosting(postingData, postingImages);

    return NextResponse.json({
      success: true,
      data: posting,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || '新增刊登失敗',
      },
      { status: 500 }
    );
  }
}

