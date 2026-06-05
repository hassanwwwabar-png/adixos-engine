"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // 👈 استدعاء useRouter
import { useEffect, useState } from "react"; // 👈 استدعاء hooks
import { LayoutDashboard, ShoppingBag, MessageSquare, Settings, LogOut, Smartphone, LifeBuoy, Loader2 } from "lucide-react";

export default function WhatsAppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter(); // 👈 تفعيل الموجه
  const [isChecking, setIsChecking] = useState(true); // 👈 حالة التحميل لفحص الاشتراك

  // ==========================================
  // 🚨 حارس الأمن (Security Guard)
  // ==========================================
  useEffect(() => {
    const savedUser = localStorage.getItem("adixos_user");
    
    // إذا لم يكن مسجلاً للدخول، اطرده لصفحة تسجيل الدخول
    if (!savedUser) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(savedUser);

    // فحص تاريخ انتهاء الاشتراك
    if (parsedUser.role !== 'admin' && parsedUser.subscriptionEnds) {
      const expiryDate = new Date(parsedUser.subscriptionEnds);
      const now = new Date();
      
      // إذا انتهى الاشتراك وهو ليس في صفحة الدفع، اطرده لصفحة الدفع
      if (now > expiryDate && !pathname.includes('/whatsapp/billing')) {
        router.push('/whatsapp/billing');
        return;
      }
    }
    
    setIsChecking(false); // ✅ العميل صالح، افتح له الأبواب!
  }, [router, pathname]);

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/whatsapp" },
    { name: "WA Catalog", icon: ShoppingBag, href: "/whatsapp/products" },
    { name: "WhatsApp Inbox", icon: MessageSquare, href: "/whatsapp/messages" },
    { name: "Settings", icon: Settings, href: "/whatsapp/settings" },
    { name: "Admin Support", icon: LifeBuoy, href: "/whatsapp/support" },
  ];

  // ⏳ شاشة تحميل أنيقة تظهر لجزء من الثانية أثناء فحص الحساب
  if (isChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-green-600 mb-4" size={48} />
        <p className="text-slate-500 font-bold animate-pulse">Checking account status...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      <aside className="w-72 bg-white border-r border-slate-200 hidden md:flex flex-col fixed h-screen z-10">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-2xl font-extrabold text-green-600 tracking-tight flex items-center gap-2">
            ADIXOS
          </h1>
          <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded mt-3 inline-block uppercase tracking-wider">
            WhatsApp Plan
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                  isActive ? "bg-green-600 text-white shadow-md shadow-green-200" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`}>
                  <item.icon size={18} className={isActive ? "text-white" : "text-slate-400"} /> 
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-100">
          <Link href="/login">
            <button className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition">
              <LogOut size={18} /> Logout
            </button>
          </Link>
        </div>
      </aside>

      <main className="flex-1 ml-72 flex flex-col min-h-screen">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
            <h2 className="font-bold text-slate-700 capitalize">{pathname.split('/').pop() || 'Overview'}</h2>
            <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              WA
            </div>
        </header>
        <div className="flex-1 p-8">{children}</div>
      </main>
    </div>
  );
}