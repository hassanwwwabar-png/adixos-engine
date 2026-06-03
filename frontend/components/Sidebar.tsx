import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white h-screen border-l border-gray-200 flex flex-col fixed right-0 top-0 shadow-lg z-50">
      {/* 🟢 الشعار */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-center">
        <h1 className="text-2xl font-black text-blue-700 tracking-tighter">
          ADIXOS <span className="text-gray-400 text-sm font-normal">SaaS</span>
        </h1>
      </div>

      {/* 🟠 القائمة */}
      <nav className="flex-1 p-4 space-y-2">
        <p className="text-xs text-gray-400 font-bold mb-4 px-2">القائمة الرئيسية</p>
        
        <Link href="/" className="flex items-center gap-3 p-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all group">
          <span className="text-xl group-hover:scale-110 transition">📊</span>
          <span className="font-medium">لوحة التحكم (الطلبيات)</span>
        </Link>

        <Link href="/products" className="flex items-center gap-3 p-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all group">
          <span className="text-xl group-hover:scale-110 transition">📦</span>
          <span className="font-medium">المخزن (المنتجات)</span>
        </Link>

        <div className="border-t border-gray-100 my-4"></div>

        <Link href="#" className="flex items-center gap-3 p-3 text-gray-400 rounded-lg hover:bg-gray-50 cursor-not-allowed">
          <span>⚙️</span>
          <span>الإعدادات (قريباً)</span>
        </Link>
      </nav>

      {/* 🔵 معلومات المستخدم (في الأسفل) */}
      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
            A
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">Admin User</p>
            <p className="text-xs text-green-500">● متصل الآن</p>
          </div>
        </div>
      </div>
    </aside>
  );
}