'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { formatDateTime } from '@/lib/utils/format';
import { getClientSession } from '@/lib/auth/client-session';

interface Message {
  msg_id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  sent_time: string;
  is_read: boolean;
  sender?: {
    u_id: number;
    username: string;
    email: string;
  };
  receiver?: {
    u_id: number;
    username: string;
    email: string;
  };
}

export default function ConversationPage() {
  const router = useRouter();
  const params = useParams();
  const otherUserId = parseInt(params.userId as string);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<{ u_id: number; username: string } | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const session = getClientSession();
    if (!session) {
      router.push('/login?redirect=/messages/' + otherUserId);
      return;
    }

    if (isNaN(otherUserId)) {
      router.push('/messages');
      return;
    }

    loadMessages();
    // 標記對話為已讀
    markConversationAsRead();

    // 檢查 URL 參數中是否有初始訊息
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const initialContent = urlParams.get('initialContent');
      if (initialContent) {
        setNewMessage(decodeURIComponent(initialContent));
        // 清除 URL 參數
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [otherUserId, router]);

  // 自動滾動到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/messages?otherUserId=${otherUserId}`);
      const result = await response.json();

      if (result.success) {
        setMessages(result.data || []);
        // 從第一條訊息獲取對方使用者資訊
        if (result.data && result.data.length > 0) {
          const session = getClientSession();
          const firstMsg = result.data[0];
          const other = firstMsg.sender_id === session?.u_id 
            ? firstMsg.receiver 
            : firstMsg.sender;
          if (other) {
            setOtherUser(other);
          }
        }
      } else {
        console.error('載入訊息失敗:', result.error);
        setMessages([]);
      }
    } catch (error) {
      console.error('載入訊息失敗:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const markConversationAsRead = async () => {
    try {
      await fetch('/api/messages/conversation/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otherUserId }),
      });
    } catch (error) {
      console.error('標記已讀失敗:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: otherUserId,
          content: newMessage.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setNewMessage('');
        // 重新載入訊息
        await loadMessages();
      } else {
        alert(result.error || '發送失敗');
      }
    } catch (error: any) {
      alert(error.message || '發送失敗，請稍後再試');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">載入中...</div>
      </div>
    );
  }

  const session = getClientSession();
  const currentUserId = session?.u_id;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/messages" className="text-blue-600 hover:text-blue-700">
          ← 返回私訊列表
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        {/* 標題 */}
        <div className="border-b p-4">
          <h1 className="text-xl font-semibold text-gray-900">
            與 {otherUser?.username || '使用者'} 的對話
          </h1>
        </div>

        {/* 訊息列表 */}
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              還沒有任何訊息
            </div>
          ) : (
            messages.map((msg) => {
              const isFromMe = msg.sender_id === currentUserId;
              
              return (
                <div
                  key={msg.msg_id}
                  className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isFromMe
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                    <p className={`text-xs mt-1 ${
                      isFromMe ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatDateTime(msg.sent_time)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 輸入框 */}
        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="輸入訊息..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? '發送中...' : '發送'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

