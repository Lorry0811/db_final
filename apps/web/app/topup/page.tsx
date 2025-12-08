'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getClientSession } from '@/lib/auth/client-session';
import { formatPrice } from '@/lib/utils/format';

export default function TopUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [loadingBalance, setLoadingBalance] = useState(true);

  useEffect(() => {
    const session = getClientSession();
    if (!session) {
      router.push('/login?redirect=/topup');
      return;
    }

    loadBalance();
  }, [router]);

  const loadBalance = async () => {
    try {
      setLoadingBalance(true);
      const response = await fetch('/api/users/balance');
      const result = await response.json();

      if (result.success) {
        setBalance(result.data.balance);
      }
    } catch (error) {
      console.error('載入餘額失敗:', error);
    } finally {
      setLoadingBalance(false);
    }
  };

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();

    const topUpAmount = parseInt(amount);
    if (!topUpAmount || topUpAmount <= 0) {
      alert('請輸入有效的儲值金額');
      return;
    }

    if (topUpAmount > 100000) {
      alert('單次儲值金額不能超過 NT$ 100,000');
      return;
    }

    if (!confirm(`確定要儲值 NT$ ${topUpAmount.toLocaleString()} 嗎？`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/users/topup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: topUpAmount }),
      });

      const result = await response.json();

      if (result.success) {
        alert('儲值成功！');
        setAmount('');
        loadBalance(); // 重新載入餘額
      } else {
        alert(result.error || '儲值失敗');
      }
    } catch (error: any) {
      alert(error.message || '儲值失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [100, 500, 1000, 5000, 10000];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">儲值</h1>

      {/* 當前餘額 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">當前餘額</h2>
        {loadingBalance ? (
          <p className="text-gray-500">載入中...</p>
        ) : (
          <p className="text-4xl font-bold text-blue-600">
            {balance !== null ? formatPrice(balance) : 'NT$ 0'}
          </p>
        )}
      </div>

      {/* 儲值表單 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">儲值金額</h2>

        <form onSubmit={handleTopUp} className="space-y-6">
          {/* 快速選擇金額 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              快速選擇
            </label>
            <div className="grid grid-cols-5 gap-2">
              {quickAmounts.map((quickAmount) => (
                <button
                  key={quickAmount}
                  type="button"
                  onClick={() => setAmount(quickAmount.toString())}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium hover:border-blue-600 hover:text-blue-600 transition-colors"
                >
                  NT$ {quickAmount.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* 自訂金額 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              自訂金額
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">NT$</span>
              <input
                type="number"
                min="1"
                max="100000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="輸入儲值金額"
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              單次儲值金額範圍：NT$ 1 - NT$ 100,000
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !amount || parseInt(amount) <= 0}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '處理中...' : '確認儲值'}
          </button>
        </form>
      </div>

      {/* 交易紀錄連結 */}
      <div className="mt-6 text-center">
        <a
          href="/transactions"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          查看交易紀錄 →
        </a>
      </div>
    </div>
  );
}

