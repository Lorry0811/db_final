'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getClientSession } from '@/lib/auth/client-session';

interface PurchaseButtonProps {
  postingId: number;
  postingPrice: number;
  postingStatus: string;
  disabled?: boolean;
}

export default function PurchaseButton({
  postingId,
  postingPrice,
  postingStatus,
  disabled = false,
}: PurchaseButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    const session = getClientSession();
    if (!session) {
      router.push('/login?redirect=/postings/' + postingId);
      return;
    }

    if (postingStatus !== 'listed') {
      alert('此商品已無法購買');
      return;
    }

    if (!confirm(`確定要購買此商品嗎？價格：NT$ ${postingPrice.toLocaleString()}`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postingId }),
      });

      const result = await response.json();

      if (result.success) {
        // 觸發購買成功事件，通知其他組件更新狀態
        window.dispatchEvent(
          new CustomEvent('purchase-success', {
            detail: { postingId },
          })
        );
        
        alert('購買成功！');
        
        // 刷新當前頁面以更新商品狀態（從 listed 變為 sold）
        router.refresh();
        
        // 延遲跳轉，確保頁面已刷新
        setTimeout(() => {
          router.push(`/orders/${result.data.order_id || result.data.orderId}`);
        }, 100);
      } else {
        alert(result.error || '購買失敗');
      }
    } catch (error: any) {
      alert(error.message || '購買失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = disabled || loading || postingStatus !== 'listed';

  return (
    <button
      onClick={handlePurchase}
      disabled={isDisabled}
      className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? '處理中...' : postingStatus === 'listed' ? '購買' : '已售出'}
    </button>
  );
}

