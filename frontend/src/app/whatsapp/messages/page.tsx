"use client";
import { useState, useEffect } from "react";
import { AlertCircle, Smartphone, ExternalLink, CheckCircle2, MessageSquareWarning, Trash2, Clock } from "lucide-react";

export default function RequiresAttention() {
  const [escalations, setEscalations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. دالة جلب البيانات الحقيقية من السيرفر
  const fetchEscalations = async () => {
    try {
      // 🚨 هذا الرابط يتصل بالبايثون مباشرة لجلب المشاكل المسجلة
      const res = await fetch("/api/escalations");
      const data = await res.json();
      setEscalations(data || []);
    } catch (error) {
      console.error("Error fetching escalations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. تشغيل الجلب عند فتح الصفحة + تحديث كل 5 ثوانٍ
  useEffect(() => {
    fetchEscalations();
    const interval = setInterval(fetchEscalations, 5000); // تحديث حي
    return () => clearInterval(interval);
  }, []);

  // 3. دالة حذف المشكلة بعد حلها (اختيارية، تحتاج إضافة مسار DELETE في البايثون إذا أردت تفعيلها)
  // حالياً سنقوم بإخفائها من الشاشة فقط
  // 3. دالة حذف المشكلة نهائياً من قاعدة البيانات والشاشة
  const markAsResolved = async (id: string) => {
    if(!confirm("Are you sure you resolved this issue?")) return;
    
    try {
      // 🚀 إرسال أمر الحذف للسيرفر (البايثون)
      await fetch(`/api/escalations/${id}`, { 
        method: "DELETE" 
      });
      
      // إخفاؤها من الشاشة فوراً
      setEscalations(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error("Failed to delete escalation:", error);
      alert("Error resolving the issue. Server might be down.");
    }
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto space-y-8 pb-10">
      
      <div className="flex items-center gap-4 mb-8 border-b border-slate-200 pb-6">
        <div className="w-14 h-14 bg-red-500/10 text-red-600 rounded-2xl flex items-center justify-center">
          <MessageSquareWarning size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Requires Human Attention</h1>
          <p className="text-slate-500">Real-time alerts for messages the AI couldn't answer.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
           <Clock className="animate-spin mb-4 text-slate-300" size={40} />
           <p className="font-bold">Scanning for alerts...</p>
        </div>
      ) : escalations.length === 0 ? (
        /* 🟢 حالة الهدوء */
        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center shadow-sm">
          <CheckCircle2 size={64} className="mx-auto text-green-500 mb-4 opacity-80" />
          <h2 className="text-2xl font-extrabold text-slate-800 mb-2">All Clear!</h2>
          <p className="text-slate-500">The AI is handling all conversations smoothly. No human intervention needed.</p>
        </div>
      ) : (
        /* 🔴 قائمة المشاكل الحقيقية */
        <div className="grid gap-4">
          {escalations.map((esc) => (
            <div key={esc.id} className="bg-white border border-red-100 rounded-3xl p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center shadow-sm hover:shadow-md transition relative overflow-hidden group">
              
              {/* شريط أحمر جانبي */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500 group-hover:w-2 transition-all"></div>

              <div className="flex-1 pl-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded-lg border border-red-100">
                     <AlertCircle size={14} />
                     <span className="text-[10px] font-extrabold uppercase tracking-wider">Help Needed</span>
                  </div>
                  <span className="text-sm font-bold text-slate-700 font-mono">
                    +{esc.customer_phone}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock size={12}/> {new Date(esc.date).toLocaleTimeString()}
                  </span>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 relative">
                    <div className="absolute -top-2 left-4 w-3 h-3 bg-slate-50 border-t border-l border-slate-100 transform rotate-45"></div>
                    <p className="text-slate-800 font-medium italic">
                    "{esc.question}"
                    </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                <button 
                  onClick={() => markAsResolved(esc.id)}
                  className="px-4 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-green-600 font-bold rounded-xl transition flex items-center gap-2 group/btn"
                  title="Mark as Done"
                >
                  <CheckCircle2 size={20} className="group-hover/btn:scale-110 transition" />
                </button>
                
                {/* 🚀 زر الواتساب الحقيقي */}
                <a 
                  href={`https://wa.me/${esc.customer_phone}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-slate-900 hover:bg-green-600 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 hover:shadow-green-600/30 w-full md:w-auto flex-1"
                >
                  <Smartphone size={18} /> Reply Now
                  <ExternalLink size={14} className="ml-1 opacity-70" />
                </a>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}