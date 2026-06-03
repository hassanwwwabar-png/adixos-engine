"use client";
import { useState, useEffect } from "react";
import { CreditCard, UploadCloud, AlertTriangle, Lock, CheckCircle2 } from "lucide-react";

export default function BillingPage() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // ⚙️ إعدادات الدفع (تأخذ قيماً مبدئية حتى يتم جلبها من السيرفر)
  const [settings, setSettings] = useState({ 
    price: "...", 
    bank_info: "Loading...", 
    crypto_info: "Loading..." 
  });

  // 🚀 جلب الأسعار وطرق الدفع من السيرفر
  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if(data) setSettings(data);
      })
      .catch(err => console.error("Error fetching settings:", err));
  }, []);

  // دالة تحويل الصورة لكي نتمكن من إرسالها للسيرفر
  // 1. دالة رفع الصورة (أضفنا لها فحص الحجم لمنع تحطم السيرفر)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 🚨 منع الصور التي يزيد حجمها عن 5 ميجابايت!
      if (file.size > 5 * 1024 * 1024) {
        alert("⚠️ حجم الصورة كبير جداً! يرجى رفع صورة بحجم أقل من 5 ميجابايت.");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // 2. دالة الإرسال (أضفنا لها كاشف الأخطاء الدقيق)
  const handleSubmitPayment = async () => {
    if (!image) return alert("Please upload a payment screenshot first!");
    
    setLoading(true);
    const savedUser = JSON.parse(localStorage.getItem("adixos_user") || "{}");

    // التأكد من أن حساب العميل موجود فعلاً في المتصفح
    if (!savedUser.id) {
      alert("❌ خطأ: لم يتم العثور على معرف العميل (ID). يرجى تسجيل الخروج والدخول مجدداً.");
      setLoading(false);
      return;
    }

    try {
      console.log("🚀 Sending payment for User:", savedUser.id); // للطباعة في الكونسول

      const res = await fetch("/api/payments/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: savedUser.id,
          image_url: image
        })
      });

      // قراءة رد السيرفر بالتفصيل
      const responseData = await res.json(); 

      if (res.ok) {
        console.log("✅ Success:", responseData);
        setSuccess(true);
      } else {
        console.error("❌ Server Error:", responseData);
        alert(`⚠️ رفض السيرفر الطلب: ${responseData.detail || "خطأ غير معروف"}`);
      }
    } catch (error) {
      console.error("❌ Fetch Error:", error);
      alert("⚠️ فشل الاتصال بالسيرفر! تأكد أن سيرفر البايثون يعمل.");
    } finally {
      setLoading(false);
    }
  };

  // شاشة النجاح بعد رفع الصورة
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-20 animate-in zoom-in duration-500">
        <CheckCircle2 size={80} className="text-green-500 mb-6" />
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Payment Under Review</h1>
        <p className="text-slate-500 max-w-md mx-auto">
          Thank you! We have received your payment screenshot. Our admin team will verify it and activate your account within 1-2 hours.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      
      {/* 🔴 رسالة الانتهاء */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
          <Lock className="text-red-600" size={36} />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Subscription Expired</h1>
        <p className="text-slate-500 mt-2 text-lg">Your free trial has ended. Please renew your subscription to reactivate the AI Bot.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* 💳 1. معلومات الدفع */}
        <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <CreditCard size={150} />
          </div>
          
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
            <CreditCard className="text-green-400" /> Payment Methods
          </h2>
          
          <div className="space-y-6 relative z-10">
            {/* حسابك البنكي */}
            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700">
              <p className="text-xs text-slate-400 font-bold uppercase mb-1">Bank Transfer (Local)</p>
              {/* 🚀 يتم جلبها من لوحة الإدارة */}
              <p className="text-xl font-mono font-bold tracking-wider text-white">{settings.bank_info}</p>
            </div>

            {/* حساب العملات الرقمية */}
            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700">
              <p className="text-xs text-slate-400 font-bold uppercase mb-1">Crypto Wallet</p>
              {/* 🚀 يتم جلبها من لوحة الإدارة */}
              <p className="text-sm font-mono font-bold break-all text-white">{settings.crypto_info}</p>
            </div>

            {/* السعر */}
            <div className="flex items-center gap-3 text-amber-400 bg-amber-400/10 p-4 rounded-xl text-sm border border-amber-400/20">
              <AlertTriangle size={20} className="shrink-0" />
              {/* 🚀 يتم جلبها من لوحة الإدارة */}
              <p>Monthly Subscription Price: <strong className="text-lg">${settings.price}</strong></p>
            </div>
          </div>
        </div>

        {/* 📤 2. رفع إثبات الدفع */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-800">
            <UploadCloud className="text-blue-500" /> Upload Receipt
          </h2>
          
          <p className="text-slate-500 text-sm mb-6">
            After making the transfer, upload a screenshot or photo of the receipt to activate your account instantly.
          </p>

          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:bg-slate-50 transition cursor-pointer mb-6 relative group">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            {image ? (
              <img src={image} alt="Receipt" className="max-h-40 mx-auto rounded-lg shadow-sm" />
            ) : (
              <div className="group-hover:scale-105 transition-transform">
                <UploadCloud size={40} className="mx-auto text-slate-400 mb-3" />
                <p className="font-bold text-slate-600">Click to upload screenshot</p>
                <p className="text-xs text-slate-400 mt-1">JPG, PNG up to 5MB</p>
              </div>
            )}
          </div>

          <button 
            onClick={handleSubmitPayment}
            disabled={loading || !image}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg shadow-blue-600/20"
          >
            {loading ? "Uploading..." : "Submit Payment for Review"}
          </button>
        </div>

      </div>
    </div>
  );
}