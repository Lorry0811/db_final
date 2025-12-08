'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getClientSession, clearClientSession, type SessionUser } from '@/lib/auth/client-session';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 確保在客戶端執行
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    // 從 localStorage 讀取使用者資訊
    const loadUser = () => {
      try {
        const session = getClientSession();
        setUser(session);
      } catch (error) {
        console.error('載入使用者資訊失敗:', error);
        setUser(null);
      } finally {
        // 確保 loading 狀態一定會被設定為 false
        setLoading(false);
      }
    };

    // 立即執行一次（同步）
    loadUser();

    // 監聽自訂事件，當登入狀態改變時更新
    const handleAuthChange = () => {
      loadUser();
    };

    window.addEventListener('auth-change', handleAuthChange);

    // 清理事件監聽器
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/users/logout', { method: 'POST' });
      clearClientSession();
      setUser(null);
      
      // 觸發自訂事件，通知其他元件登入狀態已改變
      window.dispatchEvent(new CustomEvent('auth-change'));
      
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('登出失敗:', error);
    }
  };

  const navItems = [
    { href: '/', label: '首頁' },
    { href: '/postings', label: '瀏覽商品' },
    { href: '/postings/new', label: '刊登商品' },
    { href: '/dashboard', label: '我的儀表板' },
    { href: '/messages', label: '私訊' },
    { href: '/reports', label: '我的舉報' },
    { href: '/profile', label: '個人資料' },
  ];

  // 如果是管理員，加入管理後台連結
  if (user?.is_admin) {
    navItems.push({ href: '/admin', label: '管理後台' });
  }

  return (
    <header className="bg-brand-blue shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link 
              href="/" 
              className="text-2xl font-bold text-white hover:text-blue-200 transition-colors"
            >
              BookSwap
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'text-white bg-white/20'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            {loading ? (
              <span className="text-white/70 text-sm">載入中...</span>
            ) : user ? (
              <>
                <span className="text-white text-sm">
                  {user.username}
                  {user.is_admin && (
                    <span className="ml-2 px-2 py-1 bg-blue-400 text-white rounded-full text-xs font-medium">
                      管理員
                    </span>
                  )}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-white/90 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  登出
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-white/90 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  登入
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-blue-dark transition-colors"
                >
                  註冊
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

