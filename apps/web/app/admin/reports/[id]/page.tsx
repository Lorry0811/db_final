'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { getClientSession } from '@/lib/auth/client-session';
import { formatDate, formatReportType, formatPrice } from '@/lib/utils/format';

interface ReportDetail {
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
    description: string;
    price: number;
    status: string;
    user?: {
      u_id: number;
      username: string;
      email: string;
    };
  } | null;
  comment?: {
    comment_id: number;
    content: string;
    u_id: number;
    user?: {
      u_id: number;
      username: string;
      email: string;
    };
  } | null;
  order?: {
    order_id: number;
    buyer_id: number;
    p_id: number;
    deal_price: number;
    order_date: string;
    buyer?: {
      u_id: number;
      username: string;
      email: string;
    };
  } | null;
  target_user?: {
    u_id: number;
    username: string;
    email: string;
  } | null;
  reviewer?: {
    u_id: number;
    username: string;
    email: string;
  } | null;
}

export default function AdminReportDetailPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = parseInt(params.id as string);
  
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [removePosting, setRemovePosting] = useState(false);

  useEffect(() => {
    const session = getClientSession();
    if (!session || !session.is_admin) {
      router.push('/admin');
      return;
    }

    if (isNaN(reportId)) {
      router.push('/admin/reports');
      return;
    }

    loadReport();
  }, [reportId, router]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/reports/${reportId}`);
      const result = await response.json();

      if (result.success) {
        setReport(result.data);
      } else {
        alert(result.error || '載入舉報詳情失敗');
        router.push('/admin/reports');
      }
    } catch (error) {
      console.error('載入舉報詳情失敗:', error);
      alert('載入舉報詳情失敗，請稍後再試');
      router.push('/admin/reports');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (status: 'approved' | 'rejected') => {
    const action = status === 'approved' ? '通過' : '駁回';
    const confirmMsg = status === 'approved' && removePosting && report?.report_type === 'posting'
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
          removePosting: status === 'approved' && removePosting,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message || `${action}成功`);
        loadReport();
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

  if (!report) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">找不到此舉報</h1>
          <Link href="/admin/reports" className="text-blue-600 hover:text-blue-700">
            返回舉報列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/admin/reports" className="text-blue-600 hover:text-blue-700">
          ← 返回舉報列表
        </Link>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">舉報詳情</h1>
        {report.status === 'pending' && (
          <div className="flex space-x-2">
            <button
              onClick={() => handleReview('rejected')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              駁回
            </button>
            <button
              onClick={() => handleReview('approved')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              通過
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        {/* 基本資訊 */}
        <div>
          <h2 className="text-xl font-semibold mb-4">基本資訊</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                舉報 ID
              </label>
              <p className="text-gray-900">{report.report_id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                舉報類型
              </label>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
                {formatReportType(report.report_type)}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                狀態
              </label>
              <span className={`px-2 py-1 rounded text-sm font-medium ${
                report.status === 'approved' ? 'bg-red-100 text-red-700' :
                report.status === 'rejected' ? 'bg-gray-100 text-gray-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {report.status === 'approved' ? '已通過' :
                 report.status === 'rejected' ? '已駁回' : '待審核'}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                建立時間
              </label>
              <p className="text-gray-900">{formatDate(report.created_at)}</p>
            </div>
            {report.reviewed_at && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    審核時間
                  </label>
                  <p className="text-gray-900">{formatDate(report.reviewed_at)}</p>
                </div>
                {report.reviewer && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      審核者
                    </label>
                    <p className="text-gray-900">{report.reviewer.username}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* 舉報者資訊 */}
        {report.reporter && (
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">舉報者資訊</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">使用者名稱：</span>
                <Link
                  href={`/admin/users/${report.reporter.u_id}`}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {report.reporter.username}
                </Link>
              </p>
              <p>
                <span className="font-medium">電子郵件：</span>
                {report.reporter.email}
              </p>
            </div>
          </div>
        )}

        {/* 目標資訊 */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">目標資訊</h2>
          {report.report_type === 'posting' && report.posting && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  刊登標題
                </label>
                <Link
                  href={`/admin/postings/${report.posting.p_id}`}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  {report.posting.title}
                </Link>
                {report.posting.status === 'removed' && (
                  <span className="ml-2 text-red-600 text-sm">（已移除）</span>
                )}
              </div>
              {report.posting.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    刊登描述
                  </label>
                  <p className="text-gray-700 whitespace-pre-wrap">{report.posting.description}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  價格
                </label>
                <p className="text-gray-900">{formatPrice(report.posting.price)}</p>
              </div>
              {report.posting.user && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    賣家
                  </label>
                  <Link
                    href={`/admin/users/${report.posting.user.u_id}`}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {report.posting.user.username}
                  </Link>
                </div>
              )}
              {report.status === 'pending' && (
                <div className="mt-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={removePosting}
                      onChange={(e) => setRemovePosting(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">
                      審核通過時同時移除此刊登
                    </span>
                  </label>
                </div>
              )}
            </div>
          )}

          {report.report_type === 'comment' && report.comment && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  留言內容
                </label>
                <p className="text-gray-700 whitespace-pre-wrap">{report.comment.content}</p>
              </div>
              {report.comment.user && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    留言者
                  </label>
                  <Link
                    href={`/admin/users/${report.comment.user.u_id}`}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {report.comment.user.username}
                  </Link>
                </div>
              )}
            </div>
          )}

          {report.report_type === 'order_violation' && (
            <div className="space-y-4">
              {report.order && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    訂單編號
                  </label>
                  <Link
                    href={`/admin/orders/${report.order.order_id}`}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    #{report.order.order_id}
                  </Link>
                </div>
              )}
              {report.target_user && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    被舉報使用者
                  </label>
                  <Link
                    href={`/admin/users/${report.target_user.u_id}`}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {report.target_user.username} ({report.target_user.email})
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 舉報原因 */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">舉報原因</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{report.reason}</p>
        </div>
      </div>
    </div>
  );
}

