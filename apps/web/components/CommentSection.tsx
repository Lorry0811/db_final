'use client';

import { useState, useEffect } from 'react';
import { getClientSession } from '@/lib/auth/client-session';
import { formatDate } from '@/lib/utils/format';
import { useRouter } from 'next/navigation';
import ReportButton from '@/components/ReportButton';

interface Comment {
  comment_id: number;
  p_id: number;
  u_id: number;
  content: string;
  created_at: string;
  user?: {
    u_id: number;
    username: string;
    email: string;
  };
}

interface CommentSectionProps {
  postingId: number;
  currentUserId?: number | null;
}

export default function CommentSection({
  postingId,
  currentUserId,
}: CommentSectionProps) {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    loadComments();
  }, [postingId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/comments?postingId=${postingId}`);
      const result = await response.json();

      if (result.success) {
        setComments(result.data || []);
      }
    } catch (error) {
      console.error('載入留言失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    const session = getClientSession();
    if (!session) {
      router.push('/login?redirect=/postings/' + postingId);
      return;
    }

    if (!newComment.trim()) {
      alert('請輸入留言內容');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postingId,
          content: newComment,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setNewComment('');
        loadComments(); // 重新載入留言
      } else {
        alert(result.error || '新增留言失敗');
      }
    } catch (error) {
      alert('新增留言失敗，請稍後再試');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (comment: Comment) => {
    setEditingId(comment.comment_id);
    setEditContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const handleUpdateComment = async (commentId: number) => {
    if (!editContent.trim()) {
      alert('請輸入留言內容');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editContent,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setEditingId(null);
        setEditContent('');
        loadComments(); // 重新載入留言
      } else {
        alert(result.error || '更新留言失敗');
      }
    } catch (error) {
      alert('更新留言失敗，請稍後再試');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('確定要刪除此留言嗎？')) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        loadComments(); // 重新載入留言
      } else {
        alert(result.error || '刪除留言失敗');
      }
    } catch (error) {
      alert('刪除留言失敗，請稍後再試');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        留言 ({comments.length})
      </h2>

      {/* 新增留言表單 */}
      {currentUserId ? (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="輸入你的留言..."
              rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              disabled={submitting}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? '送出中...' : '送出留言'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-center">
          <p className="text-gray-600 mb-2">請先登入才能留言</p>
          <button
            onClick={() => router.push('/login?redirect=/postings/' + postingId)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            立即登入
          </button>
        </div>
      )}

      {/* 留言列表 */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">載入中...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">還沒有留言，來搶頭香吧！</div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.comment_id}
              className="bg-white rounded-lg shadow-sm p-4"
            >
              {editingId === comment.comment_id ? (
                <div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                    disabled={submitting}
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleUpdateComment(comment.comment_id)}
                      disabled={submitting}
                      className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      儲存
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={submitting}
                      className="border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="font-semibold text-gray-900">
                        {comment.user?.username || '未知使用者'}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      {currentUserId === comment.u_id && (
                        <>
                          <button
                            onClick={() => handleStartEdit(comment)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            編輯
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.comment_id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            刪除
                          </button>
                        </>
                      )}
                      {currentUserId !== comment.u_id && (
                        <ReportButton
                          reportType="comment"
                          targetId={comment.comment_id}
                          targetTitle={comment.content.substring(0, 30) + '...'}
                          buttonText="舉報"
                          buttonClassName="text-red-600 hover:text-red-700 text-sm font-medium"
                        />
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

