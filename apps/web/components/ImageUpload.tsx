'use client';

import { useState, useRef } from 'react';
import { validateImageFile, compressImage, createPreviewUrl } from '@/lib/utils/image';

interface ImageUploadProps {
  onImagesChange: (images: { url: string; file?: File }[]) => void;
  maxImages?: number;
  existingImages?: string[];
}

export default function ImageUpload({
  onImagesChange,
  maxImages = 5,
  existingImages = [],
}: ImageUploadProps) {
  const [images, setImages] = useState<{ url: string; file?: File; isUploading?: boolean }[]>(
    existingImages.map((url) => ({ url }))
  );
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError('');

    // 檢查數量限制
    if (images.length + files.length > maxImages) {
      setError(`最多只能上傳 ${maxImages} 張圖片`);
      return;
    }

    const newImages: { url: string; file?: File; isUploading?: boolean }[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // 驗證檔案
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setError(validation.error || '檔案驗證失敗');
        continue;
      }

      try {
        // 壓縮圖片（可選，如果檔案太大）
        const compressedFile = file.size > 1024 * 1024 // 大於 1MB 才壓縮
          ? await compressImage(file)
          : file;

        // 建立預覽
        const previewUrl = await createPreviewUrl(compressedFile);

        newImages.push({
          url: previewUrl,
          file: compressedFile,
          isUploading: false,
        });
      } catch (err: any) {
        setError(err.message || '圖片處理失敗');
      }
    }

    const updatedImages = [...images, ...newImages];
    setImages(updatedImages);
    onImagesChange(updatedImages.map((img) => ({ url: img.url, file: img.file })));

    // 重置 input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async (index: number) => {
    const image = images[index];
    if (!image.file) return; // 如果已經上傳過，跳過

    setImages((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], isUploading: true };
      return updated;
    });

    try {
      const formData = new FormData();
      formData.append('file', image.file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setImages((prev) => {
          const updated = [...prev];
          updated[index] = { url: result.data.url, isUploading: false };
          return updated;
        });

        // 更新父元件
        const updatedImages = [...images];
        updatedImages[index] = { url: result.data.url, isUploading: false };
        onImagesChange(updatedImages.map((img) => ({ url: img.url, file: img.file })));
      } else {
        throw new Error(result.error || '上傳失敗');
      }
    } catch (err: any) {
      setError(err.message || '上傳失敗');
      setImages((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], isUploading: false };
        return updated;
      });
    }
  };

  const handleRemove = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    onImagesChange(updatedImages.map((img) => ({ url: img.url, file: img.file })));
  };

  const handleUploadAll = async () => {
    for (let i = 0; i < images.length; i++) {
      if (images[i].file && !images[i].url.startsWith('http')) {
        await handleUpload(i);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          商品圖片 {images.length > 0 && `(${images.length}/${maxImages})`}
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="image-upload"
          disabled={images.length >= maxImages}
        />
        <label
          htmlFor="image-upload"
          className={`inline-block px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            images.length >= maxImages
              ? 'border-gray-300 text-gray-400 cursor-not-allowed'
              : 'border-blue-300 text-blue-600 hover:border-blue-400 hover:bg-blue-50'
          }`}
        >
          {images.length >= maxImages ? '已達上傳上限' : '+ 選擇圖片'}
        </label>
        <p className="mt-2 text-sm text-gray-500">
          支援 JPG、PNG、WebP 格式，單檔最大 5MB，最多 {maxImages} 張
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {images.length > 0 && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={image.url}
                    alt={`預覽 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute top-2 right-2 flex space-x-2">
                  {image.file && !image.url.startsWith('http') && (
                    <button
                      type="button"
                      onClick={() => handleUpload(index)}
                      disabled={image.isUploading}
                      className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                    >
                      {image.isUploading ? '上傳中...' : '上傳'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                  >
                    刪除
                  </button>
                </div>
                {image.isUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                    <div className="text-white text-sm">上傳中...</div>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>

          {images.some((img) => img.file && !img.url.startsWith('http')) && (
            <button
              type="button"
              onClick={handleUploadAll}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              上傳所有圖片
            </button>
          )}
        </div>
      )}
    </div>
  );
}
