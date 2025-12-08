# BookSwap 資料庫結構文件

## 概述

BookSwap 是一個二手書交易平台，使用 Supabase PostgreSQL 作為主要資料庫。本文件詳細說明所有資料表結構、關係、索引、視圖、觸發器和函數。

## 資料表結構

### 1. Department (科系)

儲存大學科系資訊。

| 欄位名稱 | 資料型態 | 約束 | 說明 |
|---------|---------|------|------|
| dept_id | SERIAL | PRIMARY KEY | 科系編號 |
| dept_name | VARCHAR(100) | NOT NULL, UNIQUE | 科系名稱 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 建立時間 |

### 2. Class (分類)

儲存物品分類資訊。

| 欄位名稱 | 資料型態 | 約束 | 說明 |
|---------|---------|------|------|
| class_id | SERIAL | PRIMARY KEY | 分類編號 |
| class_name | VARCHAR(50) | NOT NULL, UNIQUE | 分類名稱 |
| description | TEXT | | 分類描述 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 建立時間 |

### 3. Course (課程)

儲存課程資訊，關聯到科系和分類。

| 欄位名稱 | 資料型態 | 約束 | 說明 |
|---------|---------|------|------|
| course_id | SERIAL | PRIMARY KEY | 課程編號 |
| course_code | VARCHAR(20) | NOT NULL | 課程代碼 |
| course_name | VARCHAR(200) | NOT NULL | 課程名稱 |
| dept_id | INT | FOREIGN KEY → department | 科系編號 |
| class_id | INT | FOREIGN KEY → class | 分類編號 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 建立時間 |

**唯一約束：** (course_code, course_name)

### 4. User (使用者)

儲存使用者資訊。

| 欄位名稱 | 資料型態 | 約束 | 說明 |
|---------|---------|------|------|
| u_id | SERIAL | PRIMARY KEY | 使用者編號 |
| email | VARCHAR(255) | NOT NULL, UNIQUE | 電子郵件 |
| username | VARCHAR(50) | NOT NULL, UNIQUE | 使用者名稱 |
| password_hash | VARCHAR(255) | NOT NULL | 密碼雜湊 |
| balance | INT | DEFAULT 0, CHECK >= 0 | 錢包餘額 |
| is_admin | BOOLEAN | DEFAULT FALSE | 是否為管理員 |
| is_blocked | BOOLEAN | DEFAULT FALSE | 是否被封鎖 |
| violation_count | INT | DEFAULT 0 | 違規次數 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 建立時間 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新時間 |

### 5. Posting (刊登商品)

儲存商品刊登資訊。

| 欄位名稱 | 資料型態 | 約束 | 說明 |
|---------|---------|------|------|
| p_id | SERIAL | PRIMARY KEY | 刊登編號 |
| u_id | INT | NOT NULL, FOREIGN KEY → user | 刊登者編號 |
| title | VARCHAR(200) | NOT NULL | 標題 |
| description | TEXT | | 描述 |
| price | INT | NOT NULL, CHECK >= 0 | 價格 |
| status | VARCHAR(20) | DEFAULT 'listed', CHECK IN (...) | 狀態 |
| class_id | INT | FOREIGN KEY → class | 分類編號 |
| course_id | INT | FOREIGN KEY → course | 課程編號 |
| image_url | TEXT | | 圖片網址 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 建立時間 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新時間 |

**狀態值：** listed, reserved, sold, reported, removed

### 6. Comment (公開留言)

儲存刊登底下的公開留言。

| 欄位名稱 | 資料型態 | 約束 | 說明 |
|---------|---------|------|------|
| comment_id | SERIAL | PRIMARY KEY | 留言編號 |
| p_id | INT | NOT NULL, FOREIGN KEY → posting | 刊登編號 |
| u_id | INT | NOT NULL, FOREIGN KEY → user | 留言者編號 |
| content | TEXT | NOT NULL | 留言內容 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 建立時間 |

### 7. Report (舉報)

儲存使用者舉報資訊。

| 欄位名稱 | 資料型態 | 約束 | 說明 |
|---------|---------|------|------|
| report_id | SERIAL | PRIMARY KEY | 舉報編號 |
| reporter_id | INT | NOT NULL, FOREIGN KEY → user | 舉報者編號 |
| p_id | INT | NOT NULL, FOREIGN KEY → posting | 被舉報刊登編號 |
| reason | TEXT | NOT NULL | 舉報原因 |
| status | VARCHAR(20) | DEFAULT 'pending', CHECK IN (...) | 審核狀態 |
| reviewed_by | INT | FOREIGN KEY → user | 審核者編號 |
| reviewed_at | TIMESTAMP | | 審核時間 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 建立時間 |

**狀態值：** pending, approved, rejected

### 8. Orders (訂單)

儲存交易訂單資訊。

| 欄位名稱 | 資料型態 | 約束 | 說明 |
|---------|---------|------|------|
| order_id | SERIAL | PRIMARY KEY | 訂單編號 |
| buyer_id | INT | NOT NULL, FOREIGN KEY → user | 買家編號 |
| p_id | INT | NOT NULL, FOREIGN KEY → posting | 商品編號 |
| deal_price | INT | NOT NULL, CHECK >= 0 | 成交價格 |
| order_date | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 下單時間 |
| status | VARCHAR(20) | DEFAULT 'completed', CHECK IN (...) | 訂單狀態 |

**狀態值：** completed, cancelled

### 9. Transaction Record (金流紀錄)

儲存所有金流交易紀錄。

| 欄位名稱 | 資料型態 | 約束 | 說明 |
|---------|---------|------|------|
| record_id | SERIAL | PRIMARY KEY | 紀錄編號 |
| u_id | INT | NOT NULL, FOREIGN KEY → user | 使用者編號 |
| amount | INT | NOT NULL | 金額（正數=收入，負數=支出） |
| trans_type | VARCHAR(20) | NOT NULL, CHECK IN (...) | 交易類型 |
| trans_time | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 交易時間 |

**交易類型：** top_up (儲值), payment (付款), income (收入), refund (退款)

### 10. Review (評價)

儲存買家對賣家的評價。

| 欄位名稱 | 資料型態 | 約束 | 說明 |
|---------|---------|------|------|
| review_id | SERIAL | PRIMARY KEY | 評價編號 |
| order_id | INT | NOT NULL, FOREIGN KEY → orders | 訂單編號 |
| reviewer_id | INT | NOT NULL, FOREIGN KEY → user | 評價者編號 |
| target_id | INT | NOT NULL, FOREIGN KEY → user | 被評價者編號 |
| rating | INT | NOT NULL, CHECK 1-5 | 評分（1-5星） |
| comment | TEXT | | 文字評論 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 建立時間 |

### 11. Message (私訊)

儲存使用者之間的私訊。

| 欄位名稱 | 資料型態 | 約束 | 說明 |
|---------|---------|------|------|
| msg_id | SERIAL | PRIMARY KEY | 訊息編號 |
| sender_id | INT | NOT NULL, FOREIGN KEY → user | 寄件者編號 |
| receiver_id | INT | NOT NULL, FOREIGN KEY → user | 收件者編號 |
| content | TEXT | NOT NULL | 訊息內容 |
| sent_time | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 發送時間 |
| is_read | BOOLEAN | DEFAULT FALSE | 是否已讀 |

**約束：** sender_id != receiver_id

### 12. Favorite Posts (收藏)

儲存使用者收藏的刊登。

| 欄位名稱 | 資料型態 | 約束 | 說明 |
|---------|---------|------|------|
| u_id | INT | PRIMARY KEY, FOREIGN KEY → user | 使用者編號 |
| p_id | INT | PRIMARY KEY, FOREIGN KEY → posting | 刊登編號 |
| added_time | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 收藏時間 |

**主鍵：** (u_id, p_id) - 複合主鍵

### 13. Posting Images (刊登圖片)

儲存刊登的多張圖片，支援一個刊登有多張圖片。

| 欄位名稱 | 資料型態 | 約束 | 說明 |
|---------|---------|------|------|
| image_id | SERIAL | PRIMARY KEY | 圖片編號 |
| p_id | INT | NOT NULL, FOREIGN KEY → posting | 刊登編號 |
| image_url | TEXT | NOT NULL | 圖片網址 |
| display_order | INT | DEFAULT 0 | 顯示順序 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 建立時間 |

**設計說明：** 此表解決了原本 `posting.image_url` 只能儲存單一圖片的限制，現在一個刊登可以有多張圖片，並可指定顯示順序。

## 關係圖

```
Department (1) ──< (N) Course
Class (1) ──< (N) Course
Class (1) ──< (N) Posting
Course (1) ──< (N) Posting
User (1) ──< (N) Posting
User (1) ──< (N) Comment
User (1) ──< (N) Report (as reporter)
User (1) ──< (N) Report (as reviewer)
User (1) ──< (N) Orders (as buyer)
User (1) ──< (N) Transaction Record
User (1) ──< (N) Review (as reviewer)
User (1) ──< (N) Review (as target)
User (1) ──< (N) Message (as sender)
User (1) ──< (N) Message (as receiver)
User (N) ──< (N) Favorite Posts ──< (N) Posting
Posting (1) ──< (N) Comment
Posting (1) ──< (N) Report
Posting (1) ──< (N) Orders
Posting (1) ──< (N) Posting Images
Orders (1) ──< (N) Review
```

## 索引

所有外鍵欄位都已建立索引，常用查詢欄位也建立了索引：

- **User 表：** email, username, is_admin, is_blocked
- **Posting 表：** u_id, status, class_id, course_id, price, created_at, title (全文搜尋), description (全文搜尋)
- **Comment 表：** p_id, u_id, created_at
- **Report 表：** reporter_id, p_id, status, created_at
- **Orders 表：** buyer_id, p_id, status, order_date
- **Transaction Record 表：** u_id, trans_type, trans_time
- **Review 表：** order_id, reviewer_id, target_id, rating
- **Message 表：** sender_id, receiver_id, is_read, sent_time
- **Favorite Posts 表：** u_id, p_id, added_time
- **Posting Images 表：** p_id, display_order
- **Course 表：** dept_id, class_id, course_code

## 視圖

### 1. v_popular_books (熱門書籍)

顯示被收藏次數較多的書籍，包含收藏數、留言數等統計資訊。

**用途：** 首頁顯示熱門商品、推薦系統

### 2. v_user_statistics (使用者統計)

顯示每個使用者的完整統計資訊，包括：
- 刊登總數、已售出數量
- 訂單總數、總消費金額
- 總收入
- 平均評分、評價數量
- 收藏數量

**用途：** 使用者儀表板、管理員查詢

### 3. v_course_statistics (課程統計)

顯示每個課程的統計資訊，包括：
- 刊登總數、進行中刊登、已售出刊登
- 平均價格、最低價、最高價

**用途：** 課程分析、價格趨勢

### 4. v_class_statistics (分類統計)

顯示每個分類的統計資訊，包括：
- 刊登總數、進行中刊登、已售出刊登
- 賣家數量
- 總收入

**用途：** 分類分析、管理員報表

## 觸發器

### 1. update_violation_count

**觸發時機：** report 表更新前

**功能：** 當舉報狀態變為 approved 時，自動增加對應使用者的違規次數

**對應需求：** 自動記錄違規行為

### 2. auto_block_user

**觸發時機：** user 表更新前

**功能：** 當使用者違規次數達到 3 次時，自動封鎖帳號

**對應需求：** 自動封鎖違規使用者

### 3. update_posting_status_on_order

**觸發時機：** orders 表插入或更新後

**功能：** 當訂單狀態為 completed 時，自動更新對應 posting 的狀態為 sold

**對應需求：** 自動更新商品狀態

### 4. record_transaction_on_order

**觸發時機：** orders 表插入或更新後（當 status = 'completed'）

**功能：** 自動記錄買家的付款和賣家的收入到 transaction_record 表

**對應需求：** 自動記錄交易

### 5. update_updated_at_column

**觸發時機：** user 和 posting 表更新前

**功能：** 自動更新 updated_at 欄位為當前時間

**對應需求：** 自動維護時間戳記

## 函數

### 1. purchase_book(buyer_id, posting_id)

**功能：** 執行完整的購買流程，包含 ACID 特性

**流程：**
1. 檢查並鎖定 posting 記錄
2. 檢查商品狀態
3. 檢查買家餘額
4. 扣款（買家）
5. 入帳（賣家）
6. 更新商品狀態
7. 建立訂單

**返回：** JSON 格式的成功/失敗訊息

**對應需求：** 交易管理、ACID 特性

### 2. calculate_user_rating(user_id)

**功能：** 計算使用者的平均評分

**返回：** NUMERIC (平均評分，四捨五入到小數點後兩位)

### 3. get_user_sales_stats(user_id)

**功能：** 取得使用者的銷售統計資訊

**返回：** JSON 格式的統計資料（總售出數、總收入、進行中刊登、平均評分）

## 正規化分析

所有資料表都符合 BCNF (Boyce-Codd Normal Form)：

- **1NF：** 所有屬性都是 atomic（例如 favorite_posts 表解決了多值屬性問題）
- **2NF：** 沒有部分功能相依
- **3NF：** 沒有遞移相依
- **BCNF：** 所有功能相依的左方都是 superkey
- **4NF：** 沒有多值相依

## 資料量要求

- **總資料表數：** 13 張（超過要求的 10 張）
- **大量資料表：** posting 表有 12000+ 筆資料，transaction_record 表有 5000+ 筆資料
- **索引數量：** 30+ 個索引
- **視圖數量：** 4 個視圖
- **觸發器數量：** 5 個觸發器
- **函數數量：** 3 個函數

## 使用 Supabase

本專案使用 Supabase PostgreSQL 作為主要資料庫。所有 SQL 遷移檔案都位於 `supabase/migrations/` 目錄中，可以透過 Supabase Dashboard 或 CLI 執行。

### 執行遷移

1. 在 Supabase Dashboard 中，進入 SQL Editor
2. 依序執行以下檔案：
   - `001_initial_schema.sql`
   - `002_add_indexes.sql`
   - `003_add_views.sql`
   - `004_add_triggers.sql`
   - `005_add_functions.sql`
3. 執行 `supabase/seed.sql` 匯入假資料

### 環境變數

需要在 `.env` 檔案中設定：

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

