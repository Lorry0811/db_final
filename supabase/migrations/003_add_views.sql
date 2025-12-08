-- 建立視圖用於複雜查詢和報表

-- 視圖 1: 熱門書籍（被收藏次數超過 N 次）
CREATE OR REPLACE VIEW v_popular_books AS
SELECT 
    p.p_id,
    p.title,
    p.price,
    p.status,
    p.created_at,
    COUNT(DISTINCT fp.u_id) AS favorite_count,
    COUNT(DISTINCT c.comment_id) AS comment_count,
    u.username AS seller_username,
    co.course_name,
    cl.class_name
FROM posting p
LEFT JOIN favorite_posts fp ON p.p_id = fp.p_id
LEFT JOIN comment c ON p.p_id = c.p_id
LEFT JOIN "user" u ON p.u_id = u.u_id
LEFT JOIN course co ON p.course_id = co.course_id
LEFT JOIN class cl ON p.class_id = cl.class_id
WHERE p.status = 'listed'
GROUP BY p.p_id, p.title, p.price, p.status, p.created_at, u.username, co.course_name, cl.class_name
HAVING COUNT(DISTINCT fp.u_id) > 0
ORDER BY favorite_count DESC, comment_count DESC;

-- 視圖 2: 使用者統計
CREATE OR REPLACE VIEW v_user_statistics AS
SELECT 
    u.u_id,
    u.username,
    u.email,
    u.balance,
    u.is_admin,
    u.is_blocked,
    u.violation_count,
    COUNT(DISTINCT p.p_id) AS total_posts,
    COUNT(DISTINCT CASE WHEN p.status = 'sold' THEN p.p_id END) AS sold_posts,
    COUNT(DISTINCT o.order_id) AS total_orders_as_buyer,
    COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.deal_price END), 0) AS total_spent,
    COALESCE(SUM(CASE WHEN p.status = 'sold' THEN p.price END), 0) AS total_earned,
    COALESCE(AVG(r.rating), 0) AS average_rating,
    COUNT(DISTINCT r.review_id) AS review_count,
    COUNT(DISTINCT fp.p_id) AS favorite_count
FROM "user" u
LEFT JOIN posting p ON u.u_id = p.u_id
LEFT JOIN orders o ON u.u_id = o.buyer_id
LEFT JOIN review r ON u.u_id = r.target_id
LEFT JOIN favorite_posts fp ON u.u_id = fp.u_id
GROUP BY u.u_id, u.username, u.email, u.balance, u.is_admin, u.is_blocked, u.violation_count;

-- 視圖 3: 課程相關統計
CREATE OR REPLACE VIEW v_course_statistics AS
SELECT 
    co.course_id,
    co.course_code,
    co.course_name,
    d.dept_name,
    cl.class_name,
    COUNT(DISTINCT p.p_id) AS total_postings,
    COUNT(DISTINCT CASE WHEN p.status = 'listed' THEN p.p_id END) AS active_postings,
    COUNT(DISTINCT CASE WHEN p.status = 'sold' THEN p.p_id END) AS sold_postings,
    COALESCE(AVG(p.price), 0) AS average_price,
    MIN(p.price) AS min_price,
    MAX(p.price) AS max_price
FROM course co
LEFT JOIN posting p ON co.course_id = p.course_id
LEFT JOIN department d ON co.dept_id = d.dept_id
LEFT JOIN class cl ON co.class_id = cl.class_id
GROUP BY co.course_id, co.course_code, co.course_name, d.dept_name, cl.class_name;

-- 視圖 4: 分類統計
CREATE OR REPLACE VIEW v_class_statistics AS
SELECT 
    cl.class_id,
    cl.class_name,
    COUNT(DISTINCT p.p_id) AS total_postings,
    COUNT(DISTINCT CASE WHEN p.status = 'listed' THEN p.p_id END) AS active_postings,
    COUNT(DISTINCT CASE WHEN p.status = 'sold' THEN p.p_id END) AS sold_postings,
    COUNT(DISTINCT p.u_id) AS unique_sellers,
    COALESCE(SUM(CASE WHEN p.status = 'sold' THEN p.price END), 0) AS total_revenue
FROM class cl
LEFT JOIN posting p ON cl.class_id = p.class_id
GROUP BY cl.class_id, cl.class_name;

