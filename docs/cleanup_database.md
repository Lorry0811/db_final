# 清理 Supabase 資料庫假資料指南

## 📋 概述

本指南說明如何刪除 Supabase 資料庫中的假資料（mock data），同時保留資料表結構。

## ⚠️ 重要警告

- **此操作不可逆！** 刪除的資料無法恢復
- 建議在刪除前先備份資料庫
- 確認你刪除的是測試環境，不是生產環境

## 🛠️ 方法一：使用 Supabase Dashboard（推薦）

### 步驟 1: 登入 Supabase Dashboard
1. 前往 [Supabase Dashboard](https://supabase.com/dashboard)
2. 選擇你的專案

### 步驟 2: 開啟 SQL Editor
1. 在左側選單點擊 **SQL Editor**
2. 點擊 **New query**

### 步驟 3: 選擇清理腳本

#### 選項 A：完全清理（刪除所有資料）
複製 `supabase/cleanup.sql` 的內容到 SQL Editor，然後執行。

#### 選項 B：安全清理（保留課程、分類、管理員）
複製 `supabase/cleanup_safe.sql` 的內容到 SQL Editor，然後執行。

### 步驟 4: 執行 SQL
1. 確認 SQL 語句正確
2. 點擊 **Run** 或按 `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
3. 查看執行結果

## 🛠️ 方法二：使用 Supabase CLI（進階）

如果你有安裝 Supabase CLI：

```bash
# 連線到 Supabase 專案
supabase db execute --file supabase/cleanup.sql
```

## 📝 清理腳本說明

### `cleanup.sql` - 完全清理
- 刪除所有假資料
- 刪除所有使用者（包括管理員）
- 可選：刪除課程、分類、部門資料
- 重置所有序列（ID 從 1 開始）

### `cleanup_safe.sql` - 安全清理（推薦）
- 刪除使用者產生的資料（刊登、留言、訂單等）
- **保留**管理員帳號
- **保留**課程、分類、部門資料
- 只重置相關序列

## 🔍 驗證清理結果

執行清理腳本後，腳本會自動顯示各表的剩餘資料數量：

```
table_name          | remaining_count
--------------------+-----------------
transaction_record | 0
review              | 0
orders              | 0
message             | 0
comment             | 0
favorite_posts      | 0
report              | 0
posting_images      | 0
posting             | 0
user                | 0
```

如果所有 `remaining_count` 都是 0，表示清理成功。

## 🎯 手動清理特定資料

如果你只想清理特定類型的資料，可以使用以下 SQL：

### 只刪除刊登資料（推薦）
使用 `supabase/cleanup_postings_only.sql` 腳本，或執行以下 SQL：
```sql
DELETE FROM posting_images;
DELETE FROM posting;
ALTER SEQUENCE posting_images_image_id_seq RESTART WITH 1;
ALTER SEQUENCE posting_p_id_seq RESTART WITH 1;
```

**注意**：此操作只刪除刊登資料，會保留：
- ✅ 使用者帳號
- ✅ 課程、分類、部門
- ✅ 留言、收藏、訂單、評價等（如果需要的話，可以手動刪除）

### 只刪除使用者資料（保留管理員）
```sql
DELETE FROM "user" WHERE is_admin = false;
```

### 只刪除測試使用者（根據 email 模式）
```sql
DELETE FROM "user" WHERE email LIKE '%test%' OR email LIKE '%example%';
```

## 💾 備份資料（建議）

在刪除前，建議先備份資料：

### 方法 1: 使用 Supabase Dashboard
1. 進入 **Database** → **Backups**
2. 點擊 **Create backup**
3. 等待備份完成

### 方法 2: 使用 SQL 匯出資料
```sql
-- 匯出特定表的資料（範例：user 表）
COPY "user" TO '/path/to/backup/user_backup.csv' WITH CSV HEADER;
```

## 🔄 重新匯入假資料

清理完成後，如果需要重新匯入假資料：

1. 在 Supabase Dashboard 開啟 SQL Editor
2. 複製 `supabase/seed.sql` 的內容
3. 執行 SQL 腳本

## ❓ 常見問題

### Q: 刪除後資料表結構會保留嗎？
**A:** 是的，`DELETE` 只刪除資料，不會刪除資料表結構。

### Q: 如何完全重置資料庫（包括表結構）？
**A:** 需要刪除所有遷移檔案並重新執行。不建議這樣做，除非是全新開始。

### Q: 刪除後 ID 會從 1 開始嗎？
**A:** 如果執行了 `ALTER SEQUENCE ... RESTART WITH 1`，新的資料 ID 會從 1 開始。

### Q: 可以只刪除特定時間範圍的資料嗎？
**A:** 可以，在 DELETE 語句中加上 WHERE 條件：
```sql
DELETE FROM posting WHERE created_at < '2025-01-01';
```

## 📌 注意事項

1. **外鍵約束**：刪除順序很重要，必須先刪除子表，再刪除父表
2. **序列重置**：重置序列後，新資料的 ID 會從 1 開始
3. **管理員帳號**：使用 `cleanup_safe.sql` 可以保留管理員帳號
4. **課程分類**：如果課程和分類是真實資料，請使用 `cleanup_safe.sql`

## 🚀 快速開始

最簡單的方式：
1. 開啟 Supabase Dashboard → SQL Editor
2. 複製 `supabase/cleanup_safe.sql` 的內容
3. 執行
4. 檢查結果

完成！

