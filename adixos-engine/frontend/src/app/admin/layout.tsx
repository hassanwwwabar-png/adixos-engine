"use client";
import { LayoutDashboard, Users, CreditCard, MessageSquare, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("adixos_user");
    router.push("/login");
  };

  const menuItems = [
    { name: "Clients & Active", icon: Users, href: "/admin" },
    { name: "Payments & Approval", icon: CreditCard, href: "/admin/payments" },
    { name: "Support Messages", icon: MessageSquare, href: "/admin/messages" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-200 font-sans">
      {/* ⬛ القائمة الجانبية السوداء */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col fixed h-full z-10">
        <div className="h-20 flex items-center px-8 border-b border-slate-800">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            ADMIN<span className="text-red-500">.</span>
          </h1>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  isActive 
                  ? "bg-red-600 text-white shadow-lg shadow-red-900/20" 
                  : "hover:bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <item.icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl font-bold transition">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* ⬜ منطقة المحتوى المتغيرة */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}