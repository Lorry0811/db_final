# BookSwap 快速開始指南

本指南將幫助你快速設定並啟動 BookSwap 專案。

## 前置需求

- Node.js 18+ 
- npm 或 yarn
- Supabase 帳號（免費版即可）

## 步驟 1: 建立 Supabase 專案

1. 前往 [Supabase](https://supabase.com) 註冊/登入
2. 建立新專案
3. 記下以下資訊：
   - Project URL
   - Anon Key
   - Service Role Key（在 Settings → API）

## 步驟 2: 執行資料庫遷移

1. 在 Supabase Dashboard 中，進入 **SQL Editor**
2. 依序執行以下檔案（複製貼上內容）：

   ```
   supabase/migrations/001_initial_schema.sql
   supabase/migrations/002_add_indexes.sql
   supabase/migrations/003_add_views.sql
   supabase/migrations/004_add_triggers.sql
   supabase/migrations/005_add_functions.sql
   ```

3. （可選）執行假資料生成：
   ```
   supabase/seed.sql
   ```
   ⚠️ 注意：假資料生成會需要一些時間，建議在測試環境執行

## 步驟 3: 設定前端專案

1. 進入專案目錄：
```bash
cd apps/web
```

2. 安裝依賴：
```bash
npm install
```

3. 設定環境變數：
```bash
# 複製範例檔案
cp .env.example .env.local
```

4. 編輯 `.env.local`，填入 Supabase 資訊：
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 步驟 4: 啟動開發伺服器

```bash
npm run dev
```

開啟瀏覽器訪問 [http://localhost:3000](http://localhost:3000)

## 步驟 5: 測試功能

### 測試資料庫連線

1. 訪問首頁，應該能看到熱門書籍和最新刊登
2. 如果沒有資料，檢查：
   - 是否執行了 seed.sql
   - Supabase 連線是否正常

### 測試註冊/登入

1. 訪問 `/register` 註冊新帳號
2. 訪問 `/login` 登入
3. 檢查資料庫 `user` 表是否有新記錄

### 測試刊登功能

1. 登入後訪問 `/postings/new`
2. 填寫表單並提交
3. 檢查資料庫 `posting` 表是否有新記錄

### 測試購買功能

1. 訪問商品詳情頁
2. 點擊「購買」按鈕
3. 檢查：
   - 訂單是否建立（`orders` 表）
   - 商品狀態是否更新為 `sold`
   - 交易紀錄是否建立（`transaction_record` 表）
   - 買賣雙方餘額是否正確更新

## 常見問題

### Q: 執行 SQL 遷移時出現錯誤

**A:** 檢查：
- 是否依序執行（001 → 002 → 003 → 004 → 005）
- 是否有語法錯誤
- Supabase 專案是否正常運作

### Q: 前端無法連線資料庫

**A:** 檢查：
- `.env.local` 檔案是否存在
- 環境變數是否正確填入
- Supabase 專案的 URL 和 Key 是否正確

### Q: 購買功能失敗

**A:** 檢查：
- 買家餘額是否足夠
- 商品狀態是否為 `listed`
- 資料庫函數 `purchase_book` 是否正確建立

### Q: 圖片無法顯示

**A:** 檢查：
- 圖片 URL 是否有效
- 如果使用 Supabase Storage，需要設定 Storage 政策

## 下一步

- 閱讀 [docs/db_schema.md](db_schema.md) 了解資料庫結構
- 閱讀 [docs/requirements_mapping.md](requirements_mapping.md) 了解課程要求對照
- 閱讀 [docs/implementation_status.md](implementation_status.md) 了解實作狀態

## 開發建議

1. **使用 Supabase Dashboard**
   - 查看資料表結構
   - 測試 SQL 查詢
   - 監控 API 請求

2. **開發流程**
   - 先在 Supabase SQL Editor 測試 SQL
   - 在 Repository 層實作資料存取
   - 在 Service 層實作業務邏輯
   - 在 API Routes 實作端點
   - 在前端頁面整合功能

3. **除錯技巧**
   - 使用 `console.log` 檢查資料
   - 使用 Supabase Dashboard 查看資料庫狀態
   - 檢查瀏覽器 Console 和 Network 標籤

## 需要幫助？

- 查看專案文件：`docs/` 目錄
- 查看程式碼註解
- 參考 Next.js 和 Supabase 官方文件

