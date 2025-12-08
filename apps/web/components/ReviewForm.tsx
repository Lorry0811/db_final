'use client';

import { useState } from 'react';

interface ReviewFormProps {
  orderId: number;
  sellerName: string;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  onCancel?: () => void;
  existingReview?: {
    rating: number;
    comment: string | null;
  } | null;
}

export default function ReviewForm({
  orderId,
  sellerName,
  onSubmit,
  onCancel,
  existingReview,
}: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('請選擇評分');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit(rating, comment);
    } catch (err: any) {
      setError(err.message || '提交失敗，請稍後再試');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          評分 <span className="text-red-500">*</span>
        </label>
        <div className="flex space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-3xl transition-colors ${
                star <= rating
                  ? 'text-yellow-400'
                  : 'text-gray-300 hover:text-yellow-200'
              }`}
            >
              ★
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {rating > 0 ? `${rating} 顆星` : '請選擇評分'}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          評價內容（選填）
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="分享您對此次交易的體驗..."
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={submitting || rating === 0}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? '提交中...' : existingReview ? '更新評價' : '提交評價'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
          >
            取消
          </button>
        )}
      </div>
    </form>
  );
}

