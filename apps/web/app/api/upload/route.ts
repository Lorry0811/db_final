import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// POST /api/upload - 上傳圖片到 Supabase Storage
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: '沒有上傳檔案' },
        { status: 400 }
      );
    }

    // 驗證檔案類型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: '不支援的檔案類型，請上傳 JPG、PNG 或 WebP 格式' },
        { status: 400 }
      );
    }

    // 驗證檔案大小（最大 5MB）
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: '檔案大小超過 5MB' },
        { status: 400 }
      );
    }

    // 生成唯一檔名
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomString}.${fileExt}`;
    const filePath = `postings/${fileName}`;

    // 轉換為 ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 上傳到 Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('posting-images')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      // 如果 bucket 不存在，返回錯誤訊息
      if (error.message.includes('Bucket not found')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Storage bucket 尚未設定，請先在 Supabase Dashboard 建立 "posting-images" bucket',
          },
          { status: 500 }
        );
      }
      throw error;
    }

    // 取得公開 URL
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from('posting-images').getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      data: {
        url: publicUrl,
        path: filePath,
        fileName: fileName,
      },
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '上傳失敗',
      },
      { status: 500 }
    );
  }
}

