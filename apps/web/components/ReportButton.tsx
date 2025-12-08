'use client';

import { useState } from 'react';
import { getClientSession } from '@/lib/auth/client-session';
import { useRouter } from 'next/navigation';

interface ReportButtonProps {
  reportType: 'posting' | 'comment' | 'order_violation';
  targetId: number;
  targetUserId?: number; // 用於逃單舉報
  targetTitle?: string; // 用於顯示在表單中
  buttonText?: string;
  buttonClassName?: string;
}

export default function ReportButton({
  reportType,
  targetId,
  targetUserId,
  targetTitle,
  buttonText,
  buttonClassName,
}: ReportButtonProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleOpenModal = () => {
    const session = getClientSession();
    if (!session) {
      router.push('/login');
      return;
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setReason('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      alert('請輸入舉報原因');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportType,
          targetId,
          targetUserId,
          reason: reason.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message || '舉報成功，管理員將盡快處理');
        handleCloseModal();
      } else {
        alert(result.error || '舉報失敗');
      }
    } catch (error: any) {
      alert(error.message || '舉報失敗，請稍後再試');
    } finally {
      setSubmitting(false);
    }
  };

  const getReportTypeLabel = () => {
    switch (reportType) {
      case 'posting':
        return '刊登';
      case 'comment':
        return '留言';
      case 'order_violation':
        return '逃單';
      default:
        return '內容';
    }
  };

  return (
    <>
      <button
        onClick={handleOpenModal}
        className={buttonClassName || 'text-red-600 hover:text-red-700 text-sm font-medium'}
      >
        {buttonText || '舉報'}
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              舉報{getReportTypeLabel()}
            </h2>

            {targetTitle && (
              <p className="text-sm text-gray-600 mb-4">
                目標：{targetTitle}
              </p>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  舉報原因
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="請詳細說明舉報原因..."
                  rows={5}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                  disabled={submitting}
                />
              </div>

              {reportType === 'order_violation' && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>注意：</strong>逃單舉報適用於以下情況：
                  </p>
                  <ul className="text-sm text-yellow-700 mt-2 list-disc list-inside">
                    <li>賣家未在約定時間內寄送商品</li>
                    <li>買家未在約定時間內付款</li>
                  </ul>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={submitting || !reason.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? '提交中...' : '提交舉報'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

