'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDate, formatStatus, formatReportType } from '@/lib/utils/format';
import { getClientSession } from '@/lib/auth/client-session';

interface Report {
  report_id: number;
  report_type: 'posting' | 'comment' | 'order_violation';
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at: string | null;
  posting?: {
    p_id: number;
    title: string;
  };
  comment?: {
    comment_id: number;
    content: string;
  };
  order?: {
    order_id: number;
    deal_price: number;
  };
  target_user?: {
    u_id: number;
    username: string;
  };
}

export default function ReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<{
    reportType?: string;
    status?: string;
  }>({});

  useEffect(() => {
    const session = getClientSession();
    if (!session) {
      router.push('/login?redirect=/reports');
      return;
    }

    loadReports();
  }, [router, filter]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter.reportType) params.append('reportType', filter.reportType);
      if (filter.status) params.append('status', filter.status);

      const response = await fetch(`/api/reports?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setReports(result.data || []);
      } else {
        console.error('載入舉報失敗:', result.error);
        setReports([]);
      }
    } catch (error) {
      console.error('載入舉報失敗:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-red-100 text-red-800';
      case 'rejected':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">我的舉報紀錄</h1>

      {/* 篩選器 */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              舉報類型
            </label>
            <select
              value={filter.reportType || ''}
              onChange={(e) => setFilter({ ...filter, reportType: e.target.value || undefined })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部</option>
              <option value="posting">刊登舉報</option>
              <option value="comment">留言舉報</option>
              <option value="order_violation">逃單舉報</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              狀態
            </label>
            <select
              value={filter.status || ''}
              onChange={(e) => setFilter({ ...filter, status: e.target.value || undefined })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全部</option>
              <option value="pending">待審核</option>
              <option value="approved">已通過</option>
              <option value="rejected">已拒絕</option>
            </select>
          </div>
        </div>
      </div>

      {/* 舉報列表 */}
      {reports.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500 mb-4">還沒有任何舉報紀錄</p>
          <Link
            href="/postings"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            去瀏覽商品
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="divide-y">
            {reports.map((report) => (
              <div key={report.report_id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {formatReportType(report.report_type)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(report.status)}`}>
                        {formatStatus(report.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      舉報時間：{formatDate(report.created_at)}
                    </p>
                    {report.reviewed_at && (
                      <p className="text-sm text-gray-500">
                        審核時間：{formatDate(report.reviewed_at)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">舉報原因：</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{report.reason}</p>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  {report.report_type === 'posting' && report.posting && (
                    <p>
                      <span className="font-medium">被舉報刊登：</span>
                      <Link
                        href={`/postings/${report.posting.p_id}`}
                        className="text-blue-600 hover:text-blue-700 ml-1"
                      >
                        {report.posting.title}
                      </Link>
                    </p>
                  )}

                  {report.report_type === 'comment' && report.comment && (
                    <p>
                      <span className="font-medium">被舉報留言：</span>
                      <span className="ml-1">{report.comment.content.substring(0, 50)}...</span>
                    </p>
                  )}

                  {report.report_type === 'order_violation' && report.order && report.target_user && (
                    <>
                      <p>
                        <span className="font-medium">訂單編號：</span>
                        <Link
                          href={`/orders/${report.order.order_id}`}
                          className="text-blue-600 hover:text-blue-700 ml-1"
                        >
                          #{report.order.order_id}
                        </Link>
                      </p>
                      <p>
                        <span className="font-medium">被舉報使用者：</span>
                        <span className="ml-1">{report.target_user.username}</span>
                      </p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

