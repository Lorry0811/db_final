-- ============================================================================
-- BookSwap 假資料批量生成腳本
-- ============================================================================
-- 說明：此腳本用於批量生成測試假資料
-- 使用方式：在 Supabase SQL Editor 中執行此腳本
-- 注意事項：
--   1. 執行前請確認所有資料表已建立（執行 001_initial_schema.sql）
--   2. 建議在測試環境中使用
--   3. 生成大量資料可能需要幾分鐘時間
--   4. 如需重新生成，請先執行 cleanup.sql 或 cleanup_safe.sql
-- ============================================================================

-- ============================================================================
-- 第一部分：基礎資料表（必須先建立）
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Department（科系）
-- ----------------------------------------------------------------------------
-- 生成方式：直接插入真實科系名稱
-- 數量：20 個科系
-- 調整方式：修改 VALUES 列表中的科系名稱
-- ----------------------------------------------------------------------------

INSERT INTO department (dept_name) VALUES
('資訊管理學系'),
('資訊工程學系'),
('電機工程學系'),
('機械工程學系'),
('法律學系'),
('經濟學系'),
('企業管理學系'),
('會計學系'),
('財務金融學系'),
('外國語文學系'),
('中國文學系'),
('歷史學系'),
('哲學系'),
('數學系'),
('物理學系'),
('化學系'),
('生命科學系'),
('心理學系'),
('社會學系'),
('政治學系')
ON CONFLICT (dept_name) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. Class（分類）
-- ----------------------------------------------------------------------------
-- 生成方式：直接插入分類名稱和描述
-- 數量：8 個分類
-- 調整方式：修改 VALUES 列表中的分類名稱和描述
-- ----------------------------------------------------------------------------

INSERT INTO class (class_name, description) VALUES
('教科書', '各類課程教科書'),
('3C產品', '電腦、手機、平板等電子產品'),
('生活用品', '日常生活用品'),
('服飾', '衣服、鞋子、配件'),
('運動用品', '運動器材、運動服飾'),
('書籍', '非教科書類書籍'),
('家具', '桌椅、櫃子等家具'),
('其他', '其他類別')
ON CONFLICT (class_name) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 3. Course（課程）
-- ----------------------------------------------------------------------------
-- 生成方式：插入課程代碼、課程名稱，關聯到科系和分類
-- 數量：20 個課程
-- 調整方式：修改 VALUES 列表中的課程資訊
-- ----------------------------------------------------------------------------

INSERT INTO course (course_code, course_name, dept_id, class_id)
SELECT 
    course_code,
    course_name,
    d.dept_id,
    (SELECT class_id FROM class WHERE class_name = '教科書' LIMIT 1)
FROM (VALUES
    ('IM1001', '資料庫管理', 1),
    ('IM1002', '系統分析與設計', 1),
    ('IM1003', '程式設計', 1),
    ('IM1004', '網路概論', 1),
    ('IM1005', '資訊安全', 1),
    ('CS1001', '資料結構', 2),
    ('CS1002', '演算法', 2),
    ('CS1003', '作業系統', 2),
    ('CS1004', '計算機網路', 2),
    ('EE1001', '電路學', 3),
    ('EE1002', '電子學', 3),
    ('ME1001', '工程數學', 4),
    ('ME1002', '材料力學', 4),
    ('LAW1001', '民法總則', 5),
    ('LAW1002', '刑法總則', 5),
    ('ECO1001', '經濟學原理', 6),
    ('ECO1002', '個體經濟學', 6),
    ('BA1001', '管理學', 7),
    ('BA1002', '行銷管理', 7),
    ('ACC1001', '會計學原理', 8)
) AS courses(course_code, course_name, dept_id)
JOIN department d ON courses.dept_id = d.dept_id
ON CONFLICT (course_code, course_name) DO NOTHING;

-- ============================================================================
-- 第二部分：使用者相關表
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 4. User（使用者）
-- ----------------------------------------------------------------------------
-- 生成方式：使用 PL/pgSQL 迴圈批量生成
-- 數量：可調整（預設 1000 個）
-- 調整方式：修改 FOR i IN 1..1000 LOOP 中的數字
-- 注意事項：
--   - 密碼雜湊是模擬的，不能直接用於登入
--   - 第一個使用者預設為管理員
--   - 如需真實登入，請使用 create_admin.sql 建立管理員帳號
-- ----------------------------------------------------------------------------

-- 建立輔助函數：生成隨機字串
CREATE OR REPLACE FUNCTION random_string(length INT)
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INT;
BEGIN
    FOR i IN 1..length LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::INT, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 生成使用者假資料
DO $$
DECLARE
    i INT;
    email_val TEXT;
    username_val TEXT;
BEGIN
    -- 調整此數字來改變生成的使用者數量
    FOR i IN 1..1000 LOOP
        email_val := 'user' || i || '@example.com';
        username_val := 'user' || i;
        
        INSERT INTO "user" (email, username, password_hash, balance, is_admin, is_blocked)
        VALUES (
            email_val,
            username_val,
            '$2a$10$' || random_string(53), -- 模擬 bcrypt hash（不能直接用於登入）
            floor(random() * 10000)::INT, -- 隨機餘額 0-10000
            CASE WHEN i = 1 THEN TRUE ELSE FALSE END, -- 第一個使用者是管理員
            FALSE -- 預設未封鎖
        )
        ON CONFLICT (email) DO NOTHING;
    END LOOP;
END $$;

-- ============================================================================
-- 第三部分：商品相關表
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 5. Posting（刊登）
-- ----------------------------------------------------------------------------
-- 生成方式：使用 PL/pgSQL 迴圈批量生成
-- 數量：可調整（預設 12000 筆）
-- 調整方式：
--   - 修改 FOR i IN 1..12000 LOOP 中的數字
--   - 修改狀態分配比例（60% listed, 20% sold, ...）
--   - 修改價格範圍
-- ----------------------------------------------------------------------------

DO $$
DECLARE
    i INT;
    user_count INT;
    class_count INT;
    course_count INT;
    random_user_id INT;
    random_class_id INT;
    random_course_id INT;
    status_val TEXT;
    title_val TEXT;
    price_val INT;
BEGIN
    -- 取得數量
    SELECT COUNT(*) INTO user_count FROM "user";
    SELECT COUNT(*) INTO class_count FROM class;
    SELECT COUNT(*) INTO course_count FROM course;
    
    -- 調整此數字來改變生成的刊登數量
    FOR i IN 1..12000 LOOP
        -- 隨機選擇使用者
        random_user_id := floor(random() * user_count + 1)::INT;
        
        -- 隨機選擇分類
        random_class_id := floor(random() * class_count + 1)::INT;
        
        -- 如果是教科書分類，隨機選擇課程
        IF random_class_id = 1 THEN
            random_course_id := floor(random() * course_count + 1)::INT;
        ELSE
            random_course_id := NULL;
        END IF;
        
        -- 隨機狀態分配（可調整比例）
        status_val := CASE 
            WHEN random() < 0.6 THEN 'listed'      -- 60% 刊登中
            WHEN random() < 0.8 THEN 'sold'        -- 20% 已售出
            WHEN random() < 0.9 THEN 'reserved'   -- 10% 已預訂
            ELSE 'removed'                          -- 10% 已下架
        END;
        
        -- 生成標題（根據分類）
        title_val := CASE random_class_id
            WHEN 1 THEN '二手教科書 - ' || (SELECT course_name FROM course WHERE course_id = random_course_id LIMIT 1) || ' ' || i
            WHEN 2 THEN '二手' || (ARRAY['iPhone', 'MacBook', 'iPad', '筆電', '手機'])[floor(random() * 5 + 1)::INT] || ' ' || i
            ELSE '二手物品 ' || i
        END;
        
        -- 隨機價格（根據分類設定不同範圍）
        price_val := CASE random_class_id
            WHEN 1 THEN floor(random() * 800 + 100)::INT        -- 教科書 100-900
            WHEN 2 THEN floor(random() * 20000 + 1000)::INT      -- 3C 產品 1000-21000
            ELSE floor(random() * 1000 + 50)::INT                 -- 其他 50-1050
        END;
        
        INSERT INTO posting (
            u_id, title, description, price, status, class_id, course_id,
            created_at
        ) VALUES (
            random_user_id,
            title_val,
            '這是商品描述 ' || i || '。商品狀況良好，歡迎詢問。',
            price_val,
            status_val,
            random_class_id,
            CASE WHEN random_class_id = 1 THEN random_course_id ELSE NULL END,
            CURRENT_TIMESTAMP - (random() * INTERVAL '365 days') -- 隨機過去 365 天內
        );
    END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- 6. Posting Images（刊登圖片）
-- ----------------------------------------------------------------------------
-- 生成方式：為每個刊登生成 1-3 張圖片
-- 數量：每個刊登 1-3 張（隨機）
-- 調整方式：
--   - 修改 image_count 的範圍（目前是 1-3）
--   - 替換圖片 URL 為真實的 Supabase Storage URL
-- 注意事項：
--   - 目前使用 placeholder 圖片服務
--   - 實際使用時應替換為真實圖片 URL
-- ----------------------------------------------------------------------------

DO $$
DECLARE
    i INT;
    posting_count INT;
    random_posting_id INT;
    image_count INT;
    j INT;
BEGIN
    SELECT COUNT(*) INTO posting_count FROM posting;
    
    FOR i IN 1..posting_count LOOP
        random_posting_id := i;
        
        -- 每個刊登隨機生成 1-3 張圖片（可調整範圍）
        image_count := floor(random() * 3 + 1)::INT;
        
        FOR j IN 1..image_count LOOP
            INSERT INTO posting_images (p_id, image_url, display_order, created_at)
            VALUES (
                random_posting_id,
                -- 使用 placeholder 圖片服務（實際使用時應替換為 Supabase Storage URL）
                'https://picsum.photos/800/600?random=' || (random_posting_id * 10 + j),
                j - 1, -- display_order 從 0 開始
                CURRENT_TIMESTAMP - (random() * INTERVAL '365 days')
            );
        END LOOP;
    END LOOP;
END $$;

-- ============================================================================
-- 第四部分：互動相關表
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 7. Comment（留言）
-- ----------------------------------------------------------------------------
-- 生成方式：使用 PL/pgSQL 迴圈批量生成
-- 數量：可調整（預設 5000 筆）
-- 調整方式：
--   - 修改 FOR i IN 1..5000 LOOP 中的數字
--   - 修改留言內容陣列
-- ----------------------------------------------------------------------------

DO $$
DECLARE
    i INT;
    posting_count INT;
    user_count INT;
    random_posting_id INT;
    random_user_id INT;
BEGIN
    SELECT COUNT(*) INTO posting_count FROM posting;
    SELECT COUNT(*) INTO user_count FROM "user";
    
    -- 調整此數字來改變生成的留言數量
    FOR i IN 1..5000 LOOP
        random_posting_id := floor(random() * posting_count + 1)::INT;
        random_user_id := floor(random() * user_count + 1)::INT;
        
        INSERT INTO comment (p_id, u_id, content, created_at)
        VALUES (
            random_posting_id,
            random_user_id,
            -- 留言內容陣列（可修改）
            (ARRAY['有興趣', '想要', '請問還有嗎？', '可以議價嗎？', '方便面交嗎？'])[floor(random() * 5 + 1)::INT],
            CURRENT_TIMESTAMP - (random() * INTERVAL '180 days') -- 隨機過去 180 天內
        );
    END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- 8. Favorite Posts（收藏）
-- ----------------------------------------------------------------------------
-- 生成方式：使用 PL/pgSQL 迴圈批量生成
-- 數量：可調整（預設 8000 筆）
-- 調整方式：修改 FOR i IN 1..8000 LOOP 中的數字
-- 注意事項：只收藏狀態為 listed 的刊登
-- ----------------------------------------------------------------------------

DO $$
DECLARE
    i INT;
    posting_count INT;
    user_count INT;
    random_posting_id INT;
    random_user_id INT;
BEGIN
    -- 只選擇狀態為 listed 的刊登
    SELECT COUNT(*) INTO posting_count FROM posting WHERE status = 'listed';
    SELECT COUNT(*) INTO user_count FROM "user";
    
    -- 調整此數字來改變生成的收藏數量
    FOR i IN 1..8000 LOOP
        random_posting_id := floor(random() * posting_count + 1)::INT;
        random_user_id := floor(random() * user_count + 1)::INT;
        
        INSERT INTO favorite_posts (u_id, p_id, added_time)
        VALUES (
            random_user_id,
            random_posting_id,
            CURRENT_TIMESTAMP - (random() * INTERVAL '90 days') -- 隨機過去 90 天內
        )
        ON CONFLICT (u_id, p_id) DO NOTHING; -- 避免重複收藏
    END LOOP;
END $$;

-- ============================================================================
-- 第五部分：交易相關表
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 9. Orders（訂單）
-- ----------------------------------------------------------------------------
-- 生成方式：使用 PL/pgSQL 迴圈批量生成
-- 數量：可調整（預設 3000 筆）
-- 調整方式：修改 FOR i IN 1..3000 LOOP 中的數字
-- 注意事項：
--   - 只選擇狀態為 sold 的刊登
--   - 確保買家和賣家不是同一人
--   - 成交價格與刊登價格一致
-- ----------------------------------------------------------------------------

DO $$
DECLARE
    i INT;
    posting_count INT;
    user_count INT;
    random_posting_id INT;
    random_buyer_id INT;
    seller_id INT;
    posting_price INT;
BEGIN
    -- 只選擇狀態為 sold 的刊登
    SELECT COUNT(*) INTO posting_count FROM posting WHERE status = 'sold';
    SELECT COUNT(*) INTO user_count FROM "user";
    
    -- 調整此數字來改變生成的訂單數量
    FOR i IN 1..3000 LOOP
        -- 選擇已售出的商品
        SELECT p_id, u_id, price INTO random_posting_id, seller_id, posting_price
        FROM posting
        WHERE status = 'sold'
        ORDER BY RANDOM()
        LIMIT 1;
        
        -- 選擇不同的買家（不能是賣家）
        SELECT u_id INTO random_buyer_id
        FROM "user"
        WHERE u_id != seller_id
        ORDER BY RANDOM()
        LIMIT 1;
        
        IF random_posting_id IS NOT NULL AND random_buyer_id IS NOT NULL THEN
            INSERT INTO orders (buyer_id, p_id, deal_price, status, order_date)
            VALUES (
                random_buyer_id,
                random_posting_id,
                posting_price, -- 成交價格與刊登價格一致
                'completed', -- 預設為已完成
                CURRENT_TIMESTAMP - (random() * INTERVAL '200 days') -- 隨機過去 200 天內
            )
            ON CONFLICT DO NOTHING;
        END IF;
    END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- 10. Transaction Record（交易紀錄）
-- ----------------------------------------------------------------------------
-- 生成方式：使用 PL/pgSQL 迴圈批量生成
-- 數量：可調整（預設 5000 筆）
-- 調整方式：
--   - 修改 FOR i IN 1..5000 LOOP 中的數字
--   - 修改交易類型分配
--   - 修改金額範圍
-- ----------------------------------------------------------------------------

DO $$
DECLARE
    i INT;
    user_count INT;
    random_user_id INT;
    trans_type_val TEXT;
    amount_val INT;
BEGIN
    SELECT COUNT(*) INTO user_count FROM "user";
    
    -- 調整此數字來改變生成的交易紀錄數量
    FOR i IN 1..5000 LOOP
        random_user_id := floor(random() * user_count + 1)::INT;
        
        -- 隨機選擇交易類型（可調整分配）
        trans_type_val := (ARRAY['top_up', 'payment', 'income', 'refund'])[floor(random() * 4 + 1)::INT];
        
        -- 根據交易類型設定金額範圍（可調整）
        amount_val := CASE trans_type_val
            WHEN 'top_up' THEN floor(random() * 5000 + 100)::INT      -- 儲值 100-5100
            WHEN 'payment' THEN -floor(random() * 2000 + 100)::INT   -- 付款 -100 至 -2100（負數）
            WHEN 'income' THEN floor(random() * 2000 + 100)::INT     -- 收入 100-2100
            ELSE floor(random() * 500 + 10)::INT                      -- 退款 10-510
        END;
        
        INSERT INTO transaction_record (u_id, amount, trans_type, trans_time)
        VALUES (
            random_user_id,
            amount_val,
            trans_type_val,
            CURRENT_TIMESTAMP - (random() * INTERVAL '300 days') -- 隨機過去 300 天內
        );
    END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- 11. Review（評價）
-- ----------------------------------------------------------------------------
-- 生成方式：使用 PL/pgSQL 迴圈批量生成
-- 數量：可調整（預設 2000 筆）
-- 調整方式：
--   - 修改 FOR i IN 1..2000 LOOP 中的數字
--   - 修改評價內容陣列
-- 注意事項：
--   - 只選擇狀態為 completed 的訂單
--   - 評價者必須是買家，被評價者必須是賣家
--   - 每個訂單只能評價一次
-- ----------------------------------------------------------------------------

DO $$
DECLARE
    i INT;
    order_count INT;
    random_order_id INT;
    buyer_id INT;
    seller_id INT;
BEGIN
    -- 只選擇狀態為 completed 的訂單
    SELECT COUNT(*) INTO order_count FROM orders WHERE status = 'completed';
    
    -- 調整此數字來改變生成的評價數量
    FOR i IN 1..2000 LOOP
        SELECT 
            o.order_id,
            o.buyer_id,
            p.u_id
        INTO random_order_id, buyer_id, seller_id
        FROM orders o
        JOIN posting p ON o.p_id = p.p_id
        WHERE o.status = 'completed'
        ORDER BY RANDOM()
        LIMIT 1;
        
        IF random_order_id IS NOT NULL THEN
            INSERT INTO review (order_id, reviewer_id, target_id, rating, comment, created_at)
            VALUES (
                random_order_id,
                buyer_id, -- 評價者是買家
                seller_id, -- 被評價者是賣家
                floor(random() * 5 + 1)::INT, -- 隨機 1-5 顆星
                -- 評價內容陣列（可修改）
                CASE floor(random() * 5 + 1)::INT
                    WHEN 1 THEN '商品狀況良好，賣家很友善'
                    WHEN 2 THEN '交易順利，推薦'
                    WHEN 3 THEN '還不錯'
                    WHEN 4 THEN '可以更好'
                    ELSE '普通'
                END,
                CURRENT_TIMESTAMP - (random() * INTERVAL '150 days') -- 隨機過去 150 天內
            )
            ON CONFLICT DO NOTHING; -- 避免重複評價
        END IF;
    END LOOP;
END $$;

-- ============================================================================
-- 第六部分：通訊相關表
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 12. Message（私訊）
-- ----------------------------------------------------------------------------
-- 生成方式：使用 PL/pgSQL 迴圈批量生成
-- 數量：可調整（預設 3000 筆）
-- 調整方式：
--   - 修改 FOR i IN 1..3000 LOOP 中的數字
--   - 修改訊息內容陣列
--   - 修改已讀機率（目前是 70%）
-- 注意事項：確保發送者和接收者不是同一人
-- ----------------------------------------------------------------------------

DO $$
DECLARE
    i INT;
    user_count INT;
    random_sender_id INT;
    random_receiver_id INT;
BEGIN
    SELECT COUNT(*) INTO user_count FROM "user";
    
    -- 調整此數字來改變生成的私訊數量
    FOR i IN 1..3000 LOOP
        random_sender_id := floor(random() * user_count + 1)::INT;
        
        -- 選擇不同的接收者（不能是自己）
        SELECT u_id INTO random_receiver_id
        FROM "user"
        WHERE u_id != random_sender_id
        ORDER BY RANDOM()
        LIMIT 1;
        
        INSERT INTO message (sender_id, receiver_id, content, is_read, sent_time)
        VALUES (
            random_sender_id,
            random_receiver_id,
            -- 訊息內容陣列（可修改）
            (ARRAY['你好', '請問商品還在嗎？', '可以議價嗎？', '方便面交嗎？', '謝謝'])[floor(random() * 5 + 1)::INT],
            random() < 0.7, -- 70% 機率為已讀（可調整）
            CURRENT_TIMESTAMP - (random() * INTERVAL '60 days') -- 隨機過去 60 天內
        );
    END LOOP;
END $$;

-- ============================================================================
-- 第七部分：管理相關表
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 13. Report（舉報）
-- ----------------------------------------------------------------------------
-- 生成方式：使用 PL/pgSQL 迴圈批量生成
-- 數量：可調整（預設 200 筆）
-- 調整方式：
--   - 修改 FOR i IN 1..200 LOOP 中的數字
--   - 修改舉報原因陣列
--   - 修改舉報狀態分配
-- 注意事項：
--   - 目前只生成 posting 類型的舉報
--   - 如需生成 comment 或 order_violation 類型，需要修改腳本邏輯
-- ----------------------------------------------------------------------------

DO $$
DECLARE
    i INT;
    posting_count INT;
    user_count INT;
    random_posting_id INT;
    random_reporter_id INT;
BEGIN
    SELECT COUNT(*) INTO posting_count FROM posting;
    SELECT COUNT(*) INTO user_count FROM "user";
    
    -- 調整此數字來改變生成的舉報數量
    FOR i IN 1..200 LOOP
        random_posting_id := floor(random() * posting_count + 1)::INT;
        random_reporter_id := floor(random() * user_count + 1)::INT;
        
        INSERT INTO report (
            reporter_id, 
            p_id, 
            report_type, -- 目前只生成 posting 類型
            reason, 
            status, 
            created_at
        )
        VALUES (
            random_reporter_id,
            random_posting_id,
            'posting', -- 舉報類型：posting（可改為 comment 或 order_violation）
            -- 舉報原因陣列（可修改）
            (ARRAY['疑似詐騙', '違禁品', '不當內容', '重複刊登', '價格異常'])[floor(random() * 5 + 1)::INT],
            -- 舉報狀態分配（可調整）
            (ARRAY['pending', 'approved', 'rejected'])[floor(random() * 3 + 1)::INT],
            CURRENT_TIMESTAMP - (random() * INTERVAL '30 days') -- 隨機過去 30 天內
        );
    END LOOP;
END $$;

-- ============================================================================
-- 資料統計查詢
-- ============================================================================
-- 執行以下查詢來查看各表的資料數量
-- ============================================================================

SELECT 'Department' AS table_name, COUNT(*) AS count FROM department
UNION ALL
SELECT 'Class', COUNT(*) FROM class
UNION ALL
SELECT 'Course', COUNT(*) FROM course
UNION ALL
SELECT 'User', COUNT(*) FROM "user"
UNION ALL
SELECT 'Posting', COUNT(*) FROM posting
UNION ALL
SELECT 'Posting Images', COUNT(*) FROM posting_images
UNION ALL
SELECT 'Comment', COUNT(*) FROM comment
UNION ALL
SELECT 'Favorite Posts', COUNT(*) FROM favorite_posts
UNION ALL
SELECT 'Orders', COUNT(*) FROM orders
UNION ALL
SELECT 'Transaction Record', COUNT(*) FROM transaction_record
UNION ALL
SELECT 'Review', COUNT(*) FROM review
UNION ALL
SELECT 'Message', COUNT(*) FROM message
UNION ALL
SELECT 'Report', COUNT(*) FROM report
ORDER BY table_name;

-- ============================================================================
-- 腳本執行完成
-- ============================================================================
-- 預設生成資料統計：
--   - Department: 20
--   - Class: 8
--   - Course: 20
--   - User: 1000
--   - Posting: 12000
--   - Posting Images: ~24000 (每個刊登 1-3 張)
--   - Comment: 5000
--   - Favorite Posts: 8000
--   - Orders: 3000
--   - Transaction Record: 5000
--   - Review: 2000
--   - Message: 3000
--   - Report: 200
-- 總計：約 60,000+ 筆資料
-- ============================================================================

