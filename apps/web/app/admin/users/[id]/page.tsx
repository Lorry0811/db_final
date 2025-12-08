'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { getClientSession } from '@/lib/auth/client-session';
import { formatPrice, formatDate, formatStatus } from '@/lib/utils/format';

interface UserDetail {
  user: {
    u_id: number;
    username: string;
    email: string;
    balance: number;
    is_admin: boolean;
    is_blocked: boolean;
    violation_count: number;
    created_at: string;
  };
  statistics: {
    total_posts: number;
    sold_posts: number;
    total_orders_as_buyer?: number;
    average_rating?: number;
    review_count?: number;
  };
  postings: Array<{
    p_id: number;
    title: string;
    price: number;
    status: string;
    created_at: string;
  }>;
  reports: Array<{
    report_id: number;
    report_type: string;
    reason: string;
    status: string;
    created_at: string;
    reporter?: { username: string; email: string };
    posting?: { title: string };
  }>;
}

export default function AdminUserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = parseInt(params.id as string);
  
  const [loading, setLoading] = useState(true);
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'postings' | 'reports'>('info');

  useEffect(() => {
    const session = getClientSession();
    if (!session || !session.is_admin) {
      router.push('/admin');
      return;
    }

    if (isNaN(userId)) {
      router.push('/admin/users');
      return;
    }

    loadUserDetail();
  }, [userId, router]);

  const loadUserDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${userId}`);
      const result = await response.json();

      if (result.success) {
        setUserDetail(result.data);
      } else {
        alert(result.error || '載入使用者詳情失敗');
        router.push('/admin/users');
      }
    } catch (error) {
      console.error('載入使用者詳情失敗:', error);
      alert('載入使用者詳情失敗，請稍後再試');
      router.push('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockToggle = async () => {
    if (!userDetail) return;

    const action = userDetail.user.is_blocked ? '解封' : '封鎖';
    if (!confirm(`確定要${action}此使用者嗎？`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_blocked: !userDetail.user.is_blocked,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message || `${action}成功`);
        loadUserDetail();
      } else {
        alert(result.error || `${action}失敗`);
      }
    } catch (error) {
      console.error(`${action}失敗:`, error);
      alert(`${action}失敗，請稍後再試`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">載入中...</div>
      </div>
    );
  }

  if (!userDetail) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">找不到此使用者</h1>
          <Link href="/admin/users" className="text-blue-600 hover:text-blue-700">
            返回使用者列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/admin/users" className="text-blue-600 hover:text-blue-700">
          ← 返回使用者列表
        </Link>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          使用者詳情 - {userDetail.user.username}
        </h1>
        <button
          onClick={handleBlockToggle}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            userDetail.user.is_blocked
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          {userDetail.user.is_blocked ? '解封使用者' : '封鎖使用者'}
        </button>
      </div>

      {/* 標籤頁 */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'info'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            基本資訊
          </button>
          <button
            onClick={() => setActiveTab('postings')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'postings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            刊登紀錄 ({userDetail.postings.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reports'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            違規紀錄 ({userDetail.reports.length})
          </button>
        </nav>
      </div>

      {/* 標籤頁內容 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {activeTab === 'info' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  使用者 ID
                </label>
                <p className="text-gray-900">{userDetail.user.u_id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  使用者名稱
                </label>
                <p className="text-gray-900">{userDetail.user.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  電子郵件
                </label>
                <p className="text-gray-900">{userDetail.user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  帳戶餘額
                </label>
                <p className="text-gray-900">{formatPrice(userDetail.user.balance)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  違規次數
                </label>
                <p className={`text-gray-900 ${userDetail.user.violation_count > 0 ? 'text-red-600 font-semibold' : ''}`}>
                  {userDetail.user.violation_count}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  狀態
                </label>
                <div className="flex items-center space-x-2">
                  {userDetail.user.is_blocked ? (
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm font-medium">
                      已封鎖
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-medium">
                      正常
                    </span>
                  )}
                  {userDetail.user.is_admin && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm font-medium">
                      管理員
                    </span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  註冊時間
                </label>
                <p className="text-gray-900">{formatDate(userDetail.user.created_at)}</p>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">統計資訊</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">總刊登數</p>
                  <p className="text-2xl font-bold text-gray-900">{userDetail.statistics.total_posts}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">已售出</p>
                  <p className="text-2xl font-bold text-green-600">{userDetail.statistics.sold_posts}</p>
                </div>
                {userDetail.statistics.total_orders_as_buyer !== undefined && (
                  <div>
                    <p className="text-sm text-gray-600">購買訂單</p>
                    <p className="text-2xl font-bold text-blue-600">{userDetail.statistics.total_orders_as_buyer}</p>
                  </div>
                )}
                {userDetail.statistics.average_rating !== undefined && userDetail.statistics.average_rating > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">平均評分</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {userDetail.statistics.average_rating.toFixed(1)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'postings' && (
          <div>
            {userDetail.postings.length === 0 ? (
              <p className="text-center text-gray-500 py-8">此使用者尚無刊登紀錄</p>
            ) : (
              <div className="space-y-4">
                {userDetail.postings.map((posting) => (
                  <div
                    key={posting.p_id}
                    className="border rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <Link
                          href={`/admin/postings/${posting.p_id}`}
                          className="text-lg font-semibold text-blue-600 hover:text-blue-700"
                        >
                          {posting.title}
                        </Link>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                          <span>{formatPrice(posting.price)}</span>
                          <span className={`px-2 py-1 rounded ${
                            posting.status === 'listed' ? 'bg-green-100 text-green-700' :
                            posting.status === 'sold' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {formatStatus(posting.status)}
                          </span>
                          <span>{formatDate(posting.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            {userDetail.reports.length === 0 ? (
              <p className="text-center text-gray-500 py-8">此使用者尚無違規紀錄</p>
            ) : (
              <div className="space-y-4">
                {userDetail.reports.map((report) => (
                  <div
                    key={report.report_id}
                    className="border rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          report.status === 'approved' ? 'bg-red-100 text-red-700' :
                          report.status === 'rejected' ? 'bg-gray-100 text-gray-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {report.status === 'approved' ? '已通過' :
                           report.status === 'rejected' ? '已駁回' : '待審核'}
                        </span>
                        <span className="ml-2 text-sm text-gray-600">
                          {report.report_type === 'posting' ? '不當刊登' :
                           report.report_type === 'comment' ? '不當留言' :
                           report.report_type === 'order_violation' ? '逃單舉報' : report.report_type}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(report.created_at)}
                      </span>
                    </div>
                    {report.posting && (
                      <p className="text-sm text-gray-600 mb-2">
                        目標：{report.posting.title}
                      </p>
                    )}
                    {report.reporter && (
                      <p className="text-sm text-gray-600 mb-2">
                        舉報者：{report.reporter.username} ({report.reporter.email})
                      </p>
                    )}
                    <p className="text-gray-700">{report.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

