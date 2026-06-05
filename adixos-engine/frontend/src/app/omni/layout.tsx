"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Smartphone, 
  MessageSquare, 
  ShoppingBag, // 👈 أيقونة المنتجات
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  User as UserIcon 
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  
 useEffect(() => {
    const savedUser = localStorage.getItem("adixos_user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);

      // 🚨 حارس الأمن: فحص الاشتراك!
      if (parsedUser.role !== 'admin' && parsedUser.subscriptionEnds) {
        const expiryDate = new Date(parsedUser.subscriptionEnds);
        const now = new Date();
        
        // إذا انتهى الاشتراك، والمستخدم ليس في صفحة الدفع أصلاً
        if (now > expiryDate && !pathname.includes('/omni/billing')) {
          router.push('/omni/billing'); // 👈 طرد إلى صفحة الدفع!
        }
      }
    } else {
      router.push("/login");
    }
  }, [router, pathname]);

  const handleLogout = () => {
    localStorage.removeItem("adixos_user");
    localStorage.removeItem("adixos_platform");
    router.push("/login");
  };

  // 🟢 القائمة الجانبية المحدثة للعميل
  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/omni" },
    { name: "WhatsApp Scanner", icon: Smartphone, href: "/connect" },
    { name: "Live Chat", icon: MessageSquare, href: "/whatsapp/messages" },
    { name: "My Products", icon: ShoppingBag, href: "/whatsapp/products" }, // 👈 أضفنا الرابط هنا
    { name: "Settings", icon: Settings, href: "/omni/settings" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* القائمة في الموبايل */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 📱 القائمة الجانبية (Sidebar) */}
      <aside className={`fixed inset-y-0 left-0 bg-slate-900 w-64 text-slate-300 flex flex-col transition-transform duration-300 z-50 lg:static lg:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            ADIXOS<span className="text-green-500">.</span>
          </h1>
          <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  isActive 
                  ? "bg-green-500 text-white shadow-lg shadow-green-500/20" 
                  : "hover:bg-slate-800 hover:text-white"
                }`}
              >
                <item.icon size={20} className={isActive ? "text-white" : "text-slate-400"} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-slate-800/50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{user?.storeName || "My Store"}</p>
              <p className="text-xs text-slate-400 truncate">{user?.name || "Loading..."}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl font-bold transition-all">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* المحتوى الرئيسي */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-10">
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-xl font-extrabold text-slate-800">
                {menuItems.find(i => i.href === pathname)?.name || "Dashboard"}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:bg-slate-50 rounded-full transition">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}