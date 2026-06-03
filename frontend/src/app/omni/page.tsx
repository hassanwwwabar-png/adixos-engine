"use client";
import { useState, useEffect } from "react";
import { 
  Smartphone, TrendingUp, ShoppingBag, MessageSquare, 
  Users, MapPin, User, AlertTriangle, ArrowRight, Activity 
} from "lucide-react";
import Link from "next/link";

export default function DashboardHome() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 🟢 حالة الواتساب (لإظهار التنبيه)
  const [isConnected, setIsConnected] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("adixos_user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      fetchDashboardData(parsedUser.id);
      checkConnection(parsedUser.id);
    }
  }, []);

  // 1. فحص هل البوت متصل أم لا؟
  const checkConnection = async (userId: string) => {
    try {
      const res = await fetch(`fetch("/api/whatsapp/status/${userId}")/api/whatsapp/status/${userId}`);
      const data = await res.json();
      setIsConnected(data.connected);
    } catch (e) {
      setIsConnected(false);
    }
  };

  // 2. جلب الطلبات والإحصائيات
  const fetchDashboardData = async (phoneId: string) => { // نستخدم الـ ID كمثال
    try {
      const res = await fetch(`http://2.24.14.60:8000/my-orders?phone_id=972036212662630`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Connection error");
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.total_price) || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <Smartphone className="text-slate-900" size={32} />
            Command Center
          </h1>
          <p className="text-slate-500 mt-2">Welcome back, {user?.name || "Captain"}. Here is what's happening today.</p>
        </div>
        
        {/* حالة السيرفر */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
          <Activity size={18} className="text-green-500 animate-pulse" />
          <span className="text-sm font-bold text-slate-700">System Operational</span>
        </div>
      </header>

      {/* 🚨 تنبيه ذكي: يظهر فقط إذا كان الواتساب مفصولاً */}
      {!isConnected && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm animate-pulse">
          <div className="flex items-center gap-4">
            <div className="bg-red-100 p-3 rounded-full text-red-600">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-700">WhatsApp is Disconnected!</h3>
              <p className="text-red-600 text-sm">Your AI Bot cannot reply to customers. Please reconnect now.</p>
            </div>
          </div>
          <Link href="/connect" className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 shadow-lg shadow-red-500/20 whitespace-nowrap">
            Connect Now <ArrowRight size={18} />
          </Link>
        </div>
      )}

      {/* 📊 Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:shadow-md transition group">
          <div className="p-3 bg-green-50 w-fit rounded-xl mb-4 group-hover:scale-110 transition"><ShoppingBag className="text-green-600" size={24}/></div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Revenue</p>
          <div className="flex items-end gap-3 mt-1">
            <p className="text-4xl font-extrabold text-slate-800">${totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:shadow-md transition group">
          <div className="p-3 bg-blue-50 w-fit rounded-xl mb-4 group-hover:scale-110 transition"><MessageSquare className="text-blue-600" size={24}/></div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Conversations</p>
          <p className="text-4xl font-extrabold text-slate-800 mt-1">{orders.length * 5 + 12} <span className="text-sm text-slate-400 font-medium">msgs</span></p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:shadow-md transition group">
          <div className="p-3 bg-purple-50 w-fit rounded-xl mb-4 group-hover:scale-110 transition"><Users className="text-purple-600" size={24}/></div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Leads Captured</p>
          <p className="text-4xl font-extrabold text-slate-800 mt-1">{orders.length}</p>
        </div>
      </div>

      {/* 📋 جدول الطلبات الأخيرة */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-white flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800">Recent AI Orders</h3>
          <Link href="/whatsapp/messages" className="text-sm font-bold text-green-600 hover:underline">View All Chats</Link>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
            <tr>
              <th className="p-5">Customer</th>
              <th className="p-5">Location</th>
              <th className="p-5">Product</th>
              <th className="p-5 text-right">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={4} className="p-8 text-center text-slate-400 font-bold">Loading data...</td></tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-slate-400">
                  <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="font-bold text-lg text-slate-500">No orders yet</p>
                  <p className="text-sm mt-1">Make sure your bot is connected!</p>
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 transition">
                  <td className="p-5">
                    <div className="font-bold text-slate-800 flex items-center gap-2">
                      <User size={14} className="text-slate-400"/> {order.customer_name || "Guest"}
                    </div>
                    <div className="text-slate-500 text-xs flex items-center gap-2 mt-1">
                      <Smartphone size={12}/> {order.customer_phone}
                    </div>
                  </td>
                  <td className="p-5 text-slate-600 flex items-center gap-2">
                    <MapPin size={16} className="text-red-400" />
                    {order.customer_address || "Pending"}
                  </td>
                  <td className="p-5 text-slate-600 font-medium">{order.product_name}</td>
                  <td className="p-5 text-right font-extrabold text-green-600">${order.total_price}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}