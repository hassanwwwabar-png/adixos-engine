"use client";
import { Smartphone, Instagram, Facebook, Globe, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Onboarding() {
  const router = useRouter();

  const handleSelect = (platform: string) => {
    // نرسل المستخدم لصفحة الربط مع اسم المنصة المختارة
    router.push(`/connect?platform=${platform}`);
  };

  const options = [
    { id: "whatsapp", name: "WhatsApp AI", icon: Smartphone, color: "bg-green-100 text-green-600", border: "hover:border-green-500" },
    { id: "instagram", name: "Instagram AI", icon: Instagram, color: "bg-pink-100 text-pink-600", border: "hover:border-pink-500" },
    { id: "facebook", name: "Facebook AI", icon: Facebook, color: "bg-blue-100 text-blue-600", border: "hover:border-blue-500" },
    { id: "omni", name: "Omni-Channel (All)", icon: Globe, color: "bg-indigo-100 text-indigo-600", border: "hover:border-indigo-500" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="text-center max-w-2xl mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-4">Welcome to ADIXOS! 🎉</h1>
        <p className="text-slate-500 text-lg">Let's get you started. Which platform would you like to connect first?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        {options.map((opt) => (
          <div 
            key={opt.id}
            onClick={() => handleSelect(opt.id)}
            className={`bg-white p-6 rounded-2xl shadow-sm border-2 border-transparent ${opt.border} cursor-pointer transition-all hover:shadow-md hover:-translate-y-1 flex items-center gap-4 group`}
          >
            <div className={`p-4 rounded-xl ${opt.color} transition-colors`}>
              <opt.icon size={32} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-slate-800">{opt.name}</h3>
              <p className="text-sm text-slate-400">Connect & Start Selling</p>
            </div>
            <ArrowRight className="text-slate-300 group-hover:text-slate-600 transition" />
          </div>
        ))}
      </div>
    </div>
  );
}