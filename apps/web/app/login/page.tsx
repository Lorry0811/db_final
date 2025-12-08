'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { setClientSession } from '@/lib/auth/client-session';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        // 儲存 session 到 localStorage（客戶端）
        setClientSession(result.data);
        
        // 觸發自訂事件，通知 Header 更新
        window.dispatchEvent(new CustomEvent('auth-change'));
        
        // 根據使用者角色導向不同頁面
        if (result.data.is_admin) {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        alert(result.error || '登入失敗');
      }
    } catch (error) {
      alert('登入失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="card">
        <h1 className="text-3xl font-bold text-text-primary mb-8 text-center">
          登入 BookSwap
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              電子郵件
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              密碼
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '登入中...' : '登入'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-text-secondary">
            還沒有帳號？{' '}
            <Link href="/register" className="text-brand-blue hover:text-brand-blue-dark">
              立即註冊
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

