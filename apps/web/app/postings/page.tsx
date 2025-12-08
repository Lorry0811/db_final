import { PostingService } from '@/lib/services/posting.service';
import { ClassService } from '@/lib/services/class.service';
import { CourseService } from '@/lib/services/course.service';
import { formatPrice, formatDate } from '@/lib/utils/format';
import Link from 'next/link';

// 禁用靜態生成，確保每次請求都獲取最新數據
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const postingService = new PostingService();
const classService = new ClassService();
const courseService = new CourseService();

interface SearchParams {
  status?: string;
  classId?: string;
  courseId?: string;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
}

export default async function PostingsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // 強制只顯示 listed 狀態的商品，忽略用戶輸入的 status 參數
  const filters = {
    status: 'listed', // 強制只顯示刊登中的商品
    classId: searchParams.classId ? parseInt(searchParams.classId) : undefined,
    courseId: searchParams.courseId ? parseInt(searchParams.courseId) : undefined,
    search: searchParams.search || undefined,
    minPrice: searchParams.minPrice ? parseInt(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? parseInt(searchParams.maxPrice) : undefined,
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    limit: 20,
  };

  // 取得分類和課程列表（用於篩選下拉選單）
  const [classes, courses] = await Promise.all([
    classService.getAllClasses().catch(() => []),
    courseService.getAllCourses().catch(() => []),
  ]);

  const result = await postingService.searchPostings(filters);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary mb-4">瀏覽商品</h1>
        
        {/* 搜尋表單 */}
        <div className="card mb-6">
          <form method="GET" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <input
              type="text"
              name="search"
              placeholder="搜尋關鍵字..."
              defaultValue={searchParams.search}
              className="input"
            />
            <select
              name="classId"
              defaultValue={searchParams.classId || ''}
              className="input"
            >
              <option value="">全部分類</option>
              {classes.map((cls: any) => (
                <option key={cls.class_id} value={cls.class_id}>
                  {cls.class_name}
                </option>
              ))}
            </select>
            <select
              name="courseId"
              defaultValue={searchParams.courseId || ''}
              className="input"
            >
              <option value="">全部課程</option>
              {courses.map((course: any) => (
                <option key={course.course_id} value={course.course_id}>
                  {course.course_code} - {course.course_name}
                </option>
              ))}
            </select>
            <input
              type="number"
              name="minPrice"
              placeholder="最低價格"
              defaultValue={searchParams.minPrice}
              className="input"
            />
            <input
              type="number"
              name="maxPrice"
              placeholder="最高價格"
              defaultValue={searchParams.maxPrice}
              className="input"
            />
            <button
              type="submit"
              className="btn-primary"
            >
              搜尋
            </button>
          </form>
        </div>
      </div>

      {/* 商品列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {result.data?.map((posting: any) => {
          // 獲取第一張圖片 URL
          const getImageUrl = () => {
            if (posting.images && posting.images.length > 0) {
              return posting.images[0].image_url;
            }
            return posting.image_url || null;
          };
          const imageUrl = getImageUrl();
          
          return (
          <Link
            key={posting.p_id}
            href={`/postings/${posting.p_id}`}
            className="card card-hover overflow-hidden"
          >
            <div className="h-48 bg-brand-beige flex items-center justify-center overflow-hidden">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={posting.title}
                  className="w-full h-full object-cover image-rounded"
                />
              ) : (
                <span className="text-text-tertiary">無圖片</span>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-text-primary">
                {posting.title}
              </h3>
              <p className="text-brand-blue font-bold text-xl mb-2">
                {formatPrice(posting.price)}
              </p>
              <div className="text-sm text-text-secondary space-y-1">
                {posting.class?.class_name && (
                  <span className="tag tag-default mr-2">
                    {posting.class.class_name}
                  </span>
                )}
                {posting.course?.course_name && (
                  <p className="mt-2">{posting.course.course_name}</p>
                )}
                <p className="text-text-tertiary">{formatDate(posting.created_at)}</p>
              </div>
            </div>
          </Link>
          );
        })}
      </div>

      {/* 分頁 */}
      {result.count && result.count > filters.limit! && (
        <div className="mt-8 flex justify-center space-x-2">
          {Array.from({ length: Math.ceil(result.count / filters.limit!) }).map((_, i) => {
            const page = i + 1;
            const params = new URLSearchParams();
            if (searchParams.search) params.set('search', searchParams.search);
            if (searchParams.classId) params.set('classId', searchParams.classId);
            if (searchParams.courseId) params.set('courseId', searchParams.courseId);
            if (searchParams.minPrice) params.set('minPrice', searchParams.minPrice);
            if (searchParams.maxPrice) params.set('maxPrice', searchParams.maxPrice);
            if (page > 1) params.set('page', page.toString());
            
            return (
              <Link
                key={page}
                href={`/postings${params.toString() ? `?${params.toString()}` : ''}`}
                className={`px-4 py-2 rounded-button transition-colors ${
                  (filters.page || 1) === page
                    ? 'bg-brand-blue text-white'
                    : 'bg-white text-text-primary hover:bg-brand-beige border border-border-light'
                }`}
              >
                {page}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

