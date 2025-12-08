-- BookSwap 資料庫清理腳本
-- 此腳本會刪除所有假資料，但保留資料表結構
-- 使用前請確認：此操作不可逆！

-- 注意：刪除順序很重要，必須先刪除有外鍵關聯的子表，再刪除父表

-- 1. 刪除交易相關資料（最外層）
DELETE FROM transaction_record;
DELETE FROM review;
DELETE FROM orders;

-- 2. 刪除互動相關資料
DELETE FROM message;
DELETE FROM comment;
DELETE FROM favorite_posts;
DELETE FROM report;

-- 3. 刪除刊登相關資料
DELETE FROM posting_images;
DELETE FROM posting;

-- 4. 刪除使用者資料（保留管理員帳號，如果有的話）
-- 注意：如果只想刪除測試資料，可以加上條件
-- 例如：DELETE FROM "user" WHERE email LIKE '%test%' OR email LIKE '%example%';
DELETE FROM "user";

-- 5. 刪除課程和分類資料（可選，如果這些是假資料）
-- 如果課程和分類是真實資料，請不要執行這兩行
-- DELETE FROM course;
-- DELETE FROM class;
-- DELETE FROM department;

-- 重置序列（讓 ID 從 1 開始）
-- 注意：PostgreSQL 使用 SERIAL 或 IDENTITY，需要重置序列
ALTER SEQUENCE IF EXISTS transaction_record_record_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS review_review_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS orders_order_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS message_msg_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS comment_c_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS posting_images_image_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS posting_p_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS "user"_u_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS course_course_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS class_class_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS department_dept_id_seq RESTART WITH 1;

-- 顯示刪除結果
SELECT 
    'transaction_record' as table_name, COUNT(*) as remaining_count FROM transaction_record
UNION ALL
SELECT 'review', COUNT(*) FROM review
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'message', COUNT(*) FROM message
UNION ALL
SELECT 'comment', COUNT(*) FROM comment
UNION ALL
SELECT 'favorite_posts', COUNT(*) FROM favorite_posts
UNION ALL
SELECT 'report', COUNT(*) FROM report
UNION ALL
SELECT 'posting_images', COUNT(*) FROM posting_images
UNION ALL
SELECT 'posting', COUNT(*) FROM posting
UNION ALL
SELECT 'user', COUNT(*) FROM "user";

