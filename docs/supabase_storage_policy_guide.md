# Supabase Storage 政策設定指南

## 圖片上傳功能所需的操作權限

### 基本政策（上傳 + 讀取）

對於圖片上傳功能，你需要建立**兩個政策**：

#### 政策 1: 上傳政策（INSERT）

**政策名稱**: `Allow uploads to posting-images`

**Allowed operation**:
- ✅ **INSERT** - 必須勾選（用於上傳圖片）

**Target roles**:
- `authenticated`（已認證使用者）- 推薦
- 或 `public`（所有人）- 僅開發用

**Policy definition**:
```sql
bucket_id = 'posting-images'
```

#### 政策 2: 讀取政策（SELECT）

**政策名稱**: `Allow public reads from posting-images`

**Allowed operation**:
- ✅ **SELECT** - 必須勾選（用於讀取/顯示圖片）

**Target roles**:
- `public`（所有人）- 因為圖片需要公開顯示

**Policy definition**:
```sql
bucket_id = 'posting-images'
```

### 完整政策（包含刪除功能）

如果你之後要實作刪除圖片功能，可以建立第三個政策：

#### 政策 3: 刪除政策（DELETE）- 可選

**政策名稱**: `Allow users to delete own uploads`

**Allowed operation**:
- ✅ **DELETE** - 可選（用於刪除圖片）

**Target roles**:
- `authenticated`（已認證使用者）

**Policy definition**:
```sql
bucket_id = 'posting-images' AND auth.uid()::text = (storage.foldername(name))[1]
```

這個政策允許使用者只刪除自己上傳的檔案。

## 快速設定步驟

### 方法 1: 使用 Supabase Dashboard（推薦）

1. 進入 **Storage** → **posting-images** → **Policies**
2. 點擊 **New Policy**

#### 建立上傳政策：
- **Policy name**: `Allow uploads`
- **Allowed operation**: 勾選 **INSERT**
- **Target roles**: 選擇 `authenticated` 或 `public`
- **Policy definition**: `bucket_id = 'posting-images'`
- 點擊 **Review** → **Save policy**

#### 建立讀取政策：
- **Policy name**: `Allow public reads`
- **Allowed operation**: 勾選 **SELECT**
- **Target roles**: 選擇 `public`
- **Policy definition**: `bucket_id = 'posting-images'`
- 點擊 **Review** → **Save policy**

### 方法 2: 使用 SQL（進階）

在 Supabase SQL Editor 中執行：

```sql
-- 上傳政策
CREATE POLICY "Allow uploads to posting-images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'posting-images');

-- 讀取政策
CREATE POLICY "Allow public reads from posting-images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'posting-images');
```

## 操作說明對照表

| 操作 | 用途 | 是否必須 | 推薦角色 |
|------|------|---------|----------|
| **INSERT** | 上傳圖片 | ✅ 必須 | authenticated 或 public |
| **SELECT** | 讀取/顯示圖片 | ✅ 必須 | public（需要公開顯示） |
| **DELETE** | 刪除圖片 | ⚠️ 可選 | authenticated |
| **UPDATE** | 更新圖片 | ❌ 不需要 | - |

## 常見問題

### Q: 為什麼需要 SELECT 政策？

**A:** 因為圖片需要在前端頁面顯示，所以必須允許公開讀取。如果只允許 authenticated 讀取，未登入的使用者就看不到圖片了。

### Q: 可以只設定一個政策包含所有操作嗎？

**A:** 可以，但不推薦。分開設定可以更精確控制權限，也更安全。

### Q: 如果設定為 public，會不會有安全問題？

**A:** 
- **INSERT (public)**: 有風險，任何人都可以上傳。建議改為 `authenticated`
- **SELECT (public)**: 安全，因為圖片本來就需要公開顯示

### Q: 如何限制只有特定使用者可以上傳？

**A:** 在 Policy definition 中加入條件：
```sql
bucket_id = 'posting-images' AND auth.uid() = 'your-user-id'
```

## 測試政策設定

設定完成後，測試步驟：

1. **測試上傳**：
   - 訪問 `/postings/new`
   - 選擇圖片並上傳
   - 檢查是否成功

2. **測試讀取**：
   - 上傳成功後，複製圖片 URL
   - 在新分頁開啟 URL
   - 應該能看到圖片

3. **檢查 Storage**：
   - 在 Supabase Dashboard 的 Storage 中
   - 應該能看到上傳的圖片檔案

## 推薦設定（生產環境）

```sql
-- 上傳：只允許已認證使用者
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'posting-images');

-- 讀取：允許所有人（圖片需要公開顯示）
CREATE POLICY "Allow public reads"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'posting-images');
```

## 推薦設定（開發環境）

```sql
-- 上傳：允許所有人（方便測試）
CREATE POLICY "Allow public uploads"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'posting-images');

-- 讀取：允許所有人
CREATE POLICY "Allow public reads"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'posting-images');
```

