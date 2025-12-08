'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getClientSession } from '@/lib/auth/client-session';

interface SendMessageButtonProps {
  receiverId: number;
  receiverUsername?: string;
  postingId?: number;
  postingTitle?: string;
}

export default function SendMessageButton({
  receiverId,
  receiverUsername,
  postingId,
  postingTitle,
}: SendMessageButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    const session = getClientSession();
    if (!session) {
      router.push('/login?redirect=/postings/' + postingId);
      return;
    }

    if (session.u_id === receiverId) {
      alert('不能發送私訊給自己');
      return;
    }

    setLoading(true);
    try {
      // 如果有商品資訊，在訊息中加入商品連結
      let initialContent = '';
      if (postingId && postingTitle) {
        initialContent = `您好，我對您的商品「${postingTitle}」有興趣，想了解更多資訊。`;
      } else {
        initialContent = `您好，想與您聯繫。`;
      }

      // 導向對話頁面，並在 URL 中傳遞初始訊息（可選）
      router.push(`/messages/${receiverId}?initialContent=${encodeURIComponent(initialContent)}`);
    } catch (error) {
      console.error('發送私訊失敗:', error);
      alert('發送私訊失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? '處理中...' : '發送私訊'}
    </button>
  );
}

