'use client';

import { formatDate } from '@/lib/utils/format';

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

interface ReviewListProps {
  reviews: Review[];
  showOrderInfo?: boolean;
  showReviewer?: boolean;
}

export default function ReviewList({
  reviews,
  showOrderInfo = false,
  showReviewer = true,
}: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        尚無評價
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.review_id}
          className="bg-white border border-gray-200 rounded-lg p-4"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {review.rating} 顆星
                </span>
              </div>
              {showReviewer && review.reviewer && (
                <p className="text-sm text-gray-600">
                  評價者：{review.reviewer.username}
                </p>
              )}
              {showOrderInfo && review.order?.posting && (
                <p className="text-sm text-gray-600">
                  商品：{review.order.posting.title}
                </p>
              )}
            </div>
            <span className="text-xs text-gray-500">
              {formatDate(review.created_at)}
            </span>
          </div>
          {review.comment && (
            <p className="text-gray-700 mt-2 whitespace-pre-wrap">
              {review.comment}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

