'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PostingActionsProps {
  postingId: number;
}

export default function PostingActions({ postingId }: PostingActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/postings/${postingId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        router.push('/dashboard');
        router.refresh();
      } else {
        alert(result.error || '下架失敗');
        setShowConfirm(false);
      }
    } catch (error) {
      alert('下架失敗，請稍後再試');
      setShowConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {showConfirm ? (
        <div className="flex space-x-2">
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? '下架中...' : '確認'}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
        </div>
      ) : (
        <button
          onClick={handleDelete}
          className="text-red-600 hover:text-red-700 text-sm font-medium"
        >
          下架
        </button>
      )}
    </div>
  );
}

