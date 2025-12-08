'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getClientSession } from '@/lib/auth/client-session';
import { formatDate } from '@/lib/utils/format';

interface Class {
  class_id: number;
  class_name: string;
  description: string | null;
  created_at: string;
}

export default function AdminClassesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<Class[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [formData, setFormData] = useState({
    class_name: '',
    description: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const session = getClientSession();
    if (!session || !session.is_admin) {
      router.push('/admin');
      return;
    }

    loadClasses();
  }, [router]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/classes');
      const result = await response.json();

      if (result.success) {
        setClasses(result.data || []);
      } else {
        alert(result.error || '載入分類失敗');
      }
    } catch (error) {
      console.error('載入分類失敗:', error);
      alert('載入分類失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const url = editingClass
        ? `/api/admin/classes/${editingClass.class_id}`
        : '/api/admin/classes';
      const method = editingClass ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          class_name: formData.class_name,
          description: formData.description || null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(editingClass ? '分類更新成功' : '分類新增成功');
        setShowForm(false);
        setEditingClass(null);
        setFormData({ class_name: '', description: '' });
        loadClasses();
      } else {
        setError(result.error || '操作失敗');
      }
    } catch (error) {
      console.error('操作失敗:', error);
      setError('操作失敗，請稍後再試');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (classData: Class) => {
    setEditingClass(classData);
    setFormData({
      class_name: classData.class_name,
      description: classData.description || '',
    });
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (classId: number) => {
    if (!confirm('確定要刪除此分類嗎？如果仍有刊登使用此分類，將無法刪除。')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/classes/${classId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        alert('分類刪除成功');
        loadClasses();
      } else {
        alert(result.error || '刪除失敗');
      }
    } catch (error) {
      console.error('刪除失敗:', error);
      alert('刪除失敗，請稍後再試');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingClass(null);
    setFormData({ class_name: '', description: '' });
    setError(null);
    setSuccess(null);
  };

  if (loading && classes.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">載入中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/admin" className="text-blue-600 hover:text-blue-700">
          ← 返回管理後台
        </Link>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">分類管理</h1>
        {!showForm && (
          <button
            onClick={() => {
              setShowForm(true);
              setEditingClass(null);
              setFormData({ class_name: '', description: '' });
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            新增分類
          </button>
        )}
      </div>

      {showForm ? (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingClass ? '編輯分類' : '新增分類'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                分類名稱 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.class_name}
                onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                required
                maxLength={50}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                分類描述（選填）
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                {success}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? '處理中...' : editingClass ? '更新' : '新增'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={submitting}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  分類名稱
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  描述
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  建立時間
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {classes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    尚無分類資料
                  </td>
                </tr>
              ) : (
                classes.map((classData) => (
                  <tr key={classData.class_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {classData.class_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {classData.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(classData.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(classData)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        編輯
                      </button>
                      <button
                        onClick={() => handleDelete(classData.class_id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        刪除
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

