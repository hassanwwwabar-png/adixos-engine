"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowRight, MessageCircle, Bot, QrCode, Zap, CheckCircle2, ShoppingBag } from "lucide-react";

export default function Home() {
  const [totalOrders, setTotalOrders] = useState<number | null>(null);
  const [recentBuyers, setRecentBuyers] = useState<string[]>([]);
  const [ordersList, setOrdersList] = useState<any[]>([]);

  // 🚀 جلب الطلبات والأرقام الحقيقية
  useEffect(() => {
    fetch("/api/orders")
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data)) {
          setTotalOrders(data.length);
          
          // 🛡️ تجهيز الطلبات وتشفير الأرقام لحماية خصوصية الزبائن (لأن هذه صفحة عامة)
          const safeOrders = data.map(order => {
            let safePhone = "N/A";
            if (order.customer_phone && order.customer_phone !== "N/A" && order.customer_phone !== "undefined") {
              const p = String(order.customer_phone);
              // تشفير الرقم (مثال: 212660571862 يصبح 2126••••62)
              safePhone = p.length > 8 ? `${p.slice(0, 4)}••••${p.slice(-2)}` : p;
            }
            return { ...order, safe_phone: safePhone };
          });

          setOrdersList(safeOrders.slice(0, 5));
          
          // 🛡️ سحب أحدث 3 أرقام للشريط العلوي
          const latestPhones = safeOrders
            .filter(order => order.safe_phone !== "N/A")
            .slice(0, 3)
            .map(order => `+${order.safe_phone}`);
            
          setRecentBuyers(latestPhones);
        }
      })
      .catch(err => console.error("Error fetching orders:", err));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-6 lg:px-12 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
            <MessageCircle className="text-white" size={24} />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight">ADIXOS<span className="text-green-500">.</span></span>
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="text-slate-600 font-bold hover:text-green-600 px-4 py-2 transition">Log In</Link>
          <Link href="/signup" className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-900/20">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="py-24 px-4 text-center max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 font-bold text-sm mb-8 border border-green-200">
          <Zap size={16} className="text-green-500" />
          No Meta Approvals Required. Connect in seconds.
        </div>
        <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
          Automate Your <span className="text-green-500">WhatsApp</span> Sales with AI.
        </h1>
        <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
          Just scan a QR code and let our AI handle customer replies, showcase your products, and close sales 24/7. Turn your WhatsApp into an automated revenue machine.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          <Link href="/signup" className="bg-green-500 text-white font-extrabold px-8 py-4 rounded-2xl hover:bg-green-600 transition flex items-center justify-center gap-2 shadow-xl shadow-green-500/30 text-lg">
            Start 14-Day Free Trial <ArrowRight size={20} />
          </Link>
        </div>

        {/* 📊 الدليل الاجتماعي: عدد الطلبات الحية + أرقام الزبائن */}
        {totalOrders !== null && totalOrders > 0 && (
          <div className="flex flex-col items-center justify-center gap-4 animate-in zoom-in duration-500 delay-300">
            
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-slate-50 bg-blue-100 flex items-center justify-center z-20">
                  <ShoppingBag size={18} className="text-blue-600"/>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-slate-50 bg-green-100 flex items-center justify-center z-10">
                  <span className="text-green-700 font-bold text-xs">+{totalOrders}</span>
                </div>
              </div>
              <p className="text-slate-600 font-medium">
                Over <span className="font-extrabold text-slate-900">{totalOrders} orders</span> processed automatically by AI!
              </p>
            </div>

            {/* 🔥 شريط المشتريات الحي (Live Purchases) */}
            {recentBuyers.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-slate-500 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                <span className="flex h-2 w-2 relative mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Recent buyers: 
                {recentBuyers.map((phone, i) => (
                  <span key={i} className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                    {phone}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 🛒 جدول الطلبات الحي في الصفحة الرئيسية (بأرقام مشفرة) */}
        {ordersList.length > 0 && (
          <div className="mt-16 bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden text-left animate-in zoom-in duration-700 max-w-5xl mx-auto">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <h2 className="text-lg font-bold text-slate-800">Live Recent Orders</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-sm">
                    <th className="p-4 font-bold border-b border-slate-100">Client Info</th>
                    <th className="p-4 font-bold border-b border-slate-100">Number</th>
                    <th className="p-4 font-bold border-b border-slate-100">Location</th>
                    <th className="p-4 font-bold border-b border-slate-100">Product Bought</th>
                    <th className="p-4 font-bold border-b border-slate-100">Value</th>
                    <th className="p-4 font-bold border-b border-slate-100">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersList.map((order, i) => (
                    <tr key={i} className="hover:bg-slate-50 border-b border-slate-50 transition">
                      <td className="p-4">
                        <p className="font-bold text-slate-800">{order.customer_name}</p>
                        <span className="text-[10px] text-green-600 bg-green-50 inline-block px-2 py-0.5 rounded mt-1 border border-green-100 font-bold">Bot Lead</span>
                      </td>
                      {/* 👇 عرض الرقم بشكل مشفر وآمن */}
                      <td className="p-4 font-mono text-slate-500 font-bold text-sm">
                        {order.safe_phone !== "N/A" ? `+${order.safe_phone}` : "N/A"}
                      </td>
                      <td className="p-4 text-slate-600 text-sm">{order.customer_address}</td>
                      <td className="p-4">
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold">{order.product_name}</span>
                      </td>
                      <td className="p-4 font-extrabold text-green-600">${order.total_price}</td>
                      <td className="p-4 text-sm text-slate-500">{new Date(order.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </header>

      {/* Features Section */}
      <section className="py-20 bg-white border-t border-slate-100 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900">Everything you need to scale on WhatsApp</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-xl hover:border-green-200 transition-all">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <QrCode size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Instant QR Connect</h3>
              <p className="text-slate-500 leading-relaxed">Forget complicated Meta APIs. Just scan the QR code with your phone and your bot is live instantly.</p>
            </div>
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-xl hover:border-green-200 transition-all">
              <div className="w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-6">
                <Bot size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">AI Auto-Replies</h3>
              <p className="text-slate-500 leading-relaxed">Train your AI to answer FAQs, send product catalogs, and guide customers to checkout automatically.</p>
            </div>
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-xl hover:border-green-200 transition-all">
              <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <CheckCircle2 size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Live Chat Override</h3>
              <p className="text-slate-500 leading-relaxed">Jump into any conversation at any time through our beautiful dashboard to close the high-ticket deals.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}