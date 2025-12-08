/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-blue': '#1E40AF', // 深藍色
        'brand-blue-dark': '#1E3A8A', // 更深的藍色（懸停用）
        'brand-blue-light': '#3B82F6', // 淺藍色（次要按鈕）
        'brand-beige': '#F5F5F0',
        'brand-beige-alt': '#FAF9F6',
        'text-primary': '#2C2C2C',
        'text-secondary': '#666666',
        'text-tertiary': '#999999',
        'border-light': '#E5E5E5',
        'success': '#4CAF50',
        'error': '#F44336',
        'tag-bg': '#EFF6FF', // 淺藍色背景
        'tag-bg-alt': '#DBEAFE',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'soft-hover': '0 4px 12px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        'card': '12px',
        'button': '8px',
        'tag': '20px',
      },
    },
  },
  plugins: [],
};

