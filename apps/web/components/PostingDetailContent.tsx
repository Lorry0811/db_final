'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatPrice, formatDate, formatStatus } from '@/lib/utils/format';
import { getClientSession } from '@/lib/auth/client-session';
import PostingActions from '@/components/PostingActions';
import FavoriteButton from '@/components/FavoriteButton';
import CommentSection from '@/components/CommentSection';
import PurchaseButton from '@/components/PurchaseButton';
import SendMessageButton from '@/components/SendMessageButton';
import ReportButton from '@/components/ReportButton';

interface PostingDetailContentProps {
  initialPosting: any;
  currentUserId: number | null;
}

export default function PostingDetailContent({
  initialPosting,
  currentUserId,
}: PostingDetailContentProps) {
  const [posting, setPosting] = useState(initialPosting);
  const [isOwner, setIsOwner] = useState(
    currentUserId && initialPosting && initialPosting.u_id === currentUserId
  );

  // 定期從服務器獲取最新狀態（用於處理其他用戶購買的情況）
  useEffect(() => {
    const fetchLatestStatus = async () => {
      try {
        const response = await fetch(`/api/postings/${posting.p_id}`);
        const result = await response.json();
        if (result.success && result.data) {
          setPosting(result.data);
        }
      } catch (error) {
        console.error('獲取商品狀態失敗:', error);
      }
    };

    // 每 3 秒檢查一次狀態（如果商品還是 listed 狀態）
    const interval = setInterval(() => {
      if (posting.status === 'listed') {
        fetchLatestStatus();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [posting.p_id, posting.status]);

  // 監聽購買成功事件，更新商品狀態
  useEffect(() => {
    const handlePurchaseSuccess = (event: CustomEvent) => {
      const { postingId } = event.detail;
      if (postingId === posting.p_id) {
        // 更新商品狀態為 'sold'
        setPosting((prev: any) => ({
          ...prev,
          status: 'sold',
        }));
        // 立即從服務器獲取最新狀態確認
        fetch(`/api/postings/${postingId}`)
          .then(res => res.json())
          .then(result => {
            if (result.success && result.data) {
              setPosting(result.data);
            }
          })
          .catch(console.error);
      }
    };

    window.addEventListener('purchase-success', handlePurchaseSuccess as EventListener);

    return () => {
      window.removeEventListener('purchase-success', handlePurchaseSuccess as EventListener);
    };
  }, [posting.p_id]);

  // 獲取第一張圖片 URL
  const getImageUrl = () => {
    if (posting.images && posting.images.length > 0) {
      return posting.images[0].image_url;
    }
    return posting.image_url || null;
  };

  const imageUrl = getImageUrl();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左側：圖片 */}
        <div>
          <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center mb-4">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={posting.title}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <span className="text-gray-400">無圖片</span>
            )}
          </div>
          
          {/* 多張圖片（如果有） */}
          {posting.images && posting.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {posting.images.slice(1).map((image: any) => (
                <div
                  key={image.image_id}
                  className="bg-gray-200 rounded-lg h-20 flex items-center justify-center"
                >
                  <img
                    src={image.image_url}
                    alt={posting.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 右側：商品資訊 */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {posting.title}
          </h1>
          
          <div className="mb-6">
            <p className="text-4xl font-bold text-blue-600 mb-4">
              {formatPrice(posting.price)}
            </p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm ${
              posting.status === 'sold' 
                ? 'bg-red-100 text-red-800' 
                : posting.status === 'listed'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {formatStatus(posting.status)}
            </span>
          </div>

          <div className="border-t border-b py-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">商品資訊</h2>
            <div className="space-y-2 text-gray-700">
              <p>
                <span className="font-medium">分類：</span>
                {posting.class?.class_name || '未分類'}
              </p>
              {posting.course && (
                <p>
                  <span className="font-medium">課程：</span>
                  {posting.course.course_name} ({posting.course.course_code})
                </p>
              )}
              <p>
                <span className="font-medium">刊登時間：</span>
                {formatDate(posting.created_at)}
              </p>
              <p>
                <span className="font-medium">賣家：</span>
                {posting.user?.username || '未知'}
                {posting.user?.u_id && (
                  <Link
                    href={`/users/${posting.user.u_id}/reviews`}
                    className="ml-2 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    查看評價
                  </Link>
                )}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">商品描述</h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {posting.description || '無描述'}
            </p>
          </div>

          <div className="flex space-x-4">
            {isOwner ? (
              <>
                <Link
                  href={`/postings/${posting.p_id}/edit`}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
                >
                  編輯刊登
                </Link>
                <PostingActions postingId={posting.p_id} />
              </>
            ) : (
              <>
                <PurchaseButton
                  postingId={posting.p_id}
                  postingPrice={posting.price}
                  postingStatus={posting.status}
                />
                <FavoriteButton postingId={posting.p_id} />
                <SendMessageButton
                  receiverId={posting.u_id}
                  receiverUsername={posting.user?.username}
                  postingId={posting.p_id}
                  postingTitle={posting.title}
                />
                <ReportButton
                  reportType="posting"
                  targetId={posting.p_id}
                  targetTitle={posting.title}
                  buttonText="舉報"
                  buttonClassName="px-4 py-2 border-2 border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* 留言區 */}
      <CommentSection postingId={posting.p_id} currentUserId={currentUserId} />
    </div>
  );
}

