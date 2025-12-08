import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">管理員後台</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/admin/courses"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">課程管理</h2>
          <p className="text-gray-600">管理課程資訊（增刪改查）</p>
        </Link>

        <Link
          href="/admin/classes"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">分類管理</h2>
          <p className="text-gray-600">管理物品分類（增刪改查）</p>
        </Link>

        <Link
          href="/admin/reports"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">舉報審核</h2>
          <p className="text-gray-600">審核使用者舉報的內容</p>
        </Link>

        <Link
          href="/admin/statistics"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">統計報表</h2>
          <p className="text-gray-600">查看平台統計資料</p>
        </Link>

        <Link
          href="/admin/users"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">使用者管理</h2>
          <p className="text-gray-600">查詢所有使用者資訊</p>
        </Link>

        <Link
          href="/admin/postings"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">刊登管理</h2>
          <p className="text-gray-600">查詢所有刊登資訊</p>
        </Link>
      </div>
    </div>
  );
}

