'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatPrice, formatDate } from '@/lib/utils/format';
import { getClientSession } from '@/lib/auth/client-session';

interface FavoritePosting {
  p_id: number;
  title: string;
  price: number;
  status: string;
  image_url: string | null;
  created_at: string;
  user?: {
    username: string;
  };
  class?: {
    class_name: string;
  };
}

export default function FavoritesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    const session = getClientSession();
    if (!session) {
      router.push('/login?redirect=/favorites');
      return;
    }

    loadFavorites();
  }, [router]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/favorites');
      const result = await response.json();

      if (result.success) {
        // 提取 posting 資料
        const favoritePostings = result.data.map((fav: any) => ({
          ...fav.posting,
          added_time: fav.added_time,
        }));
        setFavorites(favoritePostings || []);
      } else {
        alert(result.error || '載入收藏失敗');
      }
    } catch (error) {
      console.error('載入收藏失敗:', error);
      alert('載入收藏失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (postingId: number) => {
    if (!confirm('確定要取消收藏嗎？')) {
      return;
    }

    try {
      const response = await fetch(`/api/favorites?postingId=${postingId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        loadFavorites(); // 重新載入收藏列表
      } else {
        alert(result.error || '取消收藏失敗');
      }
    } catch (error) {
      alert('取消收藏失敗，請稍後再試');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">載入中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">我的收藏</h1>

      {favorites.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500 mb-4">還沒有收藏任何商品</p>
          <Link
            href="/postings"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            去瀏覽商品
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((posting: FavoritePosting) => (
            <div
              key={posting.p_id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <Link href={`/postings/${posting.p_id}`}>
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  {posting.image_url ? (
                    <img
                      src={posting.image_url}
                      alt={posting.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400">無圖片</span>
                  )}
                </div>
              </Link>
              <div className="p-4">
                <Link href={`/postings/${posting.p_id}`}>
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-blue-600">
                    {posting.title}
                  </h3>
                </Link>
                <p className="text-blue-600 font-bold text-xl mb-2">
                  {formatPrice(posting.price)}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                  <span>{posting.class?.class_name || '未分類'}</span>
                  <span>{formatDate(posting.created_at)}</span>
                </div>
                <button
                  onClick={() => handleRemoveFavorite(posting.p_id)}
                  className="w-full mt-2 px-4 py-2 border-2 border-red-600 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
                >
                  取消收藏
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

