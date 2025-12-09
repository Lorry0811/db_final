-- 假資料生成腳本
-- 需要 pgcrypto 來產生 bcrypt 雜湊
CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- 注意：這個腳本會生成大量假資料，建議在測試環境中使用
-- 4. 生成使用者假資料（固定 100 個使用者）
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

-- 插入使用者（生成 100 個使用者）
DO $$
DECLARE
    i INT;
    email_val TEXT;
    username_val TEXT;
BEGIN
    FOR i IN 1..100 LOOP
        email_val := 'user' || i || '@example.com';
        username_val := 'user' || i;
        
        INSERT INTO "user" (email, username, password_hash, balance, is_admin, is_blocked)
        VALUES (
            email_val,
            username_val,
            crypt(username_val || '_pass', gen_salt('bf')), -- 與使用者名相關並經 bcrypt
            floor(random() * 10000)::INT, -- 隨機餘額 0-10000
            CASE WHEN i = 1 THEN TRUE ELSE FALSE END, -- 第一個使用者是管理員
            FALSE
        )
        ON CONFLICT (email) DO NOTHING;
    END LOOP;
END $$;

-- 5. 生成刊登假資料（100 個使用者 * 每人 100 筆 = 約 10,000 筆）
DO $$
DECLARE
    user_ids INT[];
    user_idx INT;
    post_idx INT;
    random_class_id INT;
    random_course_id INT;
    status_val TEXT;
    title_val TEXT;
    price_val INT;
BEGIN
    -- 取得所有使用者與分類列表
    SELECT array_agg(u_id ORDER BY u_id) INTO user_ids FROM "user";
    
    IF user_ids IS NULL OR array_length(user_ids, 1) IS NULL THEN
        RAISE NOTICE 'No users found for posting generation.';
        RETURN;
    END IF;

    FOR user_idx IN 1..array_length(user_ids, 1) LOOP
        FOR post_idx IN 1..100 LOOP
            -- 隨機分類
            SELECT class_id INTO random_class_id
            FROM class
            ORDER BY random()
            LIMIT 1;

            -- 教科書分類才隨機課程
            IF random_class_id = 1 THEN
                SELECT course_id INTO random_course_id
                FROM course
                ORDER BY random()
                LIMIT 1;
            ELSE
                random_course_id := NULL;
            END IF;

            -- 隨機狀態（主要 listed）
            status_val := CASE 
                WHEN random() < 0.6 THEN 'listed'
                WHEN random() < 0.8 THEN 'sold'
                WHEN random() < 0.9 THEN 'reserved'
                ELSE 'removed'
            END;

            -- 生成標題
            title_val := CASE random_class_id
                WHEN 1 THEN '二手教科書 - ' || COALESCE((SELECT course_name FROM course WHERE course_id = random_course_id LIMIT 1), '未知課程') || ' #' || post_idx
                WHEN 2 THEN '二手' || (ARRAY['iPhone', 'MacBook', 'iPad', '筆電', '手機'])[floor(random() * 5 + 1)::INT] || ' #' || post_idx
                ELSE '二手物品 #' || post_idx
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
                user_ids[user_idx],
                title_val,
                '這是商品描述 #' || post_idx || '。商品狀況良好，歡迎詢問。',
                price_val,
                status_val,
                random_class_id,
                CASE WHEN random_class_id = 1 THEN random_course_id ELSE NULL END,
                CURRENT_TIMESTAMP - (random() * INTERVAL '365 days')
            );
        END LOOP;
    END LOOP;
END $$;

-- 5.5. 生成刊登圖片假資料（為每個刊登生成 1 張圖片即可，使用實際 p_id）
DO $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN SELECT p_id FROM posting LOOP
        INSERT INTO posting_images (p_id, image_url, display_order, created_at)
        VALUES (
            rec.p_id,
            'https://picsum.photos/800/600?random=' || (rec.p_id * 10 + 1),
            0,
            CURRENT_TIMESTAMP - (random() * INTERVAL '365 days')
        );
    END LOOP;
END $$;

-- 6. 生成留言假資料（生成 500 筆，隨機實際 user/posting）
DO $$
DECLARE
    i INT;
    random_posting_id INT;
    random_user_id INT;
BEGIN
    FOR i IN 1..500 LOOP
        SELECT p_id INTO random_posting_id FROM posting ORDER BY random() LIMIT 1;
        SELECT u_id INTO random_user_id FROM "user" ORDER BY random() LIMIT 1;

        IF random_posting_id IS NULL OR random_user_id IS NULL THEN
            CONTINUE;
        END IF;
        
        INSERT INTO comment (p_id, u_id, content, created_at)
        VALUES (
            random_posting_id,
            random_user_id,
            (ARRAY['有興趣', '想要', '請問還有嗎？', '可以議價嗎？', '方便面交嗎？'])[floor(random() * 5 + 1)::INT],
            CURRENT_TIMESTAMP - (random() * INTERVAL '180 days')
        );
    END LOOP;
END $$;

-- 7. 生成收藏假資料（生成 800 筆，隨機實際 user / listed posting）
DO $$
DECLARE
    i INT;
    random_posting_id INT;
    random_user_id INT;
BEGIN
    FOR i IN 1..800 LOOP
        SELECT p_id INTO random_posting_id FROM posting WHERE status = 'listed' ORDER BY random() LIMIT 1;
        SELECT u_id INTO random_user_id FROM "user" ORDER BY random() LIMIT 1;

        IF random_posting_id IS NULL OR random_user_id IS NULL THEN
            CONTINUE;
        END IF;
        
        INSERT INTO favorite_posts (u_id, p_id, added_time)
        VALUES (
            random_user_id,
            random_posting_id,
            CURRENT_TIMESTAMP - (random() * INTERVAL '90 days')
        )
        ON CONFLICT (u_id, p_id) DO NOTHING;
    END LOOP;
END $$;

-- 8. 生成訂單假資料（生成 300 筆，隨機已售出商品與買家）
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
    FOR i IN 1..300 LOOP
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

-- 9. 生成交易紀錄假資料（生成 500 筆，隨機實際 user）
DO $$
DECLARE
    i INT;
    random_user_id INT;
    trans_type_val TEXT;
    amount_val INT;
BEGIN
    FOR i IN 1..500 LOOP
        SELECT u_id INTO random_user_id FROM "user" ORDER BY random() LIMIT 1;

        IF random_user_id IS NULL THEN
            CONTINUE;
        END IF;
        
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

-- 10. 生成評價假資料（生成 200 筆）
DO $$
DECLARE
    i INT;
    order_count INT;
    random_order_id INT;
    buyer_id INT;
    seller_id INT;
BEGIN
    SELECT COUNT(*) INTO order_count FROM orders WHERE status = 'completed';
    
    FOR i IN 1..200 LOOP
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

-- 11. 生成私訊假資料（生成 300 筆，隨機實際 user，避免同人）
DO $$
DECLARE
    i INT;
    random_sender_id INT;
    random_receiver_id INT;
BEGIN
    FOR i IN 1..300 LOOP
        SELECT u_id INTO random_sender_id FROM "user" ORDER BY random() LIMIT 1;
        SELECT u_id INTO random_receiver_id FROM "user" WHERE u_id != random_sender_id ORDER BY random() LIMIT 1;

        IF random_sender_id IS NULL OR random_receiver_id IS NULL THEN
            CONTINUE;
        END IF;
        
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

-- 12. 生成舉報假資料（生成 100 筆，隨機實際 user/posting）
DO $$
DECLARE
    i INT;
    random_posting_id INT;
    random_reporter_id INT;
BEGIN
    FOR i IN 1..100 LOOP
        SELECT p_id INTO random_posting_id FROM posting ORDER BY random() LIMIT 1;
        SELECT u_id INTO random_reporter_id FROM "user" ORDER BY random() LIMIT 1;

        IF random_posting_id IS NULL OR random_reporter_id IS NULL THEN
            CONTINUE;
        END IF;
        
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

