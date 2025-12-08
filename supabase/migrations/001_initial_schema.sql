-- BookSwap 資料庫初始結構
-- 建立所有核心資料表

-- 1. Department (科系)
CREATE TABLE IF NOT EXISTS department (
    dept_id SERIAL PRIMARY KEY,
    dept_name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Class (分類)
CREATE TABLE IF NOT EXISTS class (
    class_id SERIAL PRIMARY KEY,
    class_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Course (課程)
CREATE TABLE IF NOT EXISTS course (
    course_id SERIAL PRIMARY KEY,
    course_code VARCHAR(20) NOT NULL,
    course_name VARCHAR(200) NOT NULL,
    dept_id INT,
    class_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dept_id) REFERENCES department(dept_id) ON DELETE SET NULL,
    FOREIGN KEY (class_id) REFERENCES class(class_id) ON DELETE SET NULL,
    UNIQUE(course_code, course_name)
);

-- 4. User (使用者)
CREATE TABLE IF NOT EXISTS "user" (
    u_id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    balance INT DEFAULT 0 CHECK (balance >= 0),
    is_admin BOOLEAN DEFAULT FALSE,
    is_blocked BOOLEAN DEFAULT FALSE,
    violation_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Posting (刊登商品)
CREATE TABLE IF NOT EXISTS posting (
    p_id SERIAL PRIMARY KEY,
    u_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    price INT NOT NULL CHECK (price >= 0),
    status VARCHAR(20) DEFAULT 'listed' CHECK (status IN ('listed', 'reserved', 'sold', 'reported', 'removed')),
    class_id INT,
    course_id INT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (u_id) REFERENCES "user"(u_id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES class(class_id) ON DELETE SET NULL,
    FOREIGN KEY (course_id) REFERENCES course(course_id) ON DELETE SET NULL
);

-- 6. Comment (公開留言)
CREATE TABLE IF NOT EXISTS comment (
    comment_id SERIAL PRIMARY KEY,
    p_id INT NOT NULL,
    u_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (p_id) REFERENCES posting(p_id) ON DELETE CASCADE,
    FOREIGN KEY (u_id) REFERENCES "user"(u_id) ON DELETE CASCADE
);

-- 7. Report (舉報)
CREATE TABLE IF NOT EXISTS report (
    report_id SERIAL PRIMARY KEY,
    reporter_id INT NOT NULL,
    p_id INT NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by INT,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES "user"(u_id) ON DELETE CASCADE,
    FOREIGN KEY (p_id) REFERENCES posting(p_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES "user"(u_id) ON DELETE SET NULL
);

-- 8. Orders (訂單)
CREATE TABLE IF NOT EXISTS orders (
    order_id SERIAL PRIMARY KEY,
    buyer_id INT NOT NULL,
    p_id INT NOT NULL,
    deal_price INT NOT NULL CHECK (deal_price >= 0),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('completed', 'cancelled')),
    FOREIGN KEY (buyer_id) REFERENCES "user"(u_id) ON DELETE CASCADE,
    FOREIGN KEY (p_id) REFERENCES posting(p_id) ON DELETE CASCADE
);

-- 9. Transaction Record (金流紀錄)
CREATE TABLE IF NOT EXISTS transaction_record (
    record_id SERIAL PRIMARY KEY,
    u_id INT NOT NULL,
    amount INT NOT NULL,
    trans_type VARCHAR(20) NOT NULL CHECK (trans_type IN ('top_up', 'payment', 'income', 'refund')),
    trans_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (u_id) REFERENCES "user"(u_id) ON DELETE CASCADE
);

-- 10. Review (評價)
CREATE TABLE IF NOT EXISTS review (
    review_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    target_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES "user"(u_id) ON DELETE CASCADE,
    FOREIGN KEY (target_id) REFERENCES "user"(u_id) ON DELETE CASCADE
);

-- 11. Message (私訊)
CREATE TABLE IF NOT EXISTS message (
    msg_id SERIAL PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    content TEXT NOT NULL,
    sent_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (sender_id) REFERENCES "user"(u_id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES "user"(u_id) ON DELETE CASCADE,
    CHECK (sender_id != receiver_id)
);

-- 12. Favorite Posts (收藏)
CREATE TABLE IF NOT EXISTS favorite_posts (
    u_id INT NOT NULL,
    p_id INT NOT NULL,
    added_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (u_id, p_id),
    FOREIGN KEY (u_id) REFERENCES "user"(u_id) ON DELETE CASCADE,
    FOREIGN KEY (p_id) REFERENCES posting(p_id) ON DELETE CASCADE
);

-- 13. Posting Images (刊登圖片) - 支援多張圖片
CREATE TABLE IF NOT EXISTS posting_images (
    image_id SERIAL PRIMARY KEY,
    p_id INT NOT NULL,
    image_url TEXT NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (p_id) REFERENCES posting(p_id) ON DELETE CASCADE
);

-- 建立 updated_at 自動更新函數
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 為 user 和 posting 表建立 updated_at 觸發器
CREATE TRIGGER update_user_updated_at
    BEFORE UPDATE ON "user"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posting_updated_at
    BEFORE UPDATE ON posting
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

