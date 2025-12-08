'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('密碼不一致');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (result.success) {
        router.push('/login');
      } else {
        alert(result.error || '註冊失敗');
      }
    } catch (error) {
      alert('註冊失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="card">
        <h1 className="text-3xl font-bold text-text-primary mb-8 text-center">
          註冊 BookSwap
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
              使用者名稱
            </label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="input"
              placeholder="username"
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

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              確認密碼
            </label>
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="input"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '註冊中...' : '註冊'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-text-secondary">
            已有帳號？{' '}
            <Link href="/login" className="text-brand-blue hover:text-brand-blue-dark">
              立即登入
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

