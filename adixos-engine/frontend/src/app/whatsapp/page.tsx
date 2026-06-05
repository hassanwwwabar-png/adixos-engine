"use client";
import { useState, useEffect } from "react";
import { DollarSign, Users, ShoppingCart, Activity, Trash2 } from "lucide-react";

export default function WhatsappOverview() {
  const [orders, setOrders] = useState<any[]>([]);
  const [revenue, setRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  // 🚀 جلب الطلبات الحقيقية (الخاصة بهذا المستخدم فقط)
  // 🚀 جلب الطلبات الحقيقية (الخاصة بهذا المستخدم فقط) بدون تخزين مؤقت
  useEffect(() => {
    // 1. جلب بيانات المستخدم الحالي من المتصفح
    const storedUser = localStorage.getItem("adixos_user");
    if (!storedUser) {
      setLoading(false);
      return; // إذا لم يكن هناك مستخدم مسجل، لا تفعل شيئاً
    }
    
    const user = JSON.parse(storedUser);

    // 2. إرسال الـ ID الخاص به مع منع الذاكرة المؤقتة (no-store)
    fetch(`/api/orders?user_id=${user.id}`, { cache: "no-store" })
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        // حساب إجمالي المبيعات من الطلبات الخاصة بهذا العميل فقط
        const total = data.reduce((sum: number, order: any) => sum + (order.total_price || 0), 0);
        setRevenue(total);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching orders:", err);
        setLoading(false);
      });
  }, []);
  // 🗑️ دالة حذف الطلب
  const handleDeleteOrder = async (id: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;

    try {
      await fetch(`/api/orders/${id}`, { method: "DELETE" });
      setOrders(prevOrders => {
        const newOrders = prevOrders.filter(order => order.id !== id);
        const newTotal = newOrders.reduce((sum: number, order: any) => sum + (order.total_price || 0), 0);
        setRevenue(newTotal);
        return newOrders;
      });
    } catch (error) {
      alert("Error deleting order. Please try again.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10 mt-6 lg:mt-0">
      
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
          <Activity className="text-green-500" size={32} />
          WhatsApp Overview
        </h1>
        <p className="text-slate-500 mt-2">Track your automated WhatsApp sales and AI performance.</p>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
            <DollarSign size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase">WA Sales Revenue</p>
            <p className="text-3xl font-extrabold text-slate-900">${revenue.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
            <ShoppingCart size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase">Total Orders</p>
            <p className="text-3xl font-extrabold text-slate-900">{orders.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center">
            <Users size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase">Leads Captured</p>
            <p className="text-3xl font-extrabold text-slate-900">{orders.length}</p>
          </div>
        </div>
      </div>

      {/* 🛒 جدول الطلبات */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">Recent WhatsApp Orders</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm">
                <th className="p-4 font-bold border-b border-slate-100">Client Info</th>
                <th className="p-4 font-bold border-b border-slate-100">Phone Number</th>
                <th className="p-4 font-bold border-b border-slate-100">Location</th>
                <th className="p-4 font-bold border-b border-slate-100">Product Bought</th>
                <th className="p-4 font-bold border-b border-slate-100">Value</th>
                <th className="p-4 font-bold border-b border-slate-100">Date</th>
                <th className="p-4 font-bold border-b border-slate-100 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center p-8 text-slate-400">Loading orders...</td></tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-slate-500 font-medium">
                    No WhatsApp orders yet. Share your number and let the bot sell!
                  </td>
                </tr>
              ) : (
                orders.map((order, i) => (
                  <tr key={i} className="hover:bg-slate-50 border-b border-slate-50 transition group">
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{order.customer_name}</p>
                      <span className="text-[10px] text-green-600 bg-green-50 inline-block px-2 py-0.5 rounded mt-1 border border-green-100 font-bold">
                        Bot Lead
                      </span>
                    </td>
                    
                    <td className="p-4">
                      <a 
                        href={`https://wa.me/${order.customer_phone}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm font-mono text-blue-600 hover:text-blue-800 hover:underline font-bold"
                      >
                        +{order.customer_phone || "N/A"}
                      </a>
                    </td>

                    <td className="p-4 text-slate-600">{order.customer_address}</td>
                    <td className="p-4">
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold">
                        {order.product_name}
                      </span>
                    </td>
                    <td className="p-4 font-extrabold text-green-600">${order.total_price}</td>
                    <td className="p-4 text-sm text-slate-500">{new Date(order.date).toLocaleDateString()}</td>
                    
                    {/* 🗑️ زر الحذف */}
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleDeleteOrder(order.id)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Order"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}