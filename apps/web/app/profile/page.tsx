'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatPrice, formatDate } from '@/lib/utils/format';
import { getClientSession } from '@/lib/auth/client-session';

interface UserProfile {
  u_id: number;
  username: string;
  email: string;
  balance: number;
  is_admin: boolean;
  is_blocked: boolean;
  violation_count: number;
  created_at: string;
}

interface UserStatistics {
  total_posts: number;
  sold_posts: number;
  total_orders_as_buyer: number;
  total_spent?: number;
  total_earned?: number;
  average_rating: number;
  review_count: number;
  favorite_count?: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const session = getClientSession();
    if (!session) {
      router.push('/login?redirect=/profile');
      return;
    }

    loadProfile();
  }, [router]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users/profile');
      const result = await response.json();

      if (result.success) {
        setUser(result.data.user);
        setStatistics(result.data.statistics);
        setFormData({
          username: result.data.user.username,
          email: result.data.user.email,
          password: '',
          confirmPassword: '',
        });
      } else {
        alert(result.error || '載入個人資料失敗');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('載入個人資料失敗:', error);
      alert('載入個人資料失敗，請稍後再試');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // 驗證密碼確認
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('密碼確認不一致');
      return;
    }

    setSubmitting(true);

    try {
      const updateData: any = {
        username: formData.username,
        email: formData.email,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('個人資料更新成功');
        setUser(result.data);
        setEditing(false);
        setFormData({
          username: result.data.username,
          email: result.data.email,
          password: '',
          confirmPassword: '',
        });
        // 更新 session 中的使用者資訊
        const session = getClientSession();
        if (session) {
          session.username = result.data.username;
          session.email = result.data.email;
          localStorage.setItem('user_session', JSON.stringify(session));
        }
      } else {
        setError(result.error || '更新失敗');
      }
    } catch (error) {
      console.error('更新個人資料失敗:', error);
      setError('更新失敗，請稍後再試');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">載入中...</div>
      </div>
    );
  }

  if (!user || !statistics) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">找不到個人資料</h1>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
            返回儀表板
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
          ← 返回儀表板
        </Link>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">個人資料</h1>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            編輯個人資料
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左側：個人資料 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    使用者名稱 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    minLength={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    電子郵件 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    新密碼（選填，留空則不修改）
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    minLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {formData.password && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      確認密碼
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      minLength={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                    {success}
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitting ? '更新中...' : '儲存變更'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setError(null);
                      setSuccess(null);
                      setFormData({
                        username: user.username,
                        email: user.email,
                        password: '',
                        confirmPassword: '',
                      });
                    }}
                    disabled={submitting}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                  >
                    取消
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    使用者名稱
                  </label>
                  <p className="text-gray-900">{user.username}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    電子郵件
                  </label>
                  <p className="text-gray-900">{user.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    註冊時間
                  </label>
                  <p className="text-gray-900">{formatDate(user.created_at)}</p>
                </div>

                {user.is_admin && (
                  <div>
                    <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm font-medium">
                      管理員
                    </span>
                  </div>
                )}

                {user.is_blocked && (
                  <div>
                    <span className="inline-block px-2 py-1 bg-red-100 text-red-700 rounded text-sm font-medium">
                      帳號已封鎖
                    </span>
                  </div>
                )}

                {user.violation_count > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      違規次數
                    </label>
                    <p className="text-red-600 font-semibold">{user.violation_count}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 右側：統計資訊 */}
        <div className="lg:col-span-1 space-y-4">
          {/* 帳戶餘額 */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm p-6 text-white">
            <h2 className="text-lg font-semibold mb-2">帳戶餘額</h2>
            <p className="text-3xl font-bold mb-4">
              {formatPrice(user.balance)}
            </p>
            <Link
              href="/topup"
              className="block w-full bg-white text-blue-600 px-4 py-2 rounded-lg text-center font-medium hover:bg-blue-50 transition-colors"
            >
              儲值
            </Link>
          </div>

          {/* 統計資訊 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">統計資訊</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-600">總刊登數</span>
                  <span className="font-semibold text-gray-900">{statistics.total_posts}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>已售出</span>
                  <span>{statistics.sold_posts}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-600">購買訂單數</span>
                  <span className="font-semibold text-gray-900">{statistics.total_orders_as_buyer}</span>
                </div>
              </div>

              {statistics.average_rating > 0 && (
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">平均評分</span>
                    <div className="flex items-center space-x-2">
                      <div className="flex text-yellow-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={star <= Math.round(statistics.average_rating) ? 'text-yellow-400' : 'text-gray-300'}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="font-semibold text-gray-900">
                        {statistics.average_rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {statistics.review_count} 筆評價
                  </div>
                </div>
              )}

              {statistics.total_earned !== undefined && statistics.total_earned > 0 && (
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">總收入</span>
                    <span className="font-semibold text-green-600">
                      {formatPrice(statistics.total_earned)}
                    </span>
                  </div>
                </div>
              )}

              {statistics.total_spent !== undefined && statistics.total_spent > 0 && (
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">總支出</span>
                    <span className="font-semibold text-red-600">
                      {formatPrice(statistics.total_spent)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 快速連結 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">快速連結</h2>
            <div className="space-y-2">
              <Link
                href="/dashboard"
                className="block w-full border-2 border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-center hover:bg-gray-50 transition-colors"
              >
                我的儀表板
              </Link>
              <Link
                href="/orders"
                className="block w-full border-2 border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-center hover:bg-gray-50 transition-colors"
              >
                我的訂單
              </Link>
              <Link
                href="/reviews"
                className="block w-full border-2 border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-center hover:bg-gray-50 transition-colors"
              >
                我的評價
              </Link>
              <Link
                href="/favorites"
                className="block w-full border-2 border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-center hover:bg-gray-50 transition-colors"
              >
                我的收藏
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

