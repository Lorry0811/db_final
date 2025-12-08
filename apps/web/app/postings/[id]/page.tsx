import { PostingService } from '@/lib/services/posting.service';
import Link from 'next/link';
import { getCurrentUserId } from '@/lib/auth/session';
import PostingDetailContent from '@/components/PostingDetailContent';

// 禁用靜態生成，確保每次請求都獲取最新數據
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const postingService = new PostingService();

export default async function PostingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // 每次請求都從資料庫獲取最新狀態
  const posting = await postingService.getPostingById(parseInt(params.id));
  const currentUserId = await getCurrentUserId();

  if (!posting) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">找不到此商品</h1>
          <Link
            href="/postings"
            className="text-blue-600 hover:text-blue-700"
          >
            返回商品列表
          </Link>
        </div>
      </div>
    );
  }

  return <PostingDetailContent initialPosting={posting} currentUserId={currentUserId} />;
}

