'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getClientSession } from '@/lib/auth/client-session';
import { formatPrice, formatDate } from '@/lib/utils/format';

interface PlatformStats {
  total_users: number;
  total_postings: number;
  active_postings: number;
  sold_postings: number;
  total_orders: number;
  total_transactions: number;
  total_revenue: number;
  total_reports: number;
  pending_reports: number;
}

interface ClassStats {
  class_id: number;
  class_name: string;
  total_postings: number;
  active_postings: number;
  sold_postings: number;
  unique_sellers: number;
  total_revenue: number;
}

interface CourseStats {
  course_id: number;
  course_code: string;
  course_name: string;
  dept_name: string | null;
  class_name: string | null;
  total_postings: number;
  active_postings: number;
  sold_postings: number;
  average_price: number;
  min_price: number | null;
  max_price: number | null;
}

interface TransactionStats {
  recent_transactions: Array<{
    amount: number;
    trans_type: string;
    trans_time: string;
  }>;
  statistics: {
    top_up: { count: number; total: number };
    payment: { count: number; total: number };
    income: { count: number; total: number };
    refund: { count: number; total: number };
  };
}

export default function AdminStatisticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'platform' | 'class' | 'course' | 'transaction'>('platform');
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [classStats, setClassStats] = useState<ClassStats[]>([]);
  const [courseStats, setCourseStats] = useState<CourseStats[]>([]);
  const [transactionStats, setTransactionStats] = useState<TransactionStats | null>(null);

  useEffect(() => {
    const session = getClientSession();
    if (!session || !session.is_admin) {
      router.push('/admin');
      return;
    }

    loadStatistics();
  }, [router, activeTab]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/statistics?type=${activeTab}`);
      const result = await response.json();

      if (result.success) {
        if (activeTab === 'platform') {
          setPlatformStats(result.data);
        } else if (activeTab === 'class') {
          setClassStats(result.data);
        } else if (activeTab === 'course') {
          setCourseStats(result.data);
        } else if (activeTab === 'transaction') {
          setTransactionStats(result.data);
        }
      } else {
        alert(result.error || '載入統計失敗');
      }
    } catch (error) {
      console.error('載入統計失敗:', error);
      alert('載入統計失敗，請稍後再試');
    } finally {
      setLoading(false);
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
      <div className="mb-6">
        <Link href="/admin" className="text-blue-600 hover:text-blue-700">
          ← 返回管理後台
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">統計報表</h1>

      {/* 標籤頁 */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('platform')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'platform'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            平台統計
          </button>
          <button
            onClick={() => setActiveTab('class')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'class'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            分類統計
          </button>
          <button
            onClick={() => setActiveTab('course')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'course'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            課程統計
          </button>
          <button
            onClick={() => setActiveTab('transaction')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'transaction'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            交易統計
          </button>
        </nav>
      </div>

      {/* 標籤頁內容 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {activeTab === 'platform' && platformStats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">總使用者數</p>
              <p className="text-3xl font-bold text-blue-600">{platformStats.total_users}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">總刊登數</p>
              <p className="text-3xl font-bold text-green-600">{platformStats.total_postings}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">進行中刊登</p>
              <p className="text-3xl font-bold text-yellow-600">{platformStats.active_postings}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">已售出</p>
              <p className="text-3xl font-bold text-purple-600">{platformStats.sold_postings}</p>
            </div>
            <div className="bg-indigo-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">總訂單數</p>
              <p className="text-3xl font-bold text-indigo-600">{platformStats.total_orders}</p>
            </div>
            <div className="bg-pink-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">總交易數</p>
              <p className="text-3xl font-bold text-pink-600">{platformStats.total_transactions}</p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">總收入</p>
              <p className="text-2xl font-bold text-emerald-600">
                {formatPrice(platformStats.total_revenue)}
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">待審核舉報</p>
              <p className="text-3xl font-bold text-red-600">{platformStats.pending_reports}</p>
            </div>
          </div>
        )}

        {activeTab === 'class' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    分類名稱
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    總刊登數
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    進行中
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    已售出
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    賣家數
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    總收入
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {classStats.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      尚無分類統計資料
                    </td>
                  </tr>
                ) : (
                  classStats.map((stat) => (
                    <tr key={stat.class_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {stat.class_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stat.total_postings}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stat.active_postings}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stat.sold_postings}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stat.unique_sellers}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        {formatPrice(stat.total_revenue)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'course' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    課程代碼
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    課程名稱
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    科系
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    總刊登數
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    進行中
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    已售出
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    平均價格
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    價格範圍
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courseStats.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      尚無課程統計資料
                    </td>
                  </tr>
                ) : (
                  courseStats.map((stat) => (
                    <tr key={stat.course_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {stat.course_code}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {stat.course_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stat.dept_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stat.total_postings}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stat.active_postings}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stat.sold_postings}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                        {formatPrice(Math.round(stat.average_price))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stat.min_price !== null && stat.max_price !== null
                          ? `${formatPrice(stat.min_price)} - ${formatPrice(stat.max_price)}`
                          : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'transaction' && transactionStats && (
          <div className="space-y-6">
            {/* 交易類型統計 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">交易類型統計</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">儲值</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatPrice(transactionStats.statistics.top_up.total)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {transactionStats.statistics.top_up.count} 筆
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">付款</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatPrice(transactionStats.statistics.payment.total)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {transactionStats.statistics.payment.count} 筆
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">收入</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatPrice(transactionStats.statistics.income.total)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {transactionStats.statistics.income.count} 筆
                  </p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">退款</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {formatPrice(transactionStats.statistics.refund.total)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {transactionStats.statistics.refund.count} 筆
                  </p>
                </div>
              </div>
            </div>

            {/* 最近交易 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">最近交易（最近 100 筆）</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        時間
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        類型
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        金額
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactionStats.recent_transactions.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                          尚無交易紀錄
                        </td>
                      </tr>
                    ) : (
                      transactionStats.recent_transactions.map((transaction, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(transaction.trans_time)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              transaction.trans_type === 'top_up' ? 'bg-blue-100 text-blue-700' :
                              transaction.trans_type === 'payment' ? 'bg-red-100 text-red-700' :
                              transaction.trans_type === 'income' ? 'bg-green-100 text-green-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {transaction.trans_type === 'top_up' ? '儲值' :
                               transaction.trans_type === 'payment' ? '付款' :
                               transaction.trans_type === 'income' ? '收入' : '退款'}
                            </span>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                            transaction.trans_type === 'income' || transaction.trans_type === 'top_up'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}>
                            {transaction.trans_type === 'payment' || transaction.trans_type === 'refund'
                              ? '-'
                              : '+'}
                            {formatPrice(Math.abs(transaction.amount))}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

