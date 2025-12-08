'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatPrice, formatDate, formatStatus } from '@/lib/utils/format';
import { getClientSession } from '@/lib/auth/client-session';
import PostingActions from '@/components/PostingActions';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [myPostings, setMyPostings] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    // 檢查是否已登入
    const session = getClientSession();
    if (!session) {
      router.push('/login?redirect=/dashboard');
      return;
    }
    
    const currentUserId = session.u_id;
    setUserId(currentUserId);

    // 載入刊登資料
    const loadPostings = async () => {
      try {
        setLoading(true);
        const status = statusFilter === 'all' ? undefined : statusFilter;
        const response = await fetch(`/api/postings?userId=${currentUserId}${status ? `&status=${status}` : ''}`);
        const result = await response.json();

        if (result.success) {
          setMyPostings(result.data || []);
        } else {
          console.error('載入刊登失敗:', result.error);
          setMyPostings([]);
        }
      } catch (error) {
        console.error('載入刊登失敗:', error);
        setMyPostings([]);
      } finally {
        setLoading(false);
      }
    };

    loadPostings();
    loadBalance();
  }, [router, statusFilter]);

  const loadBalance = async () => {
    try {
      const response = await fetch('/api/users/balance');
      const result = await response.json();

      if (result.success) {
        setBalance(result.data.balance);
      }
    } catch (error) {
      console.error('載入餘額失敗:', error);
    }
  };

  // 分類統計
  const listedCount = myPostings.filter((p: any) => p.status === 'listed').length;
  const soldCount = myPostings.filter((p: any) => p.status === 'sold').length;
  const removedCount = myPostings.filter((p: any) => p.status === 'removed').length;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">載入中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">我的儀表板</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左側：統計卡片 */}
        <div className="lg:col-span-1 space-y-4">
          {/* 餘額顯示 */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm p-6 text-white">
            <h2 className="text-lg font-semibold mb-2">帳戶餘額</h2>
            <p className="text-3xl font-bold">
              {balance !== null ? formatPrice(balance) : '載入中...'}
            </p>
            <Link
              href="/topup"
              className="mt-4 block w-full bg-white text-blue-600 px-4 py-2 rounded-lg text-center font-medium hover:bg-blue-50 transition-colors"
            >
              儲值
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h2>
            <div className="space-y-2">
              <Link
                href="/postings/new"
                className="block w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-center hover:bg-blue-700 transition-colors"
              >
                刊登新商品
              </Link>
              <Link
                href="/favorites"
                className="block w-full border-2 border-blue-600 text-blue-600 px-4 py-2 rounded-lg text-center hover:bg-blue-50 transition-colors"
              >
                我的收藏
              </Link>
              <Link
                href="/orders"
                className="block w-full border-2 border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-center hover:bg-gray-50 transition-colors"
              >
                我的訂單
              </Link>
              <Link
                href="/topup"
                className="block w-full border-2 border-green-600 text-green-600 px-4 py-2 rounded-lg text-center hover:bg-green-50 transition-colors"
              >
                儲值
              </Link>
              <Link
                href="/transactions"
                className="block w-full border-2 border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-center hover:bg-gray-50 transition-colors"
              >
                交易紀錄
              </Link>
            </div>
          </div>

          {/* 統計資訊 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">刊登統計</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">刊登中</span>
                <span className="font-semibold text-blue-600">{listedCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">已售出</span>
                <span className="font-semibold text-green-600">{soldCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">已下架</span>
                <span className="font-semibold text-gray-600">{removedCount}</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="text-gray-900 font-medium">總計</span>
                <span className="font-semibold text-gray-900">{myPostings.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 右側：我的刊登 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">我的刊登</h2>
              <div className="flex items-center space-x-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">全部狀態</option>
                  <option value="listed">刊登中</option>
                  <option value="sold">已售出</option>
                  <option value="removed">已下架</option>
                </select>
                <Link
                  href="/postings/new"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  + 新增刊登
                </Link>
              </div>
            </div>

            {myPostings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  {statusFilter === 'all' 
                    ? '還沒有刊登任何商品' 
                    : `沒有${statusFilter === 'listed' ? '刊登中' : statusFilter === 'sold' ? '已售出' : '已下架'}的商品`}
                </p>
                <Link
                  href="/postings/new"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  立即刊登
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myPostings.map((posting: any) => (
                  <div
                    key={posting.p_id}
                    className="block border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start space-x-4">
                      <Link
                        href={`/postings/${posting.p_id}`}
                        className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center"
                      >
                        {posting.image_url ? (
                          <img
                            src={posting.image_url}
                            alt={posting.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-gray-400 text-xs">無圖片</span>
                        )}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/postings/${posting.p_id}`}>
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-blue-600">
                            {posting.title}
                          </h3>
                        </Link>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-blue-600 font-bold text-xl">
                            {formatPrice(posting.price)}
                          </p>
                          <span className="text-sm text-gray-500">
                            {formatDate(posting.created_at)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {formatStatus(posting.status)}
                          </span>
                          <div className="flex space-x-2">
                            <Link
                              href={`/postings/${posting.p_id}/edit`}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              編輯
                            </Link>
                            <PostingActions postingId={posting.p_id} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
