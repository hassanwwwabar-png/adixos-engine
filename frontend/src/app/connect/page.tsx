"use client";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { QRCodeSVG } from "qrcode.react";
import { useRouter } from "next/navigation";
import { Loader2, Smartphone, CheckCircle, LogOut, ArrowRight } from "lucide-react";

let socket: any;

export default function ConnectWhatsApp() {
  const router = useRouter();
  const [qrCode, setQrCode] = useState("");
  const [status, setStatus] = useState("initializing"); // initializing, waiting_qr, connected, already_connected
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // 1. جلب بيانات المستخدم
    const savedUser = localStorage.getItem("adixos_user");
    if (!savedUser) {
      router.push("/login");
      return;
    }
    const parsedUser = JSON.parse(savedUser);
    setUser(parsedUser);

    // 2. الاتصال بمحرك الواتساب (تم التصحيح هنا ✅)
    socket = io({
  transports: ["polling"], // نجبر المحرك على استخدام HTTP فقط لكي يمر من Vercel بسلام
});

    socket.on("connect", () => {
      console.log("🔌 Connected to WhatsApp Engine");
      
      // إرسال المنتجات + طلب بدء الجلسة
      const allProducts = JSON.parse(localStorage.getItem("adixos_products") || "[]");
      socket.emit("start_session", { 
        userId: parsedUser.id,
        products: allProducts 
      });
    });

    socket.on("qr_code", (qr: string) => {
      setQrCode(qr);
      setStatus("waiting_qr");
    });

    socket.on("connected", (msg: string) => {
      if (msg === 'WhatsApp Already Linked!') {
        // 🟢 حالة خاصة: إذا كان متصلاً مسبقاً، لا نحوله فوراً بل نعطيه الخيار
        setStatus("already_connected");
      } else {
        // اتصال جديد ناجح
        setStatus("connected");
        setTimeout(() => {
            router.push("/whatsapp"); // توجيه للوحة الإحصائيات
        }, 2000);
      }
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, [router]);

  // 🔌 دالة قطع الاتصال من هذه الصفحة مباشرة
  const handleForceDisconnect = async () => {
    if (!user) return;
    if(!confirm("Are you sure? This will disconnect the current bot.")) return;

    setStatus("initializing"); // إظهار التحميل

    try {
      // (تم التصحيح هنا ✅)
      await fetch('/api/whatsapp/disconnect', { 
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id })
      });
      
      // إعادة طلب جلسة جديدة (ستولد QR جديد لأننا فصلنا القديم)
      window.location.reload(); 
    } catch (error) {
      alert("Error disconnecting.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden text-center">
        
        {/* Header */}
        <div className="bg-slate-50 p-6 border-b border-slate-100">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
            <Smartphone className="text-green-600" size={32} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800">Connect WhatsApp</h1>
          <p className="text-slate-500 text-sm mt-1">Link your phone to activate the AI Sales Bot</p>
        </div>

        {/* Body Content */}
        <div className="p-8">
          
          {/* الحالة 1: جاري التحميل */}
          {status === "initializing" && (
            <div className="py-10">
              <Loader2 className="animate-spin text-green-500 mx-auto mb-4" size={48} />
              <p className="text-slate-400 font-bold">Starting Secure Session...</p>
            </div>
          )}

          {/* الحالة 2: عرض كود الـ QR */}
          {status === "waiting_qr" && (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-xl border-4 border-slate-100 inline-block shadow-inner">
                {qrCode ? (
                  <QRCodeSVG value={qrCode} size={220} />
                ) : (
                  <div className="w-[220px] h-[220px] bg-slate-100 animate-pulse rounded-lg"></div>
                )}
              </div>
              <div className="text-left text-sm text-slate-600 space-y-2 bg-slate-50 p-4 rounded-xl">
                <p>1. Open WhatsApp on your phone</p>
                <p>2. Tap Menu (⋮) or Settings ⚙️</p>
                <p>3. Select <b>Linked Devices</b></p>
                <p>4. Point your phone to this screen</p>
              </div>
            </div>
          )}

          {/* الحالة 3: تم الاتصال بنجاح (جديد) */}
          {status === "connected" && (
            <div className="py-10">
              <CheckCircle className="text-green-500 mx-auto mb-4" size={64} />
              <h2 className="text-2xl font-bold text-slate-800">Connected! 🎉</h2>
              <p className="text-slate-500 mt-2">Redirecting to dashboard...</p>
            </div>
          )}

          {/* الحالة 4: متصل مسبقاً */}
          {status === "already_connected" && (
            <div className="space-y-6">
              <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-200">
                <h3 className="font-bold flex items-center justify-center gap-2">
                   <CheckCircle size={20}/> Already Linked
                </h3>
                <p className="text-sm mt-1 opacity-80">Your WhatsApp is active and running.</p>
              </div>

              <div className="grid gap-3">
                <button 
                  onClick={() => router.push('/whatsapp')}
                  className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-black transition flex items-center justify-center gap-2 shadow-lg"
                >
                  Go to Dashboard <ArrowRight size={20} />
                </button>

                <button 
                  onClick={handleForceDisconnect}
                  className="w-full bg-white text-red-500 border border-red-100 py-3 rounded-xl font-bold hover:bg-red-50 transition flex items-center justify-center gap-2"
                >
                  <LogOut size={20} /> Disconnect & Scan New
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}