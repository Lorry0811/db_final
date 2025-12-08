'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ReviewList from '@/components/ReviewList';

interface Review {
  review_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer?: {
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

export default function UserReviewsPage() {
  const params = useParams();
  const userId = parseInt(params.id as string);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<{ average: number; count: number } | null>(null);
  const [userInfo, setUserInfo] = useState<{ username: string } | null>(null);

  useEffect(() => {
    if (isNaN(userId)) {
      setLoading(false);
      return;
    }

    loadUserInfo();
    loadReviews();
    loadAverageRating();
  }, [userId]);

  const loadUserInfo = async () => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      const result = await response.json();
      if (result.success) {
        setUserInfo({ username: result.data.username });
      }
    } catch (error) {
      console.error('載入使用者資訊失敗:', error);
    }
  };

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reviews?targetId=${userId}`);
      const result = await response.json();

      if (result.success) {
        setReviews(result.data || []);
      } else {
        console.error('載入評價失敗:', result.error);
      }
    } catch (error) {
      console.error('載入評價失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAverageRating = async () => {
    try {
      const response = await fetch(`/api/reviews/average?userId=${userId}`);
      const result = await response.json();

      if (result.success) {
        setAverageRating(result.data);
      }
    } catch (error) {
      console.error('載入平均評分失敗:', error);
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {userInfo ? `${userInfo.username} 的評價` : '賣家評價'}
      </h1>

      {averageRating && averageRating.count > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">
                {averageRating.average.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">平均評分</div>
            </div>
            <div className="flex-1">
              <div className="flex text-yellow-400 text-2xl mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={star <= Math.round(averageRating.average) ? 'text-yellow-400' : 'text-gray-300'}
                  >
                    ★
                  </span>
                ))}
              </div>
              <p className="text-gray-600">
                共 {averageRating.count} 筆評價
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            此賣家尚無評價
          </div>
        ) : (
          <ReviewList reviews={reviews} showOrderInfo={true} showReviewer={true} />
        )}
      </div>
    </div>
  );
}

