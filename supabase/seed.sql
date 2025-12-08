-- 假資料生成腳本
-- 注意：這個腳本會生成大量假資料，建議在測試環境中使用

-- 1. 插入科系資料（真實資料）
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

-- 2. 插入分類資料
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

-- 3. 插入課程資料（真實課程）
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

-- 4. 生成使用者假資料（使用函數生成）
-- 先建立一個函數來生成隨機字串
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

-- 插入使用者（生成 1000 個使用者）
DO $$
DECLARE
    i INT;
    email_val TEXT;
    username_val TEXT;
BEGIN
    FOR i IN 1..1000 LOOP
        email_val := 'user' || i || '@example.com';
        username_val := 'user' || i;
        
        INSERT INTO "user" (email, username, password_hash, balance, is_admin, is_blocked)
        VALUES (
            email_val,
            username_val,
            '$2a$10$' || random_string(53), -- 模擬 bcrypt hash
            floor(random() * 10000)::INT, -- 隨機餘額 0-10000
            CASE WHEN i = 1 THEN TRUE ELSE FALSE END, -- 第一個使用者是管理員
            FALSE
        )
        ON CONFLICT (email) DO NOTHING;
    END LOOP;
END $$;

-- 5. 生成刊登假資料（生成 10000+ 筆）
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
        
        -- 隨機狀態（大部分是 listed）
        status_val := CASE 
            WHEN random() < 0.6 THEN 'listed'
            WHEN random() < 0.8 THEN 'sold'
            WHEN random() < 0.9 THEN 'reserved'
            ELSE 'removed'
        END;
        
        -- 生成標題
        title_val := CASE random_class_id
            WHEN 1 THEN '二手教科書 - ' || (SELECT course_name FROM course WHERE course_id = random_course_id LIMIT 1) || ' ' || i
            WHEN 2 THEN '二手' || (ARRAY['iPhone', 'MacBook', 'iPad', '筆電', '手機'])[floor(random() * 5 + 1)::INT] || ' ' || i
            ELSE '二手物品 ' || i
        END;
        
        -- 隨機價格
        price_val := CASE random_class_id
            WHEN 1 THEN floor(random() * 800 + 100)::INT -- 教科書 100-900
            WHEN 2 THEN floor(random() * 20000 + 1000)::INT -- 3C 產品 1000-21000
            ELSE floor(random() * 1000 + 50)::INT -- 其他 50-1050
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
            CURRENT_TIMESTAMP - (random() * INTERVAL '365 days')
        );
    END LOOP;
END $$;

-- 5.5. 生成刊登圖片假資料（為每個刊登生成 1-3 張圖片）
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
        
        -- 每個刊登隨機生成 1-3 張圖片
        image_count := floor(random() * 3 + 1)::INT;
        
        FOR j IN 1..image_count LOOP
            INSERT INTO posting_images (p_id, image_url, display_order, created_at)
            VALUES (
                random_posting_id,
                'https://picsum.photos/800/600?random=' || (random_posting_id * 10 + j), -- 使用 placeholder 圖片服務
                j - 1, -- display_order 從 0 開始
                CURRENT_TIMESTAMP - (random() * INTERVAL '365 days')
            );
        END LOOP;
    END LOOP;
END $$;

-- 6. 生成留言假資料（生成 5000 筆）
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
    
    FOR i IN 1..5000 LOOP
        random_posting_id := floor(random() * posting_count + 1)::INT;
        random_user_id := floor(random() * user_count + 1)::INT;
        
        INSERT INTO comment (p_id, u_id, content, created_at)
        VALUES (
            random_posting_id,
            random_user_id,
            (ARRAY['有興趣', '想要', '請問還有嗎？', '可以議價嗎？', '方便面交嗎？'])[floor(random() * 5 + 1)::INT],
            CURRENT_TIMESTAMP - (random() * INTERVAL '180 days')
        );
    END LOOP;
END $$;

-- 7. 生成收藏假資料（生成 8000 筆）
DO $$
DECLARE
    i INT;
    posting_count INT;
    user_count INT;
    random_posting_id INT;
    random_user_id INT;
BEGIN
    SELECT COUNT(*) INTO posting_count FROM posting WHERE status = 'listed';
    SELECT COUNT(*) INTO user_count FROM "user";
    
    FOR i IN 1..8000 LOOP
        random_posting_id := floor(random() * posting_count + 1)::INT;
        random_user_id := floor(random() * user_count + 1)::INT;
        
        INSERT INTO favorite_posts (u_id, p_id, added_time)
        VALUES (
            random_user_id,
            random_posting_id,
            CURRENT_TIMESTAMP - (random() * INTERVAL '90 days')
        )
        ON CONFLICT (u_id, p_id) DO NOTHING;
    END LOOP;
END $$;

-- 8. 生成訂單假資料（生成 3000 筆）
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
    SELECT COUNT(*) INTO posting_count FROM posting WHERE status = 'sold';
    SELECT COUNT(*) INTO user_count FROM "user";
    
    FOR i IN 1..3000 LOOP
        -- 選擇已售出的商品
        SELECT p_id, u_id, price INTO random_posting_id, seller_id, posting_price
        FROM posting
        WHERE status = 'sold'
        ORDER BY RANDOM()
        LIMIT 1;
        
        -- 選擇不同的買家
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
                posting_price,
                'completed',
                CURRENT_TIMESTAMP - (random() * INTERVAL '200 days')
            )
            ON CONFLICT DO NOTHING;
        END IF;
    END LOOP;
END $$;

-- 9. 生成交易紀錄假資料（生成 5000 筆）
DO $$
DECLARE
    i INT;
    user_count INT;
    random_user_id INT;
    trans_type_val TEXT;
    amount_val INT;
BEGIN
    SELECT COUNT(*) INTO user_count FROM "user";
    
    FOR i IN 1..5000 LOOP
        random_user_id := floor(random() * user_count + 1)::INT;
        
        trans_type_val := (ARRAY['top_up', 'payment', 'income', 'refund'])[floor(random() * 4 + 1)::INT];
        
        amount_val := CASE trans_type_val
            WHEN 'top_up' THEN floor(random() * 5000 + 100)::INT
            WHEN 'payment' THEN -floor(random() * 2000 + 100)::INT
            WHEN 'income' THEN floor(random() * 2000 + 100)::INT
            ELSE floor(random() * 500 + 10)::INT
        END;
        
        INSERT INTO transaction_record (u_id, amount, trans_type, trans_time)
        VALUES (
            random_user_id,
            amount_val,
            trans_type_val,
            CURRENT_TIMESTAMP - (random() * INTERVAL '300 days')
        );
    END LOOP;
END $$;

-- 10. 生成評價假資料（生成 2000 筆）
DO $$
DECLARE
    i INT;
    order_count INT;
    random_order_id INT;
    buyer_id INT;
    seller_id INT;
BEGIN
    SELECT COUNT(*) INTO order_count FROM orders WHERE status = 'completed';
    
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
                buyer_id,
                seller_id,
                floor(random() * 5 + 1)::INT,
                CASE floor(random() * 5 + 1)::INT
                    WHEN 1 THEN '商品狀況良好，賣家很友善'
                    WHEN 2 THEN '交易順利，推薦'
                    WHEN 3 THEN '還不錯'
                    WHEN 4 THEN '可以更好'
                    ELSE '普通'
                END,
                CURRENT_TIMESTAMP - (random() * INTERVAL '150 days')
            )
            ON CONFLICT DO NOTHING;
        END IF;
    END LOOP;
END $$;

-- 11. 生成私訊假資料（生成 3000 筆）
DO $$
DECLARE
    i INT;
    user_count INT;
    random_sender_id INT;
    random_receiver_id INT;
BEGIN
    SELECT COUNT(*) INTO user_count FROM "user";
    
    FOR i IN 1..3000 LOOP
        random_sender_id := floor(random() * user_count + 1)::INT;
        
        SELECT u_id INTO random_receiver_id
        FROM "user"
        WHERE u_id != random_sender_id
        ORDER BY RANDOM()
        LIMIT 1;
        
        INSERT INTO message (sender_id, receiver_id, content, is_read, sent_time)
        VALUES (
            random_sender_id,
            random_receiver_id,
            (ARRAY['你好', '請問商品還在嗎？', '可以議價嗎？', '方便面交嗎？', '謝謝'])[floor(random() * 5 + 1)::INT],
            random() < 0.7, -- 70% 已讀
            CURRENT_TIMESTAMP - (random() * INTERVAL '60 days')
        );
    END LOOP;
END $$;

-- 12. 生成舉報假資料（生成 200 筆）
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
    
    FOR i IN 1..200 LOOP
        random_posting_id := floor(random() * posting_count + 1)::INT;
        random_reporter_id := floor(random() * user_count + 1)::INT;
        
        INSERT INTO report (reporter_id, p_id, reason, status, created_at)
        VALUES (
            random_reporter_id,
            random_posting_id,
            (ARRAY['疑似詐騙', '違禁品', '不當內容', '重複刊登', '價格異常'])[floor(random() * 5 + 1)::INT],
            (ARRAY['pending', 'approved', 'rejected'])[floor(random() * 3 + 1)::INT],
            CURRENT_TIMESTAMP - (random() * INTERVAL '30 days')
        );
    END LOOP;
END $$;

-- 顯示資料統計
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
SELECT 'Report', COUNT(*) FROM report;

