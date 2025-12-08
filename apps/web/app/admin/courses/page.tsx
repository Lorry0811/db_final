'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getClientSession } from '@/lib/auth/client-session';
import { formatDate } from '@/lib/utils/format';

interface Course {
  course_id: number;
  course_code: string;
  course_name: string;
  dept_id: number | null;
  class_id: number | null;
  created_at: string;
  department?: { dept_id: number; dept_name: string } | null;
  class?: { class_id: number; class_name: string } | null;
}

interface Department {
  dept_id: number;
  dept_name: string;
}

interface Class {
  class_id: number;
  class_name: string;
}

export default function AdminCoursesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    course_code: '',
    course_name: '',
    dept_id: '',
    class_id: '',
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

    loadCourses();
    loadDepartments();
    loadClasses();
  }, [router]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const url = searchKeyword
        ? `/api/admin/courses?keyword=${encodeURIComponent(searchKeyword)}`
        : '/api/admin/courses';
      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setCourses(result.data || []);
      } else {
        alert(result.error || '載入課程失敗');
      }
    } catch (error) {
      console.error('載入課程失敗:', error);
      alert('載入課程失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await fetch('/api/admin/departments');
      const result = await response.json();
      if (result.success) {
        setDepartments(result.data || []);
      }
    } catch (error) {
      console.error('載入科系失敗:', error);
    }
  };

  const loadClasses = async () => {
    try {
      const response = await fetch('/api/admin/classes');
      const result = await response.json();
      if (result.success) {
        setClasses(result.data || []);
      }
    } catch (error) {
      console.error('載入分類失敗:', error);
    }
  };

  useEffect(() => {
    if (!showForm) {
      loadCourses();
    }
  }, [searchKeyword, showForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const url = editingCourse
        ? `/api/admin/courses/${editingCourse.course_id}`
        : '/api/admin/courses';
      const method = editingCourse ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          course_code: formData.course_code,
          course_name: formData.course_name,
          dept_id: formData.dept_id ? parseInt(formData.dept_id) : null,
          class_id: formData.class_id ? parseInt(formData.class_id) : null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(editingCourse ? '課程更新成功' : '課程新增成功');
        setShowForm(false);
        setEditingCourse(null);
        setFormData({ course_code: '', course_name: '', dept_id: '', class_id: '' });
        loadCourses();
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

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      course_code: course.course_code,
      course_name: course.course_name,
      dept_id: course.dept_id?.toString() || '',
      class_id: course.class_id?.toString() || '',
    });
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (courseId: number) => {
    if (!confirm('確定要刪除此課程嗎？')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        alert('課程刪除成功');
        loadCourses();
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
    setEditingCourse(null);
    setFormData({ course_code: '', course_name: '', dept_id: '', class_id: '' });
    setError(null);
    setSuccess(null);
  };

  if (loading && courses.length === 0) {
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
        <h1 className="text-3xl font-bold text-gray-900">課程管理</h1>
        {!showForm && (
          <button
            onClick={() => {
              setShowForm(true);
              setEditingCourse(null);
              setFormData({ course_code: '', course_name: '', dept_id: '', class_id: '' });
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            新增課程
          </button>
        )}
      </div>

      {showForm ? (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingCourse ? '編輯課程' : '新增課程'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                課程代碼 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.course_code}
                onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                required
                maxLength={20}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                課程名稱 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.course_name}
                onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                required
                maxLength={200}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                科系（選填）
              </label>
              <select
                value={formData.dept_id}
                onChange={(e) => setFormData({ ...formData, dept_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">請選擇科系</option>
                {departments.map((dept) => (
                  <option key={dept.dept_id} value={dept.dept_id}>
                    {dept.dept_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                分類（選填）
              </label>
              <select
                value={formData.class_id}
                onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">請選擇分類</option>
                {classes.map((cls) => (
                  <option key={cls.class_id} value={cls.class_id}>
                    {cls.class_name}
                  </option>
                ))}
              </select>
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
                {submitting ? '處理中...' : editingCourse ? '更新' : '新增'}
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
        <>
          {/* 搜尋欄 */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex space-x-4">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="搜尋課程代碼或名稱..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={loadCourses}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                搜尋
              </button>
            </div>
          </div>

          {/* 課程列表 */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    課程代碼
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    課程名稱
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    科系
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    分類
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
                {courses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      尚無課程資料
                    </td>
                  </tr>
                ) : (
                  courses.map((course) => (
                    <tr key={course.course_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {course.course_code}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {course.course_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.department?.dept_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.class?.class_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(course.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(course)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          編輯
                        </button>
                        <button
                          onClick={() => handleDelete(course.course_id)}
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
        </>
      )}
    </div>
  );
}

