'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getClientSession } from '@/lib/auth/client-session';
import { formatDate } from '@/lib/utils/format';

interface User {
  u_id: number;
  username: string;
  email: string;
  balance: number;
  is_admin: boolean;
  is_blocked: boolean;
  violation_count: number;
  created_at: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isBlockedFilter, setIsBlockedFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 20;

  useEffect(() => {
    const session = getClientSession();
    if (!session || !session.is_admin) {
      router.push('/admin');
      return;
    }

    loadUsers();
  }, [router, page, isBlockedFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (searchKeyword) {
        params.append('search', searchKeyword);
      }

      if (isBlockedFilter !== 'all') {
        params.append('isBlocked', isBlockedFilter);
      }

      const response = await fetch(`/api/admin/users?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setUsers(result.data || []);
        setTotalCount(result.count || 0);
      } else {
        alert(result.error || '載入使用者失敗');
      }
    } catch (error) {
      console.error('載入使用者失敗:', error);
      alert('載入使用者失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadUsers();
  };

  const handleBlockToggle = async (userId: number, currentStatus: boolean) => {
    const action = currentStatus ? '解封' : '封鎖';
    if (!confirm(`確定要${action}此使用者嗎？`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_blocked: !currentStatus,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message || `${action}成功`);
        loadUsers();
      } else {
        alert(result.error || `${action}失敗`);
      }
    } catch (error) {
      console.error(`${action}失敗:`, error);
      alert(`${action}失敗，請稍後再試`);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">載入中...</div>
      </div>
    );
  }

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/admin" className="text-blue-600 hover:text-blue-700">
          ← 返回管理後台
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">使用者管理</h1>

      {/* 搜尋和篩選 */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="搜尋使用者名稱或電子郵件..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <select
            value={isBlockedFilter}
            onChange={(e) => {
              setIsBlockedFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">全部狀態</option>
            <option value="false">正常</option>
            <option value="true">已封鎖</option>
          </select>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            搜尋
          </button>
        </div>
      </div>

      {/* 使用者列表 */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                使用者名稱
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                電子郵件
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                餘額
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                違規次數
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                狀態
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                註冊時間
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  尚無使用者資料
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.u_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.u_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Link
                        href={`/admin/users/${user.u_id}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-900"
                      >
                        {user.username}
                      </Link>
                      {user.is_admin && (
                        <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                          管理員
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    NT$ {user.balance.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={user.violation_count > 0 ? 'text-red-600 font-semibold' : 'text-gray-500'}>
                      {user.violation_count}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.is_blocked ? (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                        已封鎖
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                        正常
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/users/${user.u_id}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      詳情
                    </Link>
                    <button
                      onClick={() => handleBlockToggle(user.u_id, user.is_blocked)}
                      className={user.is_blocked ? 'text-green-600 hover:text-green-900' : 'text-red-600 hover:text-red-900'}
                    >
                      {user.is_blocked ? '解封' : '封鎖'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 分頁 */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center items-center space-x-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            上一頁
          </button>
          <span className="text-sm text-gray-600">
            第 {page} 頁，共 {totalPages} 頁（總計 {totalCount} 筆）
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            下一頁
          </button>
        </div>
      )}
    </div>
  );
}

