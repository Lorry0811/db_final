-- 建立管理員帳號腳本
-- 使用方法：在 Supabase Dashboard 的 SQL Editor 中執行此腳本

-- 方法 1: 直接建立新的管理員帳號
-- 注意：需要先安裝 bcryptjs 或使用其他方式雜湊密碼
-- 這裡提供一個範例，實際使用時請修改 email、username 和 password_hash

-- 建立管理員帳號（密碼需要先雜湊）
-- 預設密碼：admin123（請在建立後立即修改）
-- 可以使用線上工具雜湊密碼：https://bcrypt-generator.com/
-- 或使用 Node.js: const hash = await bcrypt.hash('admin123', 10);

INSERT INTO "user" (
    email,
    username,
    password_hash,
    balance,
    is_admin,
    is_blocked,
    violation_count
) VALUES (
    'lori930811@gmail.com',  -- 管理員 email（請修改為你的 email）
    'admin-lorry',               -- 管理員使用者名稱（請修改）
    '$2a$12$YEXdgK26jP/9kasQUpnBM.D0Va9rkap8hV/zpKFnye3pc8ep7grMu',  -- 這是 'admin123' 的雜湊值（請修改）
    0,
    true,                  -- 設為管理員
    false,
    0
)
ON CONFLICT (email) DO NOTHING;

-- 方法 2: 將現有使用者升級為管理員
-- 將指定 email 的使用者設為管理員
UPDATE "user"
SET is_admin = true
WHERE email = 'your-email@example.com';  -- 請修改為你的 email

-- 方法 3: 使用 Supabase Auth（如果使用 Supabase Auth 系統）
-- 如果專案使用 Supabase Auth，可以在 Supabase Dashboard 中：
-- 1. 進入 Authentication → Users
-- 2. 建立新使用者或選擇現有使用者
-- 3. 在資料庫中手動更新 user 表的 is_admin 欄位

-- 驗證管理員帳號
SELECT 
    u_id,
    email,
    username,
    is_admin,
    is_blocked,
    created_at
FROM "user"
WHERE is_admin = true;

