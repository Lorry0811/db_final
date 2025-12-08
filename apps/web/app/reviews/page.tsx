'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils/format';
import { getClientSession } from '@/lib/auth/client-session';
import ReviewList from '@/components/ReviewList';

interface Review {
  review_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  target?: {
    u_id: number;
    username: string;
    email: string;
  };
  order?: {
    order_id: number;
    posting?: {
      p_id: number;
      title: string;
    };
  };
}

export default function MyReviewsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<{ average: number; count: number } | null>(null);

  useEffect(() => {
    const session = getClientSession();
    if (!session) {
      router.push('/login?redirect=/reviews');
      return;
    }

    loadReviews();
  }, [router]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const session = getClientSession();
      if (!session) return;

      const response = await fetch(`/api/reviews?reviewerId=${session.u_id}`);
      const result = await response.json();

      if (result.success) {
        setReviews(result.data || []);
      } else {
        alert(result.error || '載入評價失敗');
      }
    } catch (error) {
      console.error('載入評價失敗:', error);
      alert('載入評價失敗，請稍後再試');
    } finally {
      setLoading(false);
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
      <div className="mb-6">
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
          ← 返回個人中心
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">我的評價紀錄</h1>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">您還沒有評價過任何賣家</p>
          <Link
            href="/orders"
            className="mt-4 inline-block text-blue-600 hover:text-blue-700"
          >
            前往訂單列表
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <p className="text-gray-600">
              共 {reviews.length} 筆評價
            </p>
          </div>
          <ReviewList reviews={reviews} showOrderInfo={true} showReviewer={false} />
        </div>
      )}
    </div>
  );
}

