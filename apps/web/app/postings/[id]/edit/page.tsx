'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ImageUpload from '@/components/ImageUpload';
import CourseSelect from '@/components/CourseSelect';
import { getClientSession } from '@/lib/auth/client-session';

interface Class {
  class_id: number;
  class_name: string;
  description: string | null;
}

export default function EditPostingPage() {
  const router = useRouter();
  const params = useParams();
  const postingId = parseInt(params.id as string);
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [images, setImages] = useState<{ url: string; file?: File }[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    class_id: '',
    course_id: '',
    status: 'listed',
  });

  useEffect(() => {
    // 檢查是否已登入
    const session = getClientSession();
    if (!session) {
      router.push('/login?redirect=/postings/' + postingId + '/edit');
      return;
    }
    setUserId(session.u_id);

    // 載入刊登資料
    const loadPosting = async () => {
      try {
        const response = await fetch(`/api/postings/${postingId}`);
        const result = await response.json();

        if (result.success) {
          const posting = result.data;
          
          // 檢查是否為刊登者本人
          if (posting.u_id !== session.u_id) {
            alert('您沒有權限編輯此刊登');
            router.push(`/postings/${postingId}`);
            return;
          }

          // 填入表單資料
          setFormData({
            title: posting.title || '',
            description: posting.description || '',
            price: posting.price?.toString() || '',
            class_id: posting.class_id?.toString() || '',
            course_id: posting.course_id?.toString() || '',
            status: posting.status || 'listed',
          });

          // 載入現有圖片
          if (posting.images && posting.images.length > 0) {
            setImages(
              posting.images.map((img: any) => ({
                url: img.image_url,
              }))
            );
          } else if (posting.image_url) {
            setImages([{ url: posting.image_url }]);
          }
        } else {
          alert('載入刊登失敗');
          router.push('/dashboard');
        }
      } catch (error) {
        alert('載入刊登失敗');
        router.push('/dashboard');
      } finally {
        setFetching(false);
      }
    };

    loadPosting();

    // 載入分類列表
    const loadClasses = async () => {
      try {
        const response = await fetch('/api/classes');
        const result = await response.json();
        if (result.success) {
          setClasses(result.data || []);
        }
      } catch (error) {
        console.error('載入分類失敗:', error);
      }
    };

    loadClasses();
  }, [postingId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 先上傳所有未上傳的圖片
      const uploadedImages = await Promise.all(
        images.map(async (image) => {
          if (image.file && !image.url.startsWith('http')) {
            const formData = new FormData();
            formData.append('file', image.file);

            const uploadResponse = await fetch('/api/upload', {
              method: 'POST',
              body: formData,
            });

            const uploadResult = await uploadResponse.json();
            if (uploadResult.success) {
              return uploadResult.data.url;
            } else {
              throw new Error(uploadResult.error || '圖片上傳失敗');
            }
          }
          return image.url;
        })
      );

      // 更新刊登
      const response = await fetch(`/api/postings/${postingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          price: parseInt(formData.price),
          class_id: formData.class_id ? parseInt(formData.class_id) : null,
          course_id: formData.course_id ? parseInt(formData.course_id) : null,
          status: formData.status,
          image_url: uploadedImages[0] || null,
          images: uploadedImages.map((url, index) => ({
            image_url: url,
            display_order: index,
          })),
        }),
      });

      const result = await response.json();

      if (result.success) {
        router.push(`/postings/${postingId}`);
      } else {
        alert(result.error || '更新失敗');
      }
    } catch (error: any) {
      alert(error.message || '更新失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">載入中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">編輯刊登</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            商品標題 *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="例如：二手資料庫管理教科書"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            商品描述
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={6}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="描述商品的狀況、使用情況等..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            價格 (NT$) *
          </label>
          <input
            type="number"
            required
            min="0"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            分類
          </label>
          <select
            value={formData.class_id}
            onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">選擇分類</option>
            {classes.map((cls) => (
              <option key={cls.class_id} value={cls.class_id}>
                {cls.class_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            課程（僅限教科書）
          </label>
          <CourseSelect
            value={formData.course_id}
            onChange={(courseId) => setFormData({ ...formData, course_id: courseId })}
            disabled={formData.class_id !== '1'}
            placeholder="輸入關鍵字搜尋課程..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            狀態
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="listed">刊登中</option>
            <option value="reserved">預訂中</option>
            <option value="sold">已售出</option>
            <option value="removed">已下架</option>
          </select>
        </div>

        <ImageUpload
          onImagesChange={setImages}
          maxImages={5}
          existingImages={images.map(img => img.url)}
        />

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '更新中...' : '更新刊登'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}

