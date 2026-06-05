"use client";
import { useState, useEffect } from "react";
import { DollarSign, CheckCircle2, Clock, Image as ImageIcon, ShieldCheck, Settings, Save } from "lucide-react";

export default function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // إعدادات الدفع (تغيير السعر والبنك)
  const [settings, setSettings] = useState({ price: "", bank_info: "", crypto_info: "" });
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // جلب المدفوعات
      const payRes = await fetch("/api/admin/payments");
      const payData = await payRes.json();
      setPayments(payData);

      // جلب الإعدادات الحالية
      const setRes = await fetch("/api/settings");
      const setData = await setRes.json();
      setSettings(setData);

    } catch (error) {
      console.error("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings)
    });
    setSavingSettings(false);
    alert("✅ Payment settings updated!");
  };

  const handleApprove = async (paymentId: string) => {
    if(!confirm("Approve this payment and add 30 days to the user?")) return;
    await fetch(`/api/admin/payments/approve/${paymentId}`, { method: "POST" });
    fetchData();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in pb-10">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <DollarSign className="text-green-600" size={32} />
            Financial & Payments
          </h1>
          <p className="text-slate-500 mt-1">Manage subscriptions, prices, and approve receipts.</p>
        </div>
      </div>

      {/* ⚙️ قسم إعدادات الدفع (جديد!) */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg border border-slate-700">
        <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
           <Settings size={20} className="text-blue-400"/> Payment Methods & Pricing
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-slate-400 font-bold uppercase block mb-1">Subscription Price ($)</label>
            <input 
              type="text" 
              value={settings.price} 
              onChange={(e) => setSettings({...settings, price: e.target.value})}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 font-bold text-white focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-bold uppercase block mb-1">Bank Info (e.g. CIH)</label>
            <input 
              type="text" 
              value={settings.bank_info} 
              onChange={(e) => setSettings({...settings, bank_info: e.target.value})}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-sm text-white focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-bold uppercase block mb-1">Crypto Wallet (USDT)</label>
            <input 
              type="text" 
              value={settings.crypto_info} 
              onChange={(e) => setSettings({...settings, crypto_info: e.target.value})}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-sm text-white focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
            <button 
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-xl font-bold transition flex items-center gap-2"
            >
                {savingSettings ? "Saving..." : <><Save size={18}/> Update Settings</>}
            </button>
        </div>
      </div>

      {/* جدول المدفوعات */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
            <tr>
              <th className="p-5">Client</th>
              <th className="p-5">Date</th>
              <th className="p-5 text-center">Receipt</th>
              <th className="p-5 text-center">Status</th>
              <th className="p-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-slate-400 font-bold">Loading...</td></tr>
            ) : payments.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-slate-400">No payments found.</td></tr>
            ) : (
              payments.map((pay) => (
                <tr key={pay.id} className="hover:bg-slate-50 transition">
                  <td className="p-5 font-bold text-slate-800">
                    {pay.user_name}
                    <div className="text-xs text-slate-400 font-normal">{pay.user_email}</div>
                  </td>
                  <td className="p-5 text-slate-500 font-medium">
                    {new Date(pay.date).toLocaleDateString()}
                  </td>
                  
                  {/* زر عرض الصورة */}
                  <td className="p-5 text-center">
                    <button 
                      onClick={() => setSelectedImage(pay.image_url)} // 👈 الآن الرابط سيكون صحيحاً
                      className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-blue-100 transition inline-flex items-center gap-1"
                    >
                      <ImageIcon size={14}/> View
                    </button>
                  </td>

                  <td className="p-5 text-center">
                    {pay.status === 'pending' ? (
                      <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 justify-center w-fit mx-auto">
                        <Clock size={14}/> Pending
                      </span>
                    ) : (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 justify-center w-fit mx-auto">
                        <CheckCircle2 size={14}/> Approved
                      </span>
                    )}
                  </td>

                  <td className="p-5 text-right">
                    {pay.status === 'pending' ? (
                      <button 
                        onClick={() => handleApprove(pay.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 ml-auto shadow-sm"
                      >
                        <ShieldCheck size={16}/> Activate
                      </button>
                    ) : (
                      <span className="text-slate-400 font-bold text-xs uppercase">Activated</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* نافذة الصورة */}
      {selectedImage && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full">
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-red-400 font-bold text-lg"
            >
              CLOSE [X]
            </button>
            <img src={selectedImage} alt="Receipt" className="w-full h-auto rounded-lg shadow-2xl border border-slate-700" />
          </div>
        </div>
      )}

    </div>
  );
}