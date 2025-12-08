'use client';

import { useState, useEffect } from 'react';
import { getClientSession } from '@/lib/auth/client-session';
import { useRouter } from 'next/navigation';

interface FavoriteButtonProps {
  postingId: number;
  initialIsFavorited?: boolean;
}

export default function FavoriteButton({
  postingId,
  initialIsFavorited = false,
}: FavoriteButtonProps) {
  const router = useRouter();
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const session = getClientSession();
    setIsAuthenticated(!!session);

    // 如果已登入，檢查收藏狀態
    if (session) {
      checkFavoriteStatus();
    }
  }, [postingId]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch(`/api/favorites/check?postingId=${postingId}`);
      const result = await response.json();

      if (result.success) {
        setIsFavorited(result.data.isFavorited);
      }
    } catch (error) {
      console.error('檢查收藏狀態失敗:', error);
    }
  };

  const handleToggleFavorite = async () => {
    const session = getClientSession();
    if (!session) {
      router.push('/login?redirect=/postings/' + postingId);
      return;
    }

    setLoading(true);
    try {
      if (isFavorited) {
        // 取消收藏
        const response = await fetch(`/api/favorites?postingId=${postingId}`, {
          method: 'DELETE',
        });
        const result = await response.json();

        if (result.success) {
          setIsFavorited(false);
        } else {
          alert(result.error || '取消收藏失敗');
        }
      } else {
        // 新增收藏
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ postingId }),
        });
        const result = await response.json();

        if (result.success) {
          setIsFavorited(true);
        } else {
          alert(result.error || '收藏失敗');
        }
      }
    } catch (error) {
      alert('操作失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={loading || !isAuthenticated}
      className={`px-6 py-3 border-2 rounded-lg font-medium transition-colors ${
        isFavorited
          ? 'border-red-600 bg-red-50 text-red-600 hover:bg-red-100'
          : 'border-blue-600 text-blue-600 hover:bg-blue-50'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading ? (
        '處理中...'
      ) : isFavorited ? (
        <>
          <span className="mr-1">❤️</span>
          已收藏
        </>
      ) : (
        <>
          <span className="mr-1">🤍</span>
          收藏
        </>
      )}
    </button>
  );
}

