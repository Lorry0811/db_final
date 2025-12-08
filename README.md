# BookSwap - 二手書交易平台

BookSwap 是一個提供給大學學生刊登及尋找二手教科書與物品的平台，使用 Supabase PostgreSQL 作為主要資料庫，Next.js + TypeScript 作為前後端框架。

## 專案概述

本專案是 DB114-1 資料庫管理課程的期末專案，完整實作了一個包含前端、後端和資料庫的資訊系統。

### 主要功能

- **一般使用者 (User)**
  - 註冊、登入
  - 新增、管理刊登
  - 搜尋、瀏覽刊登（支援多條件篩選）
  - 收藏、留言
  - 購買、評價
  - 私訊
  - 舉報

- **業務經營者 (Admin)**
  - 管理課程（增刪改查）
  - 管理分類（增刪改查）
  - 查詢使用者資訊
  - 查詢刊登資訊
  - 審核舉報
  - 查看統計報表

## 技術棧

- **前端：** Next.js 14 (App Router) + TypeScript + React + Tailwind CSS
- **後端：** Next.js API Routes + TypeScript
- **資料庫：** Supabase PostgreSQL
- **認證：** Supabase Auth

## 專案結構

```
final/
├── apps/
│   └── web/              # Next.js 應用
│       ├── app/          # 頁面和 API Routes
│       ├── components/   # React 元件
│       ├── lib/         # 工具函數和 Supabase 客戶端
│       └── types/       # TypeScript 類型定義
├── supabase/
│   ├── migrations/       # SQL 遷移檔案
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_add_indexes.sql
│   │   ├── 003_add_views.sql
│   │   ├── 004_add_triggers.sql
│   │   ├── 005_add_functions.sql
│   │   ├── 006_extend_report_table.sql
│   │   └── 007_fix_report_p_id_nullable.sql
│   ├── seed.sql         # 假資料生成（完整版）
│   ├── generate_fake_data.sql  # 假資料生成（格式化版）
│   ├── cleanup.sql      # 完整清理腳本
│   ├── cleanup_safe.sql # 安全清理腳本
│   ├── create_admin.sql # 建立管理員帳號
│   └── create_admin_quick.sql  # 快速建立管理員帳號
├── docs/
│   ├── db_schema.md     # 資料庫結構文件
│   ├── requirements_mapping.md  # 課程要求對照表
│   ├── feature_checklist.md  # 功能檢查清單
│   ├── implementation_status.md  # 實作狀態
│   ├── quick_start.md   # 快速開始指南
│   ├── cleanup_database.md  # 資料庫清理說明
│   ├── create_admin_account.md  # 建立管理員帳號說明
│   └── supabase_storage_setup.md  # Supabase Storage 設定
├── 功能說明.md          # 完整功能操作說明
├── 假資料生成說明.md    # 假資料生成說明
└── README.md
```

## 快速開始

### 1. 資料庫設定

1. 在 Supabase 建立新專案
2. 在 Supabase Dashboard 的 SQL Editor 中，依序執行以下檔案：
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_add_indexes.sql`
   - `supabase/migrations/003_add_views.sql`
   - `supabase/migrations/004_add_triggers.sql`
   - `supabase/migrations/005_add_functions.sql`
   - `supabase/migrations/006_extend_report_table.sql`
   - `supabase/migrations/007_fix_report_p_id_nullable.sql`
3. （可選）執行假資料生成腳本：
   - `supabase/seed.sql` - 完整版假資料生成
   - `supabase/generate_fake_data.sql` - 格式化版假資料生成（推薦）
   - 詳細說明請參考 [假資料生成說明.md](假資料生成說明.md)
4. （可選）建立管理員帳號：
   - 執行 `supabase/create_admin_quick.sql` 快速建立
   - 或參考 [docs/create_admin_account.md](docs/create_admin_account.md) 手動建立

### 2. 前端設定

1. 進入 `apps/web` 目錄：
```bash
cd apps/web
```

2. 安裝依賴：
```bash
npm install
```

3. 設定環境變數：
```bash
cp .env.example .env.local
```

4. 編輯 `.env.local`，填入 Supabase 連線資訊：
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```
   - `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 可在 Supabase Dashboard > Settings > API 中找到
   - `SUPABASE_SERVICE_ROLE_KEY` 可在 Supabase Dashboard > Settings > API > service_role key 中找到

5. （可選）設定 Supabase Storage（用於圖片上傳）：
   - 參考 [docs/supabase_storage_setup.md](docs/supabase_storage_setup.md)

6. 啟動開發伺服器：
```bash
npm run dev
```

7. 開啟瀏覽器訪問 [http://localhost:3000](http://localhost:3000)

### 3. 快速開始指南

詳細的設定和操作說明請參考：
- [docs/quick_start.md](docs/quick_start.md) - 快速開始指南
- [功能說明.md](功能說明.md) - 完整功能操作說明
- [假資料生成說明.md](假資料生成說明.md) - 假資料生成說明

## 資料庫結構

本專案包含 **13 張資料表**：

1. department (科系)
2. class (分類)
3. course (課程)
4. user (使用者)
5. posting (刊登商品)
6. posting_images (刊登圖片) - 支援多張圖片
7. comment (公開留言)
8. report (舉報)
9. orders (訂單)
10. transaction_record (金流紀錄)
11. review (評價)
12. message (私訊)
13. favorite_posts (收藏)

詳細資料庫結構請參考 [docs/db_schema.md](docs/db_schema.md)

## 課程要求對照

本專案完全滿足 DB114-1 資料庫管理課程的所有要求：

- ✓ 13 張資料表（超過 10 張）
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

詳細對照請參考 [docs/requirements_mapping.md](docs/requirements_mapping.md)

## 功能特色

### 資料庫進階功能

- **視圖 (Views)：** 4 個視圖用於複雜查詢和報表
- **觸發器 (Triggers)：** 5 個觸發器自動化業務邏輯
- **函數 (Functions)：** 3 個函數包含完整的交易管理
- **索引優化：** 30+ 個索引優化查詢效能

### 交易管理

- 完整的購買流程（ACID 特性）
- 自動檢查餘額
- 自動扣款和入帳
- 自動更新商品狀態
- 自動記錄交易
- 併行控制（多使用者同時購買）

### 圖片上傳

- 支援多張圖片上傳（每個刊登最多 5 張）
- 圖片顯示順序控制
- 使用 Supabase Storage 儲存
- 支援本機上傳、圖片壓縮、預覽功能

### 認證系統

- 完整的註冊、登入、登出功能
- Session 管理（localStorage + HTTP-only cookies）
- 路由保護和權限控制
- 管理員和一般使用者角色區分

### 使用者體驗

- 響應式設計（支援手機、平板、電腦）
- 現代化的 UI 設計（Tailwind CSS）
- 即時狀態更新（購買、收藏、留言等）
- 完整的錯誤處理和載入狀態提示

## 開發狀態

### ✅ 已完成（100%）

- [x] 資料庫結構設計（13 張表）
- [x] SQL 遷移檔案（7 個遷移腳本）
- [x] 索引、視圖、觸發器、函數
- [x] 假資料生成腳本
- [x] 後端 API 開發（所有 CRUD 操作）
- [x] 前端頁面開發（所有功能頁面）
- [x] 認證系統整合（註冊、登入、登出、權限控制）
- [x] 使用者功能（刊登、搜尋、收藏、留言、購買、評價、私訊、舉報）
- [x] 管理員功能（課程管理、分類管理、使用者管理、刊登管理、舉報審核、統計報表）
- [x] 交易管理（購買流程、餘額管理、交易紀錄）
- [x] 圖片上傳功能（多圖片、Supabase Storage）
- [x] 文檔撰寫（功能說明、資料庫結構、操作指南）

### 📊 完成度統計

- **資料庫層**: 100% ✅
- **後端 API**: 100% ✅
- **前端頁面**: 100% ✅
- **前端功能**: 100% ✅
- **認證系統**: 100% ✅
- **使用者功能**: 100% ✅
- **管理員功能**: 100% ✅

詳細功能清單請參考 [docs/feature_checklist.md](docs/feature_checklist.md)

## 文檔

### 主要文檔

- [功能說明.md](功能說明.md) - 完整的功能操作說明（使用者手冊）
- [假資料生成說明.md](假資料生成說明.md) - 假資料批量生成指南
- [docs/db_schema.md](docs/db_schema.md) - 資料庫結構詳細說明
- [docs/feature_checklist.md](docs/feature_checklist.md) - 功能檢查清單
- [docs/requirements_mapping.md](docs/requirements_mapping.md) - 課程要求對照表

### 設定指南

- [docs/quick_start.md](docs/quick_start.md) - 快速開始指南
- [docs/create_admin_account.md](docs/create_admin_account.md) - 建立管理員帳號
- [docs/cleanup_database.md](docs/cleanup_database.md) - 資料庫清理說明
- [docs/supabase_storage_setup.md](docs/supabase_storage_setup.md) - Supabase Storage 設定

## 授權

本專案為課程作業專案。

## 作者

- 資管三 B11705061 羅立宸
- 資管三 B12705011 黃元翔
- 資管三 B12705057 陳以倫

## 專案狀態

🎉 **專案已完成** - 所有功能皆已實作並測試，可進行完整的功能演示。

