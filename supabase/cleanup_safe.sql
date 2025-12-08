-- BookSwap 資料庫安全清理腳本（保留課程、分類、部門資料）
-- 此腳本只刪除使用者產生的資料，保留系統設定的課程和分類

-- 1. 刪除交易相關資料
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

-- 4. 刪除使用者資料（但保留管理員帳號）
-- 只刪除一般使用者，保留 is_admin = true 的帳號
DELETE FROM "user" WHERE is_admin = false;

-- 重置序列
ALTER SEQUENCE IF EXISTS transaction_record_record_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS review_review_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS orders_order_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS message_msg_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS comment_c_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS posting_images_image_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS posting_p_id_seq RESTART WITH 1;
-- 注意：user 序列不重置，因為可能還有管理員帳號

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

