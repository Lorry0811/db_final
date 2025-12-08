'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { formatPrice, formatDate, formatStatus } from '@/lib/utils/format';
import { getClientSession } from '@/lib/auth/client-session';
import ReportButton from '@/components/ReportButton';
import ReviewForm from '@/components/ReviewForm';

interface OrderDetail {
  order_id: number;
  buyer_id: number;
  p_id: number;
  deal_price: number;
  status: string;
  order_date: string;
  posting?: {
    p_id: number;
    title: string;
    price: number;
    description: string;
    image_url: string | null;
    status: string;
    u_id: number;
    user?: {
      u_id: number;
      username: string;
      email: string;
    };
  };
  buyer?: {
    u_id: number;
    username: string;
    email: string;
  };
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = parseInt(params.id as string);
  
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [existingReview, setExistingReview] = useState<any>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [loadingReview, setLoadingReview] = useState(true);

  useEffect(() => {
    const session = getClientSession();
    if (!session) {
      router.push('/login?redirect=/orders/' + orderId);
      return;
    }

    loadOrder();
    loadReview();
  }, [orderId, router]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${orderId}`);
      const result = await response.json();

      if (result.success) {
        setOrder(result.data);
      } else {
        alert(result.error || '載入訂單失敗');
        router.push('/orders');
      }
    } catch (error) {
      console.error('載入訂單失敗:', error);
      alert('載入訂單失敗，請稍後再試');
      router.push('/orders');
    } finally {
      setLoading(false);
    }
  };

  const loadReview = async () => {
    try {
      setLoadingReview(true);
      const response = await fetch(`/api/reviews?orderId=${orderId}`);
      const result = await response.json();

      if (result.success && result.data && result.data.length > 0) {
        setExistingReview(result.data[0]);
      } else {
        setExistingReview(null);
      }
    } catch (error) {
      console.error('載入評價失敗:', error);
    } finally {
      setLoadingReview(false);
    }
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId,
        rating,
        comment,
      }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || '評價失敗');
    }

    // 重新載入評價
    await loadReview();
    setShowReviewForm(false);
    alert('評價成功！');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">載入中...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">找不到此訂單</h1>
          <Link href="/orders" className="text-blue-600 hover:text-blue-700">
            返回訂單列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/orders" className="text-blue-600 hover:text-blue-700">
          ← 返回訂單列表
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">訂單詳情</h1>

      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        {/* 訂單資訊 */}
        <div>
          <h2 className="text-xl font-semibold mb-4">訂單資訊</h2>
          <div className="space-y-2 text-gray-700">
            <div className="flex justify-between">
              <span className="font-medium">訂單編號：</span>
              <span>#{order.order_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">訂單狀態：</span>
              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                {formatStatus(order.status)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">訂單日期：</span>
              <span>{formatDate(order.order_date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">總金額：</span>
              <span className="text-blue-600 font-bold text-xl">
                {formatPrice(order.deal_price ?? order.posting?.price ?? 0)}
              </span>
            </div>
          </div>
        </div>

        {/* 商品資訊 */}
        {order.posting && (
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">商品資訊</h2>
            <div className="flex space-x-4">
              {order.posting.image_url && (
                <div className="w-32 h-32 bg-gray-200 rounded-lg flex-shrink-0">
                  <img
                    src={order.posting.image_url}
                    alt={order.posting.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              )}
              <div className="flex-1">
                <Link
                  href={`/postings/${order.posting.p_id}`}
                  className="text-lg font-semibold hover:text-blue-600"
                >
                  {order.posting.title}
                </Link>
                <p className="text-gray-600 mt-2">{order.posting.description}</p>
                <p className="text-blue-600 font-bold text-xl mt-2">
                  {formatPrice(order.posting.price ?? 0)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 買家資訊 */}
        {order.buyer && (
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">買家資訊</h2>
            <div className="space-y-2 text-gray-700">
              <p>
                <span className="font-medium">使用者名稱：</span>
                {order.buyer.username}
              </p>
              <p>
                <span className="font-medium">電子郵件：</span>
                {order.buyer.email}
              </p>
            </div>
          </div>
        )}

        {/* 賣家資訊 */}
        {order.posting?.user && (
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">賣家資訊</h2>
            <div className="space-y-2 text-gray-700">
              <p>
                <span className="font-medium">使用者名稱：</span>
                {order.posting.user.username}
              </p>
              <p>
                <span className="font-medium">電子郵件：</span>
                {order.posting.user.email}
              </p>
            </div>
          </div>
        )}

        {/* 評價功能 */}
        {order.posting?.user && (() => {
          const session = getClientSession();
          const currentUserId = session?.u_id;
          const isBuyer = currentUserId === order.buyer_id;
          const sellerName = order.posting.user.username;

          if (!isBuyer) return null;

          return (
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">評價賣家</h2>
              {loadingReview ? (
                <div className="text-center py-4 text-gray-500">載入中...</div>
              ) : existingReview ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex text-yellow-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={star <= existingReview.rating ? 'text-yellow-400' : 'text-gray-300'}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {existingReview.rating} 顆星
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(existingReview.created_at)}
                      </span>
                    </div>
                    {existingReview.comment && (
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {existingReview.comment}
                      </p>
                    )}
                  </div>
                </div>
              ) : showReviewForm ? (
                <ReviewForm
                  orderId={order.order_id}
                  sellerName={sellerName}
                  onSubmit={handleSubmitReview}
                  onCancel={() => setShowReviewForm(false)}
                />
              ) : (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  評價賣家
                </button>
              )}
            </div>
          );
        })()}

        {/* 逃單舉報 */}
        {order.posting?.user && (
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">問題回報</h2>
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 mb-3">
                  <strong>注意：</strong>如果遇到以下情況，請使用逃單舉報功能：
                </p>
                <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                  <li>賣家未在約定時間內寄送商品</li>
                  <li>買家未在約定時間內付款</li>
                </ul>
              </div>
              <div className="flex space-x-4">
                {(() => {
                  const session = getClientSession();
                  const currentUserId = session?.u_id;
                  const isBuyer = currentUserId === order.buyer_id;
                  const sellerId = order.posting?.u_id;

                  if (isBuyer && sellerId) {
                    // 買家可以舉報賣家
                    return (
                      <ReportButton
                        reportType="order_violation"
                        targetId={order.order_id}
                        targetUserId={sellerId}
                        targetTitle={`訂單 #${order.order_id} - 賣家：${order.posting.user.username}`}
                        buttonText="舉報賣家逃單"
                        buttonClassName="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                      />
                    );
                  } else if (!isBuyer && order.buyer) {
                    // 賣家可以舉報買家
                    return (
                      <ReportButton
                        reportType="order_violation"
                        targetId={order.order_id}
                        targetUserId={order.buyer_id}
                        targetTitle={`訂單 #${order.order_id} - 買家：${order.buyer.username}`}
                        buttonText="舉報買家逃單"
                        buttonClassName="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                      />
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

