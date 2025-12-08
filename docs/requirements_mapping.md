# 課程要求對照表

本文件對照 DB114-1 資料庫管理課程的專案要求，說明 BookSwap 系統如何滿足各項要求。

## 1. 系統架構要求

### 1.1 前後端系統 ✓

**要求：** 完成一個有前端系統（使用者操作介面）、後端系統（後臺演算）和資料庫的完整資訊系統

**實作位置：**
- **前端：** `apps/web/` - Next.js App Router + TypeScript + React
- **後端：** `apps/web/app/api/` - Next.js API Routes
- **資料庫：** Supabase PostgreSQL

**Demo 步驟：**
1. 啟動 Next.js 開發伺服器
2. 開啟瀏覽器訪問 `http://localhost:3000`
3. 展示前端頁面和後端 API 功能

### 1.2 Client-Server 架構 ✓

**要求：** 遵循 client-server 架構，後端和資料庫在伺服器上，前端可以在另一臺機器執行

**實作位置：**
- 後端 API 使用 Next.js API Routes，可獨立部署
- 前端使用 Next.js，可獨立部署
- 資料庫使用 Supabase（雲端服務）

**Demo 步驟：**
1. 展示可以在不同機器上執行前端和後端
2. 開啟至少兩個前端程式連線同一個後端系統
3. 展示資料同步與併行控制

### 1.3 雙資料庫架構 ✓

**要求：** 包含至少兩個資料庫，一個關聯式資料庫（交易資料），一個 NoSQL 資料庫（行為資料）

**實作位置：**
- **關聯式資料庫：** Supabase PostgreSQL（所有交易資料）
- **NoSQL 資料庫：** Supabase Realtime / MongoDB（搜尋紀錄、瀏覽紀錄）

**Demo 步驟：**
1. 展示 PostgreSQL 中的交易資料（orders, transaction_record）
2. 展示 NoSQL 中的行為資料（search_logs, view_logs）
3. 展示行為資料的分析功能

## 2. 關聯式資料庫要求

### 2.1 資料表數量 ✓

**要求：** 至少 10 張以上的資料表

**實作位置：** `supabase/migrations/001_initial_schema.sql`

**資料表清單（12 張）：**
1. department (科系)
2. class (分類)
3. course (課程)
4. user (使用者)
5. posting (刊登商品)
6. comment (公開留言)
7. report (舉報)
8. orders (訂單)
9. transaction_record (金流紀錄)
10. review (評價)
11. message (私訊)
12. favorite_posts (收藏)

**Demo 步驟：**
1. 在 Supabase Dashboard 中展示所有資料表
2. 執行 `SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';`

### 2.2 大量資料 ✓

**要求：** 至少有一張資料表中有上萬筆資料

**實作位置：** `supabase/seed.sql`

**資料量：**
- **posting 表：** 12000+ 筆
- **transaction_record 表：** 5000+ 筆
- **comment 表：** 5000+ 筆
- **favorite_posts 表：** 8000+ 筆

**Demo 步驟：**
1. 執行 `SELECT COUNT(*) FROM posting;` 顯示資料量
2. 展示查詢大量資料的效能

### 2.3 資料表設計 ✓

**要求：** 良好的資料庫綱要設計，正規化考量

**實作位置：** `supabase/migrations/001_initial_schema.sql`

**正規化：**
- 符合 BCNF (Boyce-Codd Normal Form)
- favorite_posts 表解決多值屬性問題（1NF）
- 沒有部分功能相依（2NF）
- 沒有遞移相依（3NF）
- 沒有多值相依（4NF）

**Demo 步驟：**
1. 展示 ERD 和資料表結構
2. 說明正規化設計考量
3. 展示 favorite_posts 表如何解決多值屬性問題

### 2.4 索引 ✓

**要求：** 幫資料表建立索引

**實作位置：** `supabase/migrations/002_add_indexes.sql`

**索引類型：**
- 外鍵索引（所有外鍵欄位）
- 常用查詢欄位索引（status, price, created_at 等）
- 全文搜尋索引（title, description）

**Demo 步驟：**
1. 展示索引建立前後的查詢效能差異
2. 執行 `EXPLAIN ANALYZE` 展示查詢計畫
3. 展示索引使用情況

### 2.5 交易管理和併行控制 ✓

**要求：** 良好地處理交易管理和併行控制

**實作位置：** 
- `supabase/migrations/005_add_functions.sql` - purchase_book() 函數
- `apps/web/src/services/order.service.ts` - 後端交易管理

**實作內容：**
- 使用 PostgreSQL 交易（BEGIN/COMMIT/ROLLBACK）
- 使用 SELECT FOR UPDATE 鎖定記錄
- 檢查餘額、扣款、入帳的原子性操作
- 併行控制測試（多個使用者同時購買）

**Demo 步驟：**
1. 展示購買流程的 SQL 交易
2. 開啟兩個前端，同時嘗試購買同一商品
3. 展示只有一個交易成功，另一個回滾
4. 展示餘額和商品狀態的一致性

### 2.6 SQL 查詢能力 ✓

**要求：** 有能力寫 SQL 處理資料，做出有一定難度和意義的分析

**實作位置：**
- `supabase/migrations/003_add_views.sql` - 複雜查詢視圖
- `apps/web/src/repositories/` - Repository 層的 SQL 查詢

**查詢類型：**
1. **複雜 JOIN：** 多表關聯查詢（posting, course, class, user）
2. **聚合函數：** COUNT, SUM, AVG, GROUP BY, HAVING
3. **子查詢：** 找出被收藏次數超過 N 次的熱門書籍
4. **視圖查詢：** 使用預定義視圖進行複雜分析

**Demo 步驟：**
1. 展示複雜 JOIN 查詢（搜尋特定課程的書籍）
2. 展示聚合函數查詢（分類統計、賣家統計）
3. 展示子查詢（熱門書籍查詢）
4. 展示視圖查詢（使用者統計、課程統計）

### 2.7 設計原則 ✓

**要求：** 評估上課教過的重要設計原則，例如使用 status 欄位避免 Delete

**實作位置：** `supabase/migrations/001_initial_schema.sql`

**設計原則：**
- **軟刪除：** posting 表使用 status 欄位（removed）而非 DELETE
- **時間戳記：** created_at, updated_at 自動維護
- **約束條件：** CHECK 約束確保資料完整性
- **外鍵約束：** 確保資料一致性

**Demo 步驟：**
1. 展示下架刊登時只更新 status，不刪除記錄
2. 展示可以查詢歷史記錄
3. 展示約束條件如何防止無效資料

## 3. 進階資料庫功能

### 3.1 視圖 (Views) ✓

**要求：** 至少一個視圖

**實作位置：** `supabase/migrations/003_add_views.sql`

**視圖清單（4 個）：**
1. `v_popular_books` - 熱門書籍（被收藏次數統計）
2. `v_user_statistics` - 使用者統計（完整統計資訊）
3. `v_course_statistics` - 課程統計（價格、數量統計）
4. `v_class_statistics` - 分類統計（收入、賣家統計）

**Demo 步驟：**
1. 執行 `SELECT * FROM v_popular_books LIMIT 10;`
2. 執行 `SELECT * FROM v_user_statistics WHERE u_id = 1;`
3. 展示視圖在 API 和前端的使用

### 3.2 觸發器 (Triggers) ✓

**要求：** 至少一個觸發器

**實作位置：** `supabase/migrations/004_add_triggers.sql`

**觸發器清單（5 個）：**
1. `update_violation_count` - 自動更新違規次數
2. `auto_block_user` - 自動封鎖帳號（違規 3 次）
3. `update_posting_status_on_order` - 自動更新商品狀態
4. `record_transaction_on_order` - 自動記錄交易
5. `update_updated_at_column` - 自動更新時間戳記

**Demo 步驟：**
1. 建立一個舉報並審核通過，展示違規次數自動增加
2. 當違規次數達到 3 次時，展示帳號自動封鎖
3. 建立訂單時，展示商品狀態自動更新為 sold
4. 展示交易紀錄自動建立

### 3.3 儲存程序/函數 (Stored Procedures/Functions) ✓

**要求：** 至少一個儲存程序或函數

**實作位置：** `supabase/migrations/005_add_functions.sql`

**函數清單（3 個）：**
1. `purchase_book(buyer_id, posting_id)` - 購買書籍的完整交易流程
2. `calculate_user_rating(user_id)` - 計算使用者平均評分
3. `get_user_sales_stats(user_id)` - 取得使用者銷售統計

**Demo 步驟：**
1. 執行 `SELECT purchase_book(1, 100);` 展示購買流程
2. 展示函數返回的 JSON 結果
3. 展示交易失敗時的自動回滾

## 4. 使用者角色

### 4.1 一般使用者 (User) ✓

**要求：** 系統應該涵蓋一般使用者

**實作位置：**
- 前端：`apps/web/app/(user)/`
- 後端：`apps/web/app/api/users/`, `apps/web/app/api/postings/`

**功能：**
- 註冊、登入
- 新增、管理刊登
- 搜尋、瀏覽刊登
- 收藏、留言
- 購買、評價
- 私訊
- 舉報

**Demo 步驟：**
1. 註冊新帳號
2. 新增一則刊登
3. 搜尋商品
4. 收藏商品
5. 購買商品
6. 評價賣家

### 4.2 業務經營者 (Admin) ✓

**要求：** 系統應該涵蓋業務經營者

**實作位置：**
- 前端：`apps/web/app/(admin)/`
- 後端：`apps/web/app/api/admin/`

**功能：**
- 管理課程（增刪改查）
- 管理分類（增刪改查）
- 查詢使用者資訊
- 查詢刊登資訊
- 審核舉報
- 查看統計報表

**Demo 步驟：**
1. 以管理員身份登入
2. 新增一門課程
3. 新增一個分類
4. 查詢使用者列表
5. 審核舉報
6. 查看統計報表

## 5. 功能完整性

### 5.1 CRUD 操作 ✓

**要求：** 基本的增刪改查功能

**實作位置：** 所有主要實體的 API 端點

**涵蓋實體：**
- User（使用者）
- Posting（刊登）
- Course（課程）
- Class（分類）
- Comment（留言）
- Order（訂單）
- Review（評價）
- Message（私訊）

**Demo 步驟：**
1. 展示每個實體的完整 CRUD 操作
2. 展示前端表單和列表頁面
3. 展示 API 的 RESTful 設計

### 5.2 非簡單查詢 ✓

**要求：** 非簡單的查詢（複雜 JOIN、聚合、子查詢）

**實作位置：**
- `supabase/migrations/003_add_views.sql`
- `apps/web/src/repositories/`

**查詢範例：**
1. 搜尋特定課程的書籍（JOIN 多表）
2. 統計各分類的刊登數量（GROUP BY）
3. 找出被收藏超過 10 次的熱門書籍（子查詢 + HAVING）
4. 查詢賣家總收入（SUM + JOIN）

**Demo 步驟：**
1. 執行複雜查詢 SQL
2. 展示查詢結果
3. 展示查詢在前端的應用

## 6. 效能優化

### 6.1 索引優化 ✓

**要求：** 建立索引並展示效能提升

**實作位置：** `supabase/migrations/002_add_indexes.sql`

**優化內容：**
- 外鍵索引
- 常用查詢欄位索引
- 全文搜尋索引

**Demo 步驟：**
1. 執行查詢並記錄時間（無索引）
2. 建立索引
3. 再次執行相同查詢並記錄時間（有索引）
4. 展示效能提升（例如：0.8 秒 → 0.05 秒）
5. 使用 `EXPLAIN ANALYZE` 展示查詢計畫

## 7. Demo 完整流程

### 7.1 系統啟動

1. 啟動 Next.js 開發伺服器：`npm run dev`
2. 開啟瀏覽器訪問 `http://localhost:3000`
3. 確認資料庫連線正常

### 7.2 一般使用者流程

1. **註冊帳號**
   - 訪問 `/register`
   - 填寫註冊表單
   - 提交並登入

2. **新增刊登**
   - 訪問 `/postings/new`
   - 填寫商品資訊
   - 選擇分類和課程
   - 提交刊登

3. **搜尋商品**
   - 訪問首頁或 `/postings`
   - 使用搜尋功能（分類、課程、關鍵字、價格）
   - 查看搜尋結果

4. **收藏商品**
   - 在商品詳情頁點擊「收藏」
   - 查看「我的收藏」頁面

5. **購買商品**
   - 選擇商品並點擊「購買」
   - 系統檢查餘額
   - 執行交易（展示交易管理）
   - 查看訂單

6. **評價賣家**
   - 在訂單詳情頁填寫評價
   - 提交評價

### 7.3 管理員流程

1. **登入管理後台**
   - 以管理員身份登入
   - 訪問 `/admin`

2. **管理課程**
   - 訪問 `/admin/courses`
   - 新增一門課程
   - 編輯課程資訊
   - 刪除課程

3. **管理分類**
   - 訪問 `/admin/classes`
   - 新增分類
   - 編輯分類

4. **審核舉報**
   - 訪問 `/admin/reports`
   - 查看待審核舉報
   - 審核舉報（展示觸發器效果：違規次數增加、自動封鎖）

5. **查看統計**
   - 訪問 `/admin/statistics`
   - 查看各種統計報表（使用視圖）

### 7.4 資料庫功能展示

1. **視圖查詢**
   - 在 Supabase SQL Editor 執行視圖查詢
   - 展示視圖結果

2. **觸發器測試**
   - 建立舉報並審核通過
   - 查看違規次數自動增加
   - 當違規次數達到 3 次時，查看帳號自動封鎖

3. **函數測試**
   - 執行 `purchase_book()` 函數
   - 展示交易流程
   - 展示失敗時的回滾

4. **索引效能**
   - 執行慢查詢（無索引）
   - 建立索引
   - 再次執行查詢（有索引）
   - 展示效能提升

5. **併行控制**
   - 開啟兩個瀏覽器視窗
   - 同時嘗試購買同一商品
   - 展示只有一個交易成功

## 8. 技術文件

### 8.1 資料庫結構文件

**位置：** `docs/db_schema.md`

**內容：**
- 所有資料表結構
- 關係圖
- 索引說明
- 視圖說明
- 觸發器說明
- 函數說明

### 8.2 API 文件

**位置：** `docs/api.md`（待建立）

**內容：**
- 所有 API 端點
- 請求/回應格式
- 認證方式
- 錯誤處理

### 8.3 README

**位置：** `README.md`

**內容：**
- 專案介紹
- 環境設定
- 執行方式
- 功能說明

## 總結

BookSwap 系統完全滿足 DB114-1 資料庫管理課程的所有要求：

- ✓ 12 張資料表（超過 10 張）
- ✓ 上萬筆資料（posting 表 12000+ 筆）
- ✓ 良好的正規化設計（BCNF）
- ✓ 30+ 個索引
- ✓ 4 個視圖
- ✓ 5 個觸發器
- ✓ 3 個函數（包含交易管理）
- ✓ 複雜 SQL 查詢（JOIN、聚合、子查詢）
- ✓ 交易管理和併行控制
- ✓ 一般使用者和業務經營者功能
- ✓ 完整的 CRUD 操作
- ✓ 效能優化展示

