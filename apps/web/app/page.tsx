import Link from 'next/link';
import { PostingService } from '@/lib/services/posting.service';
import { formatPrice } from '@/lib/utils/format';

// 禁用靜態生成，確保每次請求都獲取最新數據
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const postingService = new PostingService();

export default async function HomePage() {
  // 取得最新刊登（加入錯誤處理）
  let latestPostings: any = { data: [] };

  try {
    // 取得最新刊登
    latestPostings = await postingService.searchPostings({
      status: 'listed',
      limit: 6,
    });
  } catch (error: any) {
    // 如果環境變數未設定或資料庫連線失敗，顯示空狀態
    console.error('Failed to load postings:', error.message);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white rounded-card shadow-soft">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-text-primary mb-4">
          歡迎來到 BookSwap
        </h1>
        <p className="text-xl text-text-secondary mb-8">
          尋找你需要的二手教科書與物品，或刊登你想出售的商品
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            href="/postings"
            className="btn-primary px-6 py-3"
          >
            瀏覽商品
          </Link>
          <Link
            href="/postings/new"
            className="btn-secondary px-6 py-3"
          >
            刊登商品
          </Link>
        </div>
      </div>

      {/* 最新刊登 */}
      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-6">最新刊登</h2>
        {!latestPostings.data || latestPostings.data.length === 0 ? (
          <div className="text-center py-12 bg-brand-beige rounded-card">
            <p className="text-text-secondary">目前沒有最新刊登</p>
            <p className="text-sm text-text-tertiary mt-2">
              {process.env.NEXT_PUBLIC_SUPABASE_URL ? '' : '請確認環境變數已正確設定'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestPostings.data.map((posting: any) => (
            <Link
              key={posting.p_id}
              href={`/postings/${posting.p_id}`}
              className="card card-hover overflow-hidden"
            >
              <div className="h-48 bg-brand-beige flex items-center justify-center overflow-hidden">
                {posting.images && posting.images.length > 0 ? (
                  <img
                    src={posting.images[0].image_url}
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
                {posting.class?.class_name && (
                  <span className="tag tag-default">
                    {posting.class.class_name}
                  </span>
                )}
              </div>
            </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
