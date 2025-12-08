-- 快速建立管理員帳號腳本
-- 預設帳號：admin@bookswap.com / admin123
-- 請在建立後立即修改密碼！

-- 注意：這個腳本使用預設密碼 'admin123' 的雜湊值
-- 實際使用時，請先執行以下 Node.js 命令生成你自己的密碼雜湊：
-- node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('your-password', 10).then(hash => console.log(hash));"

-- 建立管理員帳號
INSERT INTO "user" (
    email,
    username,
    password_hash,
    balance,
    is_admin,
    is_blocked,
    violation_count
) VALUES (
    'admin@bookswap.com',  -- 管理員 email（可以修改）
    'admin',               -- 管理員使用者名稱（可以修改）
    '$2a$10$5xj7M52T5Cf7dsGjtiASjuEYCdYDdFDXBp4Jq/XTQHvNBZsKm3wUS',  -- 'admin123' 的雜湊值（請修改為你自己的密碼雜湊）
    0,
    true,                  -- 設為管理員
    false,
    0
)
ON CONFLICT (email) DO UPDATE
SET is_admin = true;  -- 如果 email 已存在，升級為管理員

-- 驗證管理員帳號
SELECT 
    u_id,
    email,
    username,
    is_admin,
    is_blocked,
    created_at
FROM "user"
WHERE email = 'admin@bookswap.com';

