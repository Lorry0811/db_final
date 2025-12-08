-- 建立儲存程序/函數

-- 函數 1: 購買書籍的完整交易流程（包含 ACID 特性）
CREATE OR REPLACE FUNCTION purchase_book(
    p_buyer_id INT,
    p_posting_id INT
)
RETURNS JSON AS $$
DECLARE
    v_posting posting%ROWTYPE;
    v_seller_id INT;
    v_price INT;
    v_buyer_balance INT;
    v_order_id INT;
    v_result JSON;
BEGIN
    -- 開始交易（函數本身在交易中執行）
    
    -- 1. 檢查並鎖定 posting 記錄
    SELECT * INTO v_posting
    FROM posting
    WHERE p_id = p_posting_id
    FOR UPDATE;
    
    -- 檢查 posting 是否存在
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'message', '刊登不存在'
        );
    END IF;
    
    -- 2. 檢查商品狀態
    IF v_posting.status != 'listed' THEN
        RETURN json_build_object(
            'success', false,
            'message', '商品已售出或不可購買'
        );
    END IF;
    
    -- 3. 取得賣家 ID 和價格
    v_seller_id := v_posting.u_id;
    v_price := v_posting.price;
    
    -- 4. 檢查買家餘額（鎖定買家記錄）
    SELECT balance INTO v_buyer_balance
    FROM "user"
    WHERE u_id = p_buyer_id
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'message', '買家不存在'
        );
    END IF;
    
    -- 5. 檢查餘額是否足夠
    IF v_buyer_balance < v_price THEN
        RETURN json_build_object(
            'success', false,
            'message', '餘額不足'
        );
    END IF;
    
    -- 6. 檢查是否是自己購買自己的商品
    IF v_seller_id = p_buyer_id THEN
        RETURN json_build_object(
            'success', false,
            'message', '不能購買自己的商品'
        );
    END IF;
    
    -- 7. 執行交易：扣款
    UPDATE "user"
    SET balance = balance - v_price
    WHERE u_id = p_buyer_id;
    
    -- 8. 執行交易：入帳
    UPDATE "user"
    SET balance = balance + v_price
    WHERE u_id = v_seller_id;
    
    -- 9. 更新商品狀態
    UPDATE posting
    SET status = 'sold',
        updated_at = CURRENT_TIMESTAMP
    WHERE p_id = p_posting_id;
    
    -- 10. 建立訂單（觸發器會自動記錄交易）
    INSERT INTO orders (buyer_id, p_id, deal_price, status)
    VALUES (p_buyer_id, p_posting_id, v_price, 'completed')
    RETURNING order_id INTO v_order_id;
    
    -- 11. 返回成功結果
    RETURN json_build_object(
        'success', true,
        'message', '購買成功',
        'order_id', v_order_id,
        'price', v_price
    );
    
EXCEPTION
    WHEN OTHERS THEN
        -- 發生錯誤時自動回滾（PostgreSQL 函數在交易中執行）
        RETURN json_build_object(
            'success', false,
            'message', '交易失敗: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql;

-- 函數 2: 計算使用者平均評分
CREATE OR REPLACE FUNCTION calculate_user_rating(p_user_id INT)
RETURNS NUMERIC AS $$
DECLARE
    v_avg_rating NUMERIC;
BEGIN
    SELECT COALESCE(AVG(rating), 0) INTO v_avg_rating
    FROM review
    WHERE target_id = p_user_id;
    
    RETURN ROUND(v_avg_rating, 2);
END;
$$ LANGUAGE plpgsql;

-- 函數 3: 取得使用者的銷售統計
CREATE OR REPLACE FUNCTION get_user_sales_stats(p_user_id INT)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT json_build_object(
        'total_sold', COUNT(DISTINCT CASE WHEN p.status = 'sold' THEN p.p_id END),
        'total_revenue', COALESCE(SUM(CASE WHEN p.status = 'sold' THEN p.price END), 0),
        'active_listings', COUNT(DISTINCT CASE WHEN p.status = 'listed' THEN p.p_id END),
        'average_rating', COALESCE(AVG(r.rating), 0)
    ) INTO v_result
    FROM "user" u
    LEFT JOIN posting p ON u.u_id = p.u_id
    LEFT JOIN orders o ON p.p_id = o.p_id AND o.status = 'completed'
    LEFT JOIN review r ON o.order_id = r.order_id AND r.target_id = u.u_id
    WHERE u.u_id = p_user_id;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

