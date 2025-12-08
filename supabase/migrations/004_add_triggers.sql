-- 建立觸發器用於自動化業務邏輯

-- 觸發器 1: 當舉報被審核通過時，自動增加使用者違規次數
CREATE OR REPLACE FUNCTION update_violation_count()
RETURNS TRIGGER AS $$
BEGIN
    -- 當舉報狀態從 pending 變為 approved 時
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
        -- 取得刊登的擁有者
        UPDATE "user" 
        SET violation_count = violation_count + 1
        WHERE u_id = (
            SELECT u_id FROM posting WHERE p_id = NEW.p_id
        );
        
        -- 更新舉報審核資訊
        NEW.reviewed_at = CURRENT_TIMESTAMP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_violation_count
    BEFORE UPDATE ON report
    FOR EACH ROW
    EXECUTE FUNCTION update_violation_count();

-- 觸發器 2: 當使用者違規次數達到 3 次時，自動封鎖帳號
CREATE OR REPLACE FUNCTION auto_block_user()
RETURNS TRIGGER AS $$
BEGIN
    -- 當違規次數達到或超過 3 次時，自動封鎖
    IF NEW.violation_count >= 3 AND NEW.is_blocked = FALSE THEN
        NEW.is_blocked = TRUE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_block_user
    BEFORE UPDATE ON "user"
    FOR EACH ROW
    EXECUTE FUNCTION auto_block_user();

-- 觸發器 3: 當訂單建立時，自動更新 posting 狀態為 sold
CREATE OR REPLACE FUNCTION update_posting_status_on_order()
RETURNS TRIGGER AS $$
BEGIN
    -- 當訂單狀態為 completed 時，更新對應的 posting 狀態
    IF NEW.status = 'completed' THEN
        UPDATE posting
        SET status = 'sold',
            updated_at = CURRENT_TIMESTAMP
        WHERE p_id = NEW.p_id AND status = 'listed';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_posting_status
    AFTER INSERT OR UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_posting_status_on_order();

-- 觸發器 4: 當訂單完成時，自動記錄交易紀錄
CREATE OR REPLACE FUNCTION record_transaction_on_order()
RETURNS TRIGGER AS $$
DECLARE
    seller_id INT;
BEGIN
    -- 當訂單狀態為 completed 時，記錄交易
    IF NEW.status = 'completed' THEN
        -- 取得賣家 ID
        SELECT u_id INTO seller_id
        FROM posting
        WHERE p_id = NEW.p_id;
        
        -- 記錄買家的付款（負數）
        INSERT INTO transaction_record (u_id, amount, trans_type)
        VALUES (NEW.buyer_id, -NEW.deal_price, 'payment');
        
        -- 記錄賣家的收入（正數）
        INSERT INTO transaction_record (u_id, amount, trans_type)
        VALUES (seller_id, NEW.deal_price, 'income');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_record_transaction
    AFTER INSERT OR UPDATE ON orders
    FOR EACH ROW
    WHEN (NEW.status = 'completed')
    EXECUTE FUNCTION record_transaction_on_order();

-- 觸發器 5: 當使用者餘額變更時，記錄交易（用於儲值）
-- 注意：這個觸發器需要配合應用層邏輯使用
CREATE OR REPLACE FUNCTION log_balance_change()
RETURNS TRIGGER AS $$
DECLARE
    amount_diff INT;
BEGIN
    -- 計算餘額變化
    amount_diff = NEW.balance - OLD.balance;
    
    -- 如果餘額增加（儲值），記錄交易
    IF amount_diff > 0 THEN
        INSERT INTO transaction_record (u_id, amount, trans_type)
        VALUES (NEW.u_id, amount_diff, 'top_up');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 注意：這個觸發器可能會與手動插入 transaction_record 衝突
-- 可以選擇不使用，改由應用層控制
-- CREATE TRIGGER trigger_log_balance_change
--     AFTER UPDATE ON "user"
--     FOR EACH ROW
--     WHEN (NEW.balance > OLD.balance)
--     EXECUTE FUNCTION log_balance_change();

