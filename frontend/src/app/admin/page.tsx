"use client";
import { useState, useEffect } from "react";
import { Users, Trash2, CalendarPlus, ShieldAlert, CheckCircle2, XCircle, Ban } from "lucide-react";

export default function AdminDashboard() {
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // جلب العملاء من قاعدة البيانات
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setClients(data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // إضافة 30 يوم للعميل
  const handleAddDays = async (userId: string) => {
    if (!confirm("Are you sure you want to add 30 days to this user?")) return;
    
    await fetch(`/api/admin/users/${userId}/add-days?days=30`, { method: "POST" });
    fetchUsers(); // تحديث القائمة
  };

  // 🛑 إيقاف العميل فوراً (تعليق الحساب)
  const handleRevokeAccess = async (userId: string) => {
    if (!confirm("⚠️ Are you sure you want to suspend this user? They will be locked out immediately!")) return;
    
    await fetch(`/api/admin/users/${userId}/revoke`, { method: "POST" });
    fetchUsers(); // تحديث القائمة لترى الحالة تحولت إلى Expired
  };

  // حذف العميل نهائياً
  const handleDeleteUser = async (userId: string) => {
    if (!confirm("🚨 WARNING: This will delete the user and all their messages! Continue?")) return;
    
    await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    fetchUsers(); // تحديث القائمة
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-8">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex items-center gap-4 mb-8 border-b border-slate-800 pb-6">
          <div className="w-14 h-14 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center">
            <ShieldAlert size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white">Admin Control Panel</h1>
            <p className="text-slate-400">Manage your SaaS clients, subscriptions, and payments.</p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="text-green-400"/> Registered Clients ({clients.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 text-slate-400 text-sm uppercase tracking-wider">
                  <th className="p-4 font-bold">Store & Owner</th>
                  <th className="p-4 font-bold">Email</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Expires On</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading clients...</td></tr>
                ) : clients.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-500">No clients registered yet.</td></tr>
                ) : (
                  clients.map(client => (
                    <tr key={client.id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition">
                      <td className="p-4">
                        <div className="font-bold text-white">{client.storeName}</div>
                        <div className="text-xs text-slate-400">{client.name}</div>
                      </td>
                      <td className="p-4 text-sm">{client.email}</td>
                      
                      {/* 🟢 حالة العميل (Active / Expired) */}
                      <td className="p-4">
                        {client.isActive ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20 shadow-sm">
                            <CheckCircle2 size={14} /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20 shadow-sm">
                            <XCircle size={14} /> Expired
                          </span>
                        )}
                      </td>
                      
                      {/* 📅 تاريخ الانتهاء */}
                      <td className={`p-4 text-sm font-medium ${client.isActive ? 'text-slate-300' : 'text-red-400'}`}>
                        {new Date(client.expiry).toLocaleDateString()}
                      </td>
                      
                      <td className="p-4 flex items-center justify-end gap-2">
                        {/* 🟢 زر التفعيل وإضافة الأيام */}
                        <button 
                          onClick={() => handleAddDays(client.id)}
                          className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-bold transition flex items-center gap-2 shadow-md shadow-green-500/20"
                          title="Add 30 Days Subscription"
                        >
                          <CalendarPlus size={16} /> +30 Days
                        </button>

                        {/* 🛑 زر الإيقاف الفوري */}
                        <button 
                          onClick={() => handleRevokeAccess(client.id)}
                          className="p-2 bg-slate-700 hover:bg-orange-500 text-slate-300 hover:text-white rounded-lg transition shadow-md"
                          title="Suspend Access Immediately"
                        >
                          <Ban size={18} />
                        </button>

                        {/* 🗑️ زر الحذف النهائي */}
                        <button 
                          onClick={() => handleDeleteUser(client.id)}
                          className="p-2 bg-slate-700 hover:bg-red-600 text-slate-300 hover:text-white rounded-lg transition shadow-md"
                          title="Delete Client Permanently"
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
    </div>
  );
}