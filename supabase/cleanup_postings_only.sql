-- BookSwap 只刪除假刊登資料腳本
-- 此腳本只刪除刊登相關資料，保留其他所有資料（使用者、課程、分類等）

-- 1. 刪除刊登圖片
DELETE FROM posting_images;

-- 2. 刪除刊登
DELETE FROM posting;

-- 3. 刪除相關的互動資料（可選，如果不想保留）
-- 如果希望完全清理，可以取消以下註解：
-- DELETE FROM comment;
-- DELETE FROM favorite_posts;
-- DELETE FROM report WHERE report_type = 'posting';
-- DELETE FROM orders;
-- DELETE FROM review;

-- 4. 重置序列
ALTER SEQUENCE IF EXISTS posting_images_image_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS posting_p_id_seq RESTART WITH 1;

-- 顯示刪除結果
SELECT 
    'posting_images' as table_name, COUNT(*) as remaining_count FROM posting_images
UNION ALL
SELECT 'posting', COUNT(*) FROM posting;

-- 顯示其他相關表的資料數量（供參考）
SELECT 
    'comment' as table_name, COUNT(*) as remaining_count FROM comment
UNION ALL
SELECT 'favorite_posts', COUNT(*) FROM favorite_posts
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'review', COUNT(*) FROM review;

