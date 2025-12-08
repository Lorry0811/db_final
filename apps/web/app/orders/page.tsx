'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatPrice, formatDate, formatStatus } from '@/lib/utils/format';
import { getClientSession } from '@/lib/auth/client-session';

interface Order {
  order_id: number;
  buyer_id: number;
  p_id: number;
  deal_price: number;
  status: string;
  order_date: string;
  posting?: {
    p_id: number;
    title: string;
    price: number;
  };
}

export default function OrdersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const session = getClientSession();
    if (!session) {
      router.push('/login?redirect=/orders');
      return;
    }

    loadOrders();
  }, [router]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders');
      const result = await response.json();

      if (result.success) {
        setOrders(result.data || []);
      } else {
        alert(result.error || '載入訂單失敗');
      }
    } catch (error) {
      console.error('載入訂單失敗:', error);
      alert('載入訂單失敗，請稍後再試');
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">我的訂單</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500 mb-4">還沒有任何訂單</p>
          <Link
            href="/postings"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            去瀏覽商品
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.order_id}
              href={`/orders/${order.order_id}`}
              className="block bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">
                    {order.posting?.title || `訂單 #${order.order_id}`}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>訂單編號：{order.order_id}</span>
                    <span>日期：{formatDate(order.order_date)}</span>
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {formatStatus(order.status)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-blue-600 font-bold text-xl">
                    {formatPrice(order.deal_price ?? order.posting?.price ?? 0)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

