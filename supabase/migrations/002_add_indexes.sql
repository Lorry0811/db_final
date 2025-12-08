-- 建立索引以優化查詢效能

-- User 表索引
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);
CREATE INDEX IF NOT EXISTS idx_user_username ON "user"(username);
CREATE INDEX IF NOT EXISTS idx_user_is_admin ON "user"(is_admin);
CREATE INDEX IF NOT EXISTS idx_user_is_blocked ON "user"(is_blocked);

-- Posting 表索引
CREATE INDEX IF NOT EXISTS idx_posting_u_id ON posting(u_id);
CREATE INDEX IF NOT EXISTS idx_posting_status ON posting(status);
CREATE INDEX IF NOT EXISTS idx_posting_class_id ON posting(class_id);
CREATE INDEX IF NOT EXISTS idx_posting_course_id ON posting(course_id);
CREATE INDEX IF NOT EXISTS idx_posting_price ON posting(price);
CREATE INDEX IF NOT EXISTS idx_posting_created_at ON posting(created_at);
-- 全文搜尋索引（PostgreSQL）
CREATE INDEX IF NOT EXISTS idx_posting_title_search ON posting USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_posting_description_search ON posting USING gin(to_tsvector('english', description));

-- Comment 表索引
CREATE INDEX IF NOT EXISTS idx_comment_p_id ON comment(p_id);
CREATE INDEX IF NOT EXISTS idx_comment_u_id ON comment(u_id);
CREATE INDEX IF NOT EXISTS idx_comment_created_at ON comment(created_at);

-- Report 表索引
CREATE INDEX IF NOT EXISTS idx_report_reporter_id ON report(reporter_id);
CREATE INDEX IF NOT EXISTS idx_report_p_id ON report(p_id);
CREATE INDEX IF NOT EXISTS idx_report_status ON report(status);
CREATE INDEX IF NOT EXISTS idx_report_created_at ON report(created_at);

-- Orders 表索引
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_p_id ON orders(p_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date);

-- Transaction Record 表索引
CREATE INDEX IF NOT EXISTS idx_transaction_u_id ON transaction_record(u_id);
CREATE INDEX IF NOT EXISTS idx_transaction_trans_type ON transaction_record(trans_type);
CREATE INDEX IF NOT EXISTS idx_transaction_trans_time ON transaction_record(trans_time);

-- Review 表索引
CREATE INDEX IF NOT EXISTS idx_review_order_id ON review(order_id);
CREATE INDEX IF NOT EXISTS idx_review_reviewer_id ON review(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_review_target_id ON review(target_id);
CREATE INDEX IF NOT EXISTS idx_review_rating ON review(rating);

-- Message 表索引
CREATE INDEX IF NOT EXISTS idx_message_sender_id ON message(sender_id);
CREATE INDEX IF NOT EXISTS idx_message_receiver_id ON message(receiver_id);
CREATE INDEX IF NOT EXISTS idx_message_is_read ON message(is_read);
CREATE INDEX IF NOT EXISTS idx_message_sent_time ON message(sent_time);

-- Favorite Posts 表索引
CREATE INDEX IF NOT EXISTS idx_favorite_u_id ON favorite_posts(u_id);
CREATE INDEX IF NOT EXISTS idx_favorite_p_id ON favorite_posts(p_id);
CREATE INDEX IF NOT EXISTS idx_favorite_added_time ON favorite_posts(added_time);

-- Posting Images 表索引
CREATE INDEX IF NOT EXISTS idx_posting_images_p_id ON posting_images(p_id);
CREATE INDEX IF NOT EXISTS idx_posting_images_display_order ON posting_images(display_order);

-- Course 表索引
CREATE INDEX IF NOT EXISTS idx_course_dept_id ON course(dept_id);
CREATE INDEX IF NOT EXISTS idx_course_class_id ON course(class_id);
CREATE INDEX IF NOT EXISTS idx_course_code ON course(course_code);

