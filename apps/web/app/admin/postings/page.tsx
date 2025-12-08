'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getClientSession } from '@/lib/auth/client-session';
import { formatPrice, formatDate, formatStatus } from '@/lib/utils/format';

interface Posting {
  p_id: number;
  title: string;
  description: string;
  price: number;
  status: string;
  created_at: string;
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
  }>;
}

export default function AdminPostingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [postings, setPostings] = useState<Posting[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 20;

  useEffect(() => {
    const session = getClientSession();
    if (!session || !session.is_admin) {
      router.push('/admin');
      return;
    }

    loadPostings();
  }, [router, page, statusFilter]);

  const loadPostings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (searchKeyword) {
        params.append('search', searchKeyword);
      }

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/admin/postings?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setPostings(result.data || []);
        setTotalCount(result.count || 0);
      } else {
        alert(result.error || '載入刊登失敗');
      }
    } catch (error) {
      console.error('載入刊登失敗:', error);
      alert('載入刊登失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadPostings();
  };

  const handleRemove = async (postingId: number) => {
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
        loadPostings();
      } else {
        alert(result.error || '移除失敗');
      }
    } catch (error) {
      console.error('移除失敗:', error);
      alert('移除失敗，請稍後再試');
    }
  };

  const getImageUrl = (posting: Posting) => {
    if (posting.images && posting.images.length > 0) {
      return posting.images[0].image_url;
    }
    return null;
  };

  if (loading && postings.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">載入中...</div>
      </div>
    );
  }

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/admin" className="text-blue-600 hover:text-blue-700">
          ← 返回管理後台
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">刊登管理</h1>

      {/* 搜尋和篩選 */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="搜尋刊登標題或描述..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">全部狀態</option>
            <option value="listed">刊登中</option>
            <option value="sold">已售出</option>
            <option value="removed">已移除</option>
            <option value="reported">已舉報</option>
          </select>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            搜尋
          </button>
        </div>
      </div>

      {/* 刊登列表 */}
      <div className="space-y-4">
        {postings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
            尚無刊登資料
          </div>
        ) : (
          postings.map((posting) => {
            const imageUrl = getImageUrl(posting);
            return (
              <div
                key={posting.p_id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex space-x-4">
                  {imageUrl && (
                    <div className="w-32 h-32 bg-gray-200 rounded-lg flex-shrink-0">
                      <img
                        src={imageUrl}
                        alt={posting.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <Link
                        href={`/admin/postings/${posting.p_id}`}
                        className="text-lg font-semibold text-blue-600 hover:text-blue-700"
                      >
                        {posting.title}
                      </Link>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        posting.status === 'listed' ? 'bg-green-100 text-green-700' :
                        posting.status === 'sold' ? 'bg-blue-100 text-blue-700' :
                        posting.status === 'removed' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {formatStatus(posting.status)}
                      </span>
                    </div>
                    {posting.description && (
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {posting.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="text-blue-600 font-bold text-lg">
                          {formatPrice(posting.price)}
                        </span>
                        {posting.user && (
                          <span>
                            賣家：<Link
                              href={`/admin/users/${posting.user.u_id}`}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              {posting.user.username}
                            </Link>
                          </span>
                        )}
                        {posting.class && (
                          <span>分類：{posting.class.class_name}</span>
                        )}
                        {posting.course && (
                          <span>課程：{posting.course.course_code} - {posting.course.course_name}</span>
                        )}
                        <span>{formatDate(posting.created_at)}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          href={`/admin/postings/${posting.p_id}`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          詳情
                        </Link>
                        {posting.status !== 'removed' && (
                          <button
                            onClick={() => handleRemove(posting.p_id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            移除
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 分頁 */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center items-center space-x-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            上一頁
          </button>
          <span className="text-sm text-gray-600">
            第 {page} 頁，共 {totalPages} 頁（總計 {totalCount} 筆）
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            下一頁
          </button>
        </div>
      )}
    </div>
  );
}

