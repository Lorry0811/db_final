# 建立管理員帳號指南

## 📋 概述

本指南說明如何在 BookSwap 系統中建立管理員帳號。

## 🚀 快速方法（使用預設密碼）

### 步驟 1: 執行 SQL 腳本

1. 開啟 Supabase Dashboard → SQL Editor
2. 複製以下 SQL：

```sql
-- 建立管理員帳號（預設密碼：admin123）
INSERT INTO "user" (
    email,
    username,
    password_hash,
    balance,
    is_admin,
    is_blocked,
    violation_count
) VALUES (
    'admin@bookswap.com',
    'admin',
    '$2a$10$5xj7M52T5Cf7dsGjtiASjuEYCdYDdFDXBp4Jq/XTQHvNBZsKm3wUS',
    0,
    true,
    false,
    0
)
ON CONFLICT (email) DO UPDATE
SET is_admin = true;
```

3. 執行 SQL

### 步驟 2: 登入測試

- Email: `admin@bookswap.com`
- Password: `admin123`

⚠️ **重要**：登入後請立即修改密碼！

## 🎯 方法一：建立新的管理員帳號（自訂密碼）

### 步驟 1: 生成密碼雜湊

#### 選項 A: 使用 Node.js（推薦）

在專案目錄執行：

```bash
cd apps/web
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('your-password', 10).then(hash => console.log(hash));"
```

將 `your-password` 替換為你想設定的密碼。

#### 選項 B: 使用線上工具

1. 前往 [bcrypt-generator.com](https://bcrypt-generator.com/)
2. 輸入你的密碼
3. 選擇 rounds: 10
4. 複製生成的雜湊值

### 步驟 2: 執行 SQL

```sql
INSERT INTO "user" (
    email,
    username,
    password_hash,
    balance,
    is_admin,
    is_blocked,
    violation_count
) VALUES (
    'your-email@example.com',  -- 修改為你的 email
    'your-username',           -- 修改為你的使用者名稱
    '$2a$10$YOUR_HASHED_PASSWORD_HERE',  -- 貼上步驟 1 生成的雜湊值
    0,
    true,
    false,
    0
)
ON CONFLICT (email) DO UPDATE
SET is_admin = true;
```

## 🎯 方法二：將現有使用者升級為管理員

如果你已經有一個一般使用者帳號：

```sql
UPDATE "user"
SET is_admin = true
WHERE email = 'your-email@example.com';
```

## 🔐 修改管理員密碼

### 步驟 1: 生成新密碼的雜湊值

```bash
cd apps/web
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('new-password', 10).then(hash => console.log(hash));"
```

### 步驟 2: 更新密碼

```sql
UPDATE "user"
SET password_hash = '$2a$10$NEW_HASHED_PASSWORD'
WHERE email = 'admin@bookswap.com';
```

## ✅ 驗證管理員帳號

執行以下 SQL 確認管理員已建立：

```sql
SELECT 
    u_id,
    email,
    username,
    is_admin,
    is_blocked,
    created_at
FROM "user"
WHERE is_admin = true;
```

## 🧪 測試管理員功能

1. 使用管理員帳號登入
2. 應該在 Header 看到：
   - 使用者名稱
   - 「管理員」標籤
   - 「登出」按鈕
   - 「管理後台」連結
3. 可以訪問 `/admin` 頁面
4. 可以執行管理員專屬功能

## 📝 快速建立腳本

已準備好 SQL 腳本：
- `supabase/create_admin.sql` - 完整說明版本
- `supabase/create_admin_quick.sql` - 快速版本（使用預設密碼）

## 🔒 安全建議

1. **使用強密碼**：至少 8 個字元，包含大小寫字母、數字和特殊字元
2. **立即修改預設密碼**：如果使用預設密碼，登入後立即修改
3. **限制管理員數量**：只建立必要的管理員帳號
4. **定期檢查**：定期檢查管理員帳號列表

## ❓ 常見問題

### Q: 如何移除管理員權限？

```sql
UPDATE "user"
SET is_admin = false
WHERE email = 'admin@bookswap.com';
```

### Q: 可以有多個管理員嗎？

可以，只要將多個使用者的 `is_admin` 設為 `true` 即可。

### Q: 管理員帳號會被自動封鎖嗎？

不會，管理員帳號不受違規次數限制。但如果手動設定 `is_blocked = true`，管理員也會被封鎖。

### Q: 忘記管理員密碼怎麼辦？

可以使用 SQL 更新密碼（見「修改管理員密碼」章節）。

## 🚨 重要提醒

- 預設密碼 `admin123` 僅供測試使用
- 生產環境請使用強密碼
- 定期備份資料庫
- 不要將管理員帳號資訊提交到 Git
