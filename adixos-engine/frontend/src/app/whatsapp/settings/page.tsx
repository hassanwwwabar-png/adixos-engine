"use client";
import { useState, useEffect } from "react";
import { 
  Settings, User, Lock, Smartphone, Save, 
  LogOut, RefreshCw, QrCode, ShieldCheck, AlertTriangle, CheckCircle2 
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // 🟢 الحالات الحقيقية الآن
  const [isWhatsappConnected, setIsWhatsappConnected] = useState(false); 
  const [connectedNumber, setConnectedNumber] = useState("Loading...");

  const [formData, setFormData] = useState({
    name: "Loading...",
    email: "Loading...",
    currentPassword: "",
    newPassword: "",
  });

  // 🚀 جلب البيانات الحقيقية من السيرفر عند فتح الصفحة
// 🚀 جلب البيانات الحقيقية من السيرفر عند فتح الصفحة
  useEffect(() => {
    const savedUser = localStorage.getItem("adixos_user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      
      // 🎯 قراءة اسم المتجر والإيميل الحقيقيين من الذاكرة
      setFormData({ 
        ...formData, 
        name: parsedUser.store_name || parsedUser.name || "", 
        email: parsedUser.email || "" 
      });
      
      // سؤال محرك الواتساب عن الحالة
      fetchWhatsappStatus(parsedUser.id);
    }
  }, []);

  const fetchWhatsappStatus = async (userId: string) => {
    try {
      // 🛠️ تم إصلاح الرابط هنا وإضافة منع الكاش
      const res = await fetch(`/api/whatsapp/status/${userId}`, { cache: "no-store" });
      const data = await res.json();
      
      setIsWhatsappConnected(data.connected);
      if (data.connected && data.number) {
        setConnectedNumber(data.number); // 👈 وضع الرقم الحقيقي هنا
      }
    } catch (error) {
      console.error("Error fetching WhatsApp status", error);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setTimeout(() => { 
      setLoading(false); 
      alert("✅ Profile updated successfully!"); 
    }, 1000);
  };

  // 🔌 دالة الفصل الحقيقية!
  const handleDisconnectWhatsapp = async () => {
    if(!confirm("Are you sure you want to disconnect? Your AI Bot will stop working.")) return;
    
    setLoading(true);
    try {
      // 🛠️ تم إصلاح الرابط هنا أيضاً
      const res = await fetch(`/api/whatsapp/disconnect`, { 
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id })
      });
      
      const data = await res.json();
      if(data.success) {
        setIsWhatsappConnected(false);
        setConnectedNumber("");
        alert("🔌 WhatsApp Disconnected Successfully.");
      }
    } catch (error) {
      alert("Error disconnecting from server.");
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    router.push('/connect');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
          <Settings className="text-slate-900" size={32} />
          Settings & Preferences
        </h1>
        <p className="text-slate-500 mt-2">Manage your account security and WhatsApp integration status.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 👈 إعدادات الحساب */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-800">
              <User className="text-blue-500"/> Profile Information
            </h2>
            <div className="grid gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Store Name / Full Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-slate-200 p-4 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full border border-slate-200 p-4 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700" 
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-800">
              <Lock className="text-orange-500"/> Security & Password
            </h2>
            <div className="grid gap-6">
               <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 flex gap-3 text-sm text-orange-800 mb-2">
                  <AlertTriangle size={18} className="shrink-0" />
                  Leave blank if you don't want to change your password.
               </div>
               <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">New Password</label>
                    <input type="password" placeholder="••••••••" className="w-full border border-slate-200 p-4 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Confirm Password</label>
                    <input type="password" placeholder="••••••••" className="w-full border border-slate-200 p-4 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
               </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={handleSaveProfile} disabled={loading} className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-black transition flex items-center gap-2 shadow-xl shadow-slate-200">
              {loading ? <RefreshCw className="animate-spin"/> : <Save size={20}/>} 
              Save Account Changes
            </button>
          </div>
        </div>

        {/* 👉 حالة الواتساب (الحقيقية!) */}
        <div className="lg:col-span-1 space-y-6">
            <div className={`rounded-3xl p-6 border-2 shadow-lg ${isWhatsappConnected ? "bg-white border-green-500" : "bg-slate-50 border-slate-200"}`}>
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Smartphone size={20} /> Connection Status
                    </h2>
                    {isWhatsappConnected ? (
                        <span className="bg-green-100 text-green-700 text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> ONLINE
                        </span>
                    ) : (
                        <span className="bg-slate-200 text-slate-500 text-xs font-extrabold px-3 py-1 rounded-full">
                            OFFLINE
                        </span>
                    )}
                </div>

                {isWhatsappConnected ? (
                    <div className="space-y-6">
                        <div className="text-center py-4">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3 border-4 border-green-100">
                                <ShieldCheck size={40} className="text-green-500" />
                            </div>
                            <p className="text-slate-500 text-sm font-medium">Linked Number</p>
                            {/* 🚀 هنا يظهر رقمك الحقيقي */}
                            <p className="text-2xl font-extrabold text-slate-800 tracking-wider font-mono">
                                +{connectedNumber}
                            </p>
                        </div>
                        
                        <div className="space-y-3">
                            <button 
                                onClick={handleDisconnectWhatsapp}
                                disabled={loading}
                                className="w-full bg-red-50 text-red-600 border border-red-100 py-3 rounded-xl font-bold hover:bg-red-100 transition flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? <RefreshCw className="animate-spin" size={18}/> : <LogOut size={18} />} Disconnect / Change Number
                            </button>
                            <p className="text-xs text-center text-slate-400 leading-relaxed">
                                To change the number, disconnect first, then scan the QR code with the new phone.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 text-center">
                        <div className="py-6">
                             <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 border-4 border-slate-200">
                                <Smartphone size={40} className="text-slate-400" />
                            </div>
                            <h3 className="text-slate-800 font-bold mb-1">No Device Connected</h3>
                            <p className="text-slate-400 text-sm">Your AI Bot is currently sleeping.</p>
                        </div>
                        
                        <button 
                            onClick={handleConnect}
                            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                        >
                            <QrCode size={20} /> Connect WhatsApp Now
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-slate-900 text-slate-300 p-6 rounded-3xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                    <QrCode size={100} />
                 </div>
                 <h3 className="text-white font-bold text-lg mb-2">Need Help?</h3>
                 <p className="text-sm opacity-80 mb-4">Make sure your phone stays connected to the internet for the bot to reply 24/7.</p>
                 <div className="flex items-center gap-2 text-xs font-mono text-green-400">
                    <CheckCircle2 size={14}/> System Operational
                 </div>
            </div>
        </div>

      </div>
    </div>
  );
}