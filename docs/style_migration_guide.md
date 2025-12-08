# 樣式遷移指南

本指南說明如何將剩餘頁面的樣式更新為新的設計風格。

## 顏色替換對照表

### 背景顏色
- `bg-white` → `bg-white` (保持不變，但使用 `card` 類別)
- `bg-gray-50` → `bg-brand-beige`
- `bg-blue-50` → `bg-brand-beige`

### 文字顏色
- `text-gray-900` → `text-text-primary`
- `text-gray-700` → `text-text-primary`
- `text-gray-600` → `text-text-secondary`
- `text-gray-500` → `text-text-secondary`
- `text-gray-400` → `text-text-tertiary`
- `text-blue-600` → `text-brand-orange`
- `text-blue-700` → `text-brand-orange-dark`

### 按鈕顏色
- `bg-blue-600` → `btn-primary` 或 `bg-brand-orange`
- `bg-blue-700` → `bg-brand-orange-dark`
- `hover:bg-blue-700` → `hover:bg-brand-orange-dark`
- `text-blue-600` → `text-brand-orange`

### 邊框顏色
- `border` → `border border-border-light`
- `border-blue-600` → `border-brand-orange`
- `focus:ring-blue-500` → `focus:ring-brand-orange`

### 卡片樣式
- `bg-white rounded-lg shadow-md` → `card`
- `bg-white rounded-lg shadow-sm` → `card`
- `hover:shadow-lg` → `card-hover` (與 `card` 一起使用)

### 輸入框樣式
- `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500` → `input`

## 常用類別替換

### 按鈕
```tsx
// 舊樣式
<button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
  按鈕
</button>

// 新樣式
<button className="btn-primary">
  按鈕
</button>
```

### 次要按鈕
```tsx
// 舊樣式
<button className="bg-white text-blue-600 border-2 border-blue-600 px-4 py-2 rounded-lg">
  按鈕
</button>

// 新樣式
<button className="btn-secondary">
  按鈕
</button>
```

### 卡片
```tsx
// 舊樣式
<div className="bg-white rounded-lg shadow-md p-6">
  內容
</div>

// 新樣式
<div className="card">
  內容
</div>
```

### 可懸停的卡片
```tsx
// 舊樣式
<Link className="bg-white rounded-lg shadow-md hover:shadow-lg">
  內容
</Link>

// 新樣式
<Link className="card card-hover">
  內容
</Link>
```

### 輸入框
```tsx
// 舊樣式
<input className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />

// 新樣式
<input className="input" />
```

### 標籤/徽章
```tsx
// 舊樣式
<span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
  標籤
</span>

// 新樣式
<span className="tag tag-default">
  標籤
</span>
```

## 需要更新的文件清單

以下文件仍需要更新樣式：

1. `apps/web/app/dashboard/page.tsx`
2. `apps/web/app/postings/[id]/page.tsx`
3. `apps/web/app/postings/[id]/edit/page.tsx`
4. `apps/web/app/postings/new/page.tsx`
5. `apps/web/app/orders/page.tsx`
6. `apps/web/app/orders/[id]/page.tsx`
7. `apps/web/app/favorites/page.tsx`
8. `apps/web/app/messages/page.tsx`
9. `apps/web/app/messages/[userId]/page.tsx`
10. `apps/web/app/reports/page.tsx`
11. `apps/web/app/reviews/page.tsx`
12. `apps/web/app/users/[id]/reviews/page.tsx`
13. `apps/web/app/profile/page.tsx`
14. `apps/web/app/topup/page.tsx`
15. `apps/web/app/admin/*` (所有管理員頁面)
16. `apps/web/components/*` (所有組件)

## 批量替換建議

可以使用編輯器的「查找和替換」功能批量替換：

1. **按鈕樣式**：
   - 查找：`bg-blue-600 text-white.*rounded-lg.*hover:bg-blue-700`
   - 替換為：`btn-primary`

2. **卡片樣式**：
   - 查找：`bg-white rounded-lg shadow-md`
   - 替換為：`card`

3. **文字顏色**：
   - 查找：`text-gray-900`
   - 替換為：`text-text-primary`
   - 查找：`text-gray-600`
   - 替換為：`text-text-secondary`

4. **輸入框**：
   - 查找：`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`
   - 替換為：`input`

## 注意事項

1. 替換後請檢查每個頁面，確保樣式正確
2. 某些複雜的樣式可能需要手動調整
3. 確保所有互動元素（按鈕、連結）都有適當的懸停效果
4. 保持響應式設計
5. 測試所有頁面確保功能正常

## 已完成的文件

✅ `apps/web/tailwind.config.js` - 已添加自定義顏色
✅ `apps/web/app/globals.css` - 已更新全局樣式
✅ `apps/web/components/layout/Header.tsx` - 已更新導航欄
✅ `apps/web/app/page.tsx` - 已更新首頁
✅ `apps/web/app/postings/page.tsx` - 已更新商品列表頁
✅ `apps/web/app/login/page.tsx` - 已更新登入頁
✅ `apps/web/app/register/page.tsx` - 已更新註冊頁

