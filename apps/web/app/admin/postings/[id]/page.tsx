'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { getClientSession } from '@/lib/auth/client-session';
import { formatPrice, formatDate, formatStatus } from '@/lib/utils/format';

interface PostingDetail {
  p_id: number;
  title: string;
  description: string;
  price: number;
  status: string;
  created_at: string;
  updated_at: string;
  user?: {
    u_id: number;
    username: string;
    email: string;
  };
  class?: {
    class_id: number;
    class_name: string;
  };
  course?: {
    course_id: number;
    course_name: string;
    course_code: string;
  };
  images?: Array<{
    image_id: number;
    image_url: string;
    display_order: number;
  }>;
}

export default function AdminPostingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const postingId = parseInt(params.id as string);
  
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState<PostingDetail | null>(null);

  useEffect(() => {
    const session = getClientSession();
    if (!session || !session.is_admin) {
      router.push('/admin');
      return;
    }

    if (isNaN(postingId)) {
      router.push('/admin/postings');
      return;
    }

    loadPosting();
  }, [postingId, router]);

  const loadPosting = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/postings/${postingId}`);
      const result = await response.json();

      if (result.success) {
        setPosting(result.data);
      } else {
        alert(result.error || '載入刊登詳情失敗');
        router.push('/admin/postings');
      }
    } catch (error) {
      console.error('載入刊登詳情失敗:', error);
      alert('載入刊登詳情失敗，請稍後再試');
      router.push('/admin/postings');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm('確定要移除此違規刊登嗎？')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/postings/${postingId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message || '移除成功');
        router.push('/admin/postings');
      } else {
        alert(result.error || '移除失敗');
      }
    } catch (error) {
      console.error('移除失敗:', error);
      alert('移除失敗，請稍後再試');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">載入中...</div>
      </div>
    );
  }

  if (!posting) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">找不到此刊登</h1>
          <Link href="/admin/postings" className="text-blue-600 hover:text-blue-700">
            返回刊登列表
          </Link>
        </div>
      </div>
    );
  }

  const sortedImages = posting.images
    ? [...posting.images].sort((a, b) => a.display_order - b.display_order)
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/admin/postings" className="text-blue-600 hover:text-blue-700">
          ← 返回刊登列表
        </Link>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">刊登詳情</h1>
        {posting.status !== 'removed' && (
          <button
            onClick={handleRemove}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            移除違規刊登
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        {/* 基本資訊 */}
        <div>
          <h2 className="text-xl font-semibold mb-4">基本資訊</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                刊登 ID
              </label>
              <p className="text-gray-900">{posting.p_id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                狀態
              </label>
              <span className={`px-2 py-1 rounded text-sm font-medium ${
                posting.status === 'listed' ? 'bg-green-100 text-green-700' :
                posting.status === 'sold' ? 'bg-blue-100 text-blue-700' :
                posting.status === 'removed' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {formatStatus(posting.status)}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                標題
              </label>
              <p className="text-gray-900">{posting.title}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                價格
              </label>
              <p className="text-blue-600 font-bold text-xl">{formatPrice(posting.price)}</p>
            </div>
            {posting.class && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  分類
                </label>
                <p className="text-gray-900">{posting.class.class_name}</p>
              </div>
            )}
            {posting.course && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  課程
                </label>
                <p className="text-gray-900">
                  {posting.course.course_code} - {posting.course.course_name}
                </p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                建立時間
              </label>
              <p className="text-gray-900">{formatDate(posting.created_at)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                更新時間
              </label>
              <p className="text-gray-900">{formatDate(posting.updated_at)}</p>
            </div>
          </div>
        </div>

        {/* 商品描述 */}
        {posting.description && (
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">商品描述</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{posting.description}</p>
          </div>
        )}

        {/* 賣家資訊 */}
        {posting.user && (
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">賣家資訊</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">使用者名稱：</span>
                <Link
                  href={`/admin/users/${posting.user.u_id}`}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {posting.user.username}
                </Link>
              </p>
              <p>
                <span className="font-medium">電子郵件：</span>
                {posting.user.email}
              </p>
            </div>
          </div>
        )}

        {/* 商品圖片 */}
        {sortedImages.length > 0 && (
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">商品圖片</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {sortedImages.map((image) => (
                <div key={image.image_id} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={image.image_url}
                    alt={`商品圖片 ${image.display_order + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

