'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDate, formatDateTime } from '@/lib/utils/format';
import { getClientSession } from '@/lib/auth/client-session';

interface Conversation {
  other_user: {
    u_id: number;
    username: string;
    email: string;
  };
  last_message: {
    msg_id: number;
    content: string;
    sent_time: string;
    is_read: boolean;
    sender_id: number;
  };
  unread_count: number;
}

export default function MessagesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const session = getClientSession();
    if (!session) {
      router.push('/login?redirect=/messages');
      return;
    }

    loadConversations();
    loadUnreadCount();
  }, [router]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/messages?conversationList=true');
      const result = await response.json();

      if (result.success) {
        setConversations(result.data || []);
      } else {
        console.error('載入對話列表失敗:', result.error);
        setConversations([]);
      }
    } catch (error) {
      console.error('載入對話列表失敗:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await fetch('/api/messages/unread');
      const result = await response.json();

      if (result.success) {
        setUnreadCount(result.data.count || 0);
      }
    } catch (error) {
      console.error('載入未讀數量失敗:', error);
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">我的私訊</h1>
        {unreadCount > 0 && (
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            未讀 {unreadCount} 則
          </span>
        )}
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500 mb-4">還沒有任何私訊</p>
          <Link
            href="/postings"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            去瀏覽商品
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="divide-y">
            {conversations.map((conv) => {
              const session = getClientSession();
              const isFromMe = conv.last_message.sender_id === session?.u_id;
              
              return (
                <Link
                  key={conv.other_user.u_id}
                  href={`/messages/${conv.other_user.u_id}`}
                  className="block p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-semibold">
                        {conv.other_user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {conv.other_user.username}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {formatDate(conv.last_message.sent_time)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className={`text-sm truncate ${
                          !conv.last_message.is_read && !isFromMe
                            ? 'font-semibold text-gray-900'
                            : 'text-gray-600'
                        }`}>
                          {isFromMe ? '你: ' : ''}{conv.last_message.content}
                        </p>
                        {conv.unread_count > 0 && (
                          <span className="ml-2 px-2 py-1 bg-blue-600 text-white rounded-full text-xs font-medium">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

