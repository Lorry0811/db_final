'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatPrice, formatDate } from '@/lib/utils/format';
import { getClientSession } from '@/lib/auth/client-session';

interface Transaction {
  record_id: number;
  u_id: number;
  amount: number;
  trans_type: 'top_up' | 'payment' | 'income' | 'refund';
  trans_time: string;
}

const transTypeLabels: Record<string, string> = {
  top_up: '儲值',
  payment: '付款',
  income: '收入',
  refund: '退款',
};

export default function TransactionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const session = getClientSession();
    if (!session) {
      router.push('/login?redirect=/transactions');
      return;
    }

    loadTransactions();
  }, [router, filter]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const transType = filter === 'all' ? undefined : filter;
      const response = await fetch(`/api/transactions${transType ? `?transType=${transType}` : ''}`);
      const result = await response.json();

      if (result.success) {
        setTransactions(result.data || []);
      } else {
        alert(result.error || '載入交易紀錄失敗');
      }
    } catch (error) {
      console.error('載入交易紀錄失敗:', error);
      alert('載入交易紀錄失敗，請稍後再試');
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">交易紀錄</h1>

      {/* 篩選器 */}
      <div className="mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">全部類型</option>
          <option value="top_up">儲值</option>
          <option value="payment">付款</option>
          <option value="income">收入</option>
          <option value="refund">退款</option>
        </select>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500">還沒有任何交易紀錄</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  時間
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  類型
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  金額
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.record_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(transaction.trans_time)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transTypeLabels[transaction.trans_type] || transaction.trans_type}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                    transaction.trans_type === 'payment' || transaction.trans_type === 'refund'
                      ? 'text-red-600'
                      : 'text-green-600'
                  }`}>
                    {transaction.trans_type === 'payment' || transaction.trans_type === 'refund' ? '-' : '+'}
                    {formatPrice(Math.abs(transaction.amount))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

