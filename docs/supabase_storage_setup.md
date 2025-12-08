# Supabase Storage 設定指南

為了使用圖片上傳功能，需要在 Supabase 中設定 Storage bucket。

## 步驟 1: 建立 Storage Bucket

1. 在 Supabase Dashboard 中，進入 **Storage**
2. 點擊 **New bucket**
3. 設定：
   - **Name**: `posting-images`
   - **Public bucket**: ✅ 勾選（讓圖片可以公開存取）
4. 點擊 **Create bucket**

## 步驟 2: 設定 Storage 政策（Policies）

為了讓使用者可以上傳圖片，需要設定適當的政策。

### 上傳政策（Upload Policy）

1. 在 `posting-images` bucket 中，進入 **Policies** 標籤
2. 點擊 **New Policy**
3. 選擇 **For full customization** 或使用模板
4. 設定政策：

**政策名稱**: `Allow authenticated uploads`

**Allowed operation（必須選擇）**:
- ✅ **INSERT** - 用於上傳圖片（必須）
- ✅ **SELECT** - 用於讀取/顯示圖片（必須）
- ⚠️ **DELETE** - 用於刪除圖片（可選，如果之後要實作刪除功能）

**Target roles**: 
- 選擇 `authenticated`（已認證使用者）或 `public`（所有人，僅開發用）

**政策定義**:
```sql
-- 允許已認證使用者上傳和讀取
bucket_id = 'posting-images'
```

**或使用更寬鬆的政策（開發用）**:
```sql
-- 允許所有人上傳和讀取（僅開發環境使用）
bucket_id = 'posting-images'
```

**注意**：如果使用 Supabase Dashboard 的視覺化介面設定：
- **Allowed operation** 請勾選：**INSERT** 和 **SELECT**（至少這兩個）
- 如果之後要實作刪除功能，也可以勾選 **DELETE**

### 讀取政策（Read Policy）

**政策名稱**: `Allow public reads`

**政策定義**:
```sql
-- 允許公開讀取
CREATE POLICY "Allow public reads"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'posting-images');
```

### 刪除政策（Delete Policy，可選）

**政策名稱**: `Allow users to delete own uploads`

**政策定義**:
```sql
-- 允許使用者刪除自己上傳的檔案
CREATE POLICY "Allow users to delete own uploads"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'posting-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## 步驟 3: 測試上傳

1. 在前端頁面嘗試上傳圖片
2. 檢查 Supabase Storage 中是否有新檔案
3. 檢查圖片 URL 是否可以正常存取

## 替代方案：使用外部圖片服務

如果不想使用 Supabase Storage，也可以：

1. **使用 Imgur API**
2. **使用 Cloudinary**
3. **使用 AWS S3**
4. **使用本地儲存**（不推薦用於生產環境）

只需要修改 `apps/web/app/api/upload/route.ts` 中的上傳邏輯即可。

## 檔案大小限制

- Supabase Storage 免費版：單檔最大 50MB
- 建議在前端限制：單檔最大 5MB
- 已在前端實作壓縮功能（大於 1MB 自動壓縮）

## 圖片格式支援

- JPEG / JPG
- PNG
- WebP

## 注意事項

1. **公開 bucket**: 如果設定為公開，所有圖片都可以透過 URL 直接存取
2. **安全性**: 建議在生產環境使用認證政策，限制只有已登入使用者可以上傳
3. **成本**: Supabase Storage 免費版有儲存空間限制，請注意使用量
4. **CDN**: Supabase Storage 自動提供 CDN，圖片載入速度很快

## 疑難排解

### Q: 上傳失敗，顯示 "Bucket not found"

**A:** 檢查：
- bucket 名稱是否為 `posting-images`
- bucket 是否已建立
- 是否在正確的 Supabase 專案中

### Q: 上傳失敗，顯示權限錯誤

**A:** 檢查：
- Storage 政策是否正確設定
- 是否允許 INSERT 操作
- 是否使用正確的認證方式

### Q: 圖片無法顯示

**A:** 檢查：
- bucket 是否設定為公開
- 讀取政策是否正確設定
- 圖片 URL 是否正確

