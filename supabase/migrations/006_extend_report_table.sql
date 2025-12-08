-- 擴展 report 表以支援留言舉報和逃單舉報

-- 首先修改 p_id 欄位，使其允許 NULL（因為逃單舉報不需要 p_id）
ALTER TABLE report 
ALTER COLUMN p_id DROP NOT NULL;

-- 添加新欄位
ALTER TABLE report 
ADD COLUMN IF NOT EXISTS report_type VARCHAR(20) DEFAULT 'posting' 
  CHECK (report_type IN ('posting', 'comment', 'order_violation')),
ADD COLUMN IF NOT EXISTS comment_id INT,
ADD COLUMN IF NOT EXISTS order_id INT,
ADD COLUMN IF NOT EXISTS target_user_id INT;

-- 添加外鍵約束
ALTER TABLE report
ADD CONSTRAINT fk_report_comment 
  FOREIGN KEY (comment_id) REFERENCES comment(comment_id) ON DELETE CASCADE,
ADD CONSTRAINT fk_report_order 
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
ADD CONSTRAINT fk_report_target_user 
  FOREIGN KEY (target_user_id) REFERENCES "user"(u_id) ON DELETE CASCADE;

-- 添加檢查約束：確保每種舉報類型都有對應的關聯
ALTER TABLE report
ADD CONSTRAINT check_report_type_relations CHECK (
  (report_type = 'posting' AND p_id IS NOT NULL AND comment_id IS NULL AND order_id IS NULL) OR
  (report_type = 'comment' AND comment_id IS NOT NULL AND p_id IS NOT NULL AND order_id IS NULL) OR
  (report_type = 'order_violation' AND order_id IS NOT NULL AND target_user_id IS NOT NULL AND p_id IS NULL AND comment_id IS NULL)
);

-- 更新現有記錄的 report_type
UPDATE report SET report_type = 'posting' WHERE report_type IS NULL;

-- 更新觸發器函數以支援逃單舉報
CREATE OR REPLACE FUNCTION update_violation_count()
RETURNS TRIGGER AS $$
DECLARE
    v_target_user_id INT;
BEGIN
    -- 當舉報狀態從 pending 變為 approved 時
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
        -- 根據舉報類型取得目標使用者
        IF NEW.report_type = 'posting' THEN
            -- 舉報刊登：取得刊登的擁有者
            SELECT u_id INTO v_target_user_id
            FROM posting 
            WHERE p_id = NEW.p_id;
        ELSIF NEW.report_type = 'comment' THEN
            -- 舉報留言：取得留言的作者
            SELECT u_id INTO v_target_user_id
            FROM comment 
            WHERE comment_id = NEW.comment_id;
        ELSIF NEW.report_type = 'order_violation' THEN
            -- 逃單舉報：使用指定的目標使用者
            v_target_user_id := NEW.target_user_id;
        END IF;
        
        -- 增加目標使用者的違規次數
        IF v_target_user_id IS NOT NULL THEN
            UPDATE "user" 
            SET violation_count = violation_count + 1
            WHERE u_id = v_target_user_id;
        END IF;
        
        -- 更新舉報審核資訊
        NEW.reviewed_at = CURRENT_TIMESTAMP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 添加索引以優化查詢
CREATE INDEX IF NOT EXISTS idx_report_type ON report (report_type);
CREATE INDEX IF NOT EXISTS idx_report_comment_id ON report (comment_id);
CREATE INDEX IF NOT EXISTS idx_report_order_id ON report (order_id);
CREATE INDEX IF NOT EXISTS idx_report_target_user_id ON report (target_user_id);
CREATE INDEX IF NOT EXISTS idx_report_status ON report (status);

