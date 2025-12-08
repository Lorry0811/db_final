# BookSwap Web Application

BookSwap 是一個二手書交易平台的 Web 應用程式，使用 Next.js 14 + TypeScript + Supabase 建構。

## 環境設定

1. 複製環境變數檔案：
```bash
cp .env.example .env.local
```

2. 填入 Supabase 連線資訊：
- `NEXT_PUBLIC_SUPABASE_URL`: 你的 Supabase 專案 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 你的 Supabase Anon Key
- `SUPABASE_SERVICE_ROLE_KEY`: 你的 Supabase Service Role Key（僅後端使用）

## 安裝依賴

```bash
npm install
```

## 執行開發伺服器

```bash
npm run dev
```

開啟瀏覽器訪問 [http://localhost:3000](http://localhost:3000)

## 專案結構

```
apps/web/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 認證相關頁面
│   ├── (user)/            # 使用者功能頁面
│   ├── (admin)/           # 管理員功能頁面
│   └── api/               # API Routes
├── components/            # React 元件
├── lib/                   # 工具函數
│   ├── supabase/         # Supabase 客戶端
│   └── utils/             # 通用工具
└── types/                 # TypeScript 類型定義
```

## 資料庫設定

請先執行 `supabase/migrations/` 目錄中的 SQL 遷移檔案來建立資料庫結構。
