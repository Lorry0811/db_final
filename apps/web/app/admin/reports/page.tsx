'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getClientSession } from '@/lib/auth/client-session';
import { formatDate, formatReportType } from '@/lib/utils/format';

interface Report {
  report_id: number;
  report_type: string;
  reason: string;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  reporter?: {
    u_id: number;
    username: string;
    email: string;
  };
  posting?: {
    p_id: number;
    title: string;
    status: string;
  } | null;
  comment?: {
    comment_id: number;
    content: string;
  } | null;
  order?: {
    order_id: number;
    deal_price: number;
  } | null;
  target_user?: {
    u_id: number;
    username: string;
    email: string;
  } | null;
  reviewer?: {
    u_id: number;
    username: string;
  } | null;
}

export default function AdminReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 20;

  useEffect(() => {
    const session = getClientSession();
    if (!session || !session.is_admin) {
      router.push('/admin');
      return;
    }

    loadReports();
  }, [router, page, statusFilter, typeFilter]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (typeFilter !== 'all') {
        params.append('reportType', typeFilter);
      }

      const response = await fetch(`/api/admin/reports?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setReports(result.data || []);
        setTotalCount(result.count || 0);
      } else {
        alert(result.error || '載入舉報失敗');
      }
    } catch (error) {
      console.error('載入舉報失敗:', error);
      alert('載入舉報失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (reportId: number, status: 'approved' | 'rejected', removePosting: boolean = false) => {
    const action = status === 'approved' ? '通過' : '駁回';
    const confirmMsg = status === 'approved' && removePosting
      ? `確定要${action}此舉報並移除相關刊登嗎？`
      : `確定要${action}此舉報嗎？`;

    if (!confirm(confirmMsg)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          removePosting,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message || `${action}成功`);
        loadReports();
      } else {
        alert(result.error || `${action}失敗`);
      }
    } catch (error) {
      console.error(`${action}失敗:`, error);
      alert(`${action}失敗，請稍後再試`);
    }
  };

  if (loading && reports.length === 0) {
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

      <h1 className="text-3xl font-bold text-gray-900 mb-8">舉報審核</h1>

      {/* 篩選 */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">全部狀態</option>
            <option value="pending">待審核</option>
            <option value="approved">已通過</option>
            <option value="rejected">已駁回</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">全部類型</option>
            <option value="posting">不當刊登</option>
            <option value="comment">不當留言</option>
            <option value="order_violation">逃單舉報</option>
          </select>
        </div>
      </div>

      {/* 舉報列表 */}
      <div className="space-y-4">
        {reports.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
            尚無舉報資料
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report.report_id}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      report.status === 'approved' ? 'bg-red-100 text-red-700' :
                      report.status === 'rejected' ? 'bg-gray-100 text-gray-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {report.status === 'approved' ? '已通過' :
                       report.status === 'rejected' ? '已駁回' : '待審核'}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      {formatReportType(report.report_type)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(report.created_at)}
                    </span>
                  </div>
                  <Link
                    href={`/admin/reports/${report.report_id}`}
                    className="text-lg font-semibold text-blue-600 hover:text-blue-700"
                  >
                    查看詳情
                  </Link>
                </div>
                {report.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        const removePosting = report.report_type === 'posting' && report.posting
                          ? confirm('是否同時移除相關刊登？')
                          : false;
                        handleReview(report.report_id, 'approved', removePosting);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                    >
                      通過
                    </button>
                    <button
                      onClick={() => handleReview(report.report_id, 'rejected', false)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                    >
                      駁回
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-sm">
                {report.reporter && (
                  <p>
                    <span className="font-medium">舉報者：</span>
                    {report.reporter.username} ({report.reporter.email})
                  </p>
                )}
                {report.report_type === 'posting' && report.posting && (
                  <p>
                    <span className="font-medium">目標刊登：</span>
                    <Link
                      href={`/admin/postings/${report.posting.p_id}`}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {report.posting.title}
                    </Link>
                    {report.posting.status === 'removed' && (
                      <span className="ml-2 text-red-600 text-xs">（已移除）</span>
                    )}
                  </p>
                )}
                {report.report_type === 'comment' && report.comment && (
                  <p>
                    <span className="font-medium">目標留言：</span>
                    <span className="text-gray-700">{report.comment.content.substring(0, 100)}...</span>
                  </p>
                )}
                {report.report_type === 'order_violation' && report.target_user && (
                  <p>
                    <span className="font-medium">目標使用者：</span>
                    <Link
                      href={`/admin/users/${report.target_user.u_id}`}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {report.target_user.username}
                    </Link>
                  </p>
                )}
                <p>
                  <span className="font-medium">舉報原因：</span>
                  <span className="text-gray-700">{report.reason}</span>
                </p>
                {report.reviewer && (
                  <p>
                    <span className="font-medium">審核者：</span>
                    {report.reviewer.username} ({formatDate(report.reviewed_at || '')})
                  </p>
                )}
              </div>
            </div>
          ))
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

