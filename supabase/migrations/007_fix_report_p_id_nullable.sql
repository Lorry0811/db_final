-- 修復 report 表的 p_id 欄位，使其允許 NULL（用於逃單舉報）
-- 如果已經執行過 006_extend_report_table.sql 但沒有包含此修改，請執行此文件

-- 修改 p_id 欄位，使其允許 NULL
ALTER TABLE report 
ALTER COLUMN p_id DROP NOT NULL;

