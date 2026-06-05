"use client";
import Link from "next/link";
import { Mail, Lock, ArrowRight, Loader2, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.detail || "Invalid credentials");

      // حفظ بيانات المستخدم مع رتبته (role)
      localStorage.setItem("adixos_user", JSON.stringify(data.user));

      // 🧠 التوجيه الذكي (The Smart Redirect)
      if (data.user.role === 'admin') {
        router.push('/admin'); // 👑 توجيه المدير للوحة الإدارة
      } else {
       router.push('/whatsapp'); // 👤 توجيه العميل للوحة التحكم
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-100 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="text-green-500" size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Welcome Back 👋</h1>
          <p className="text-slate-500">Sign in to your account</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold text-center mb-6 border border-red-100">⚠️ {error}</div>}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input type="password" required value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition flex items-center justify-center gap-2 mt-4 shadow-lg disabled:opacity-70">
             {isLoading ? <Loader2 className="animate-spin" size={20}/> : <>Access Dashboard <ArrowRight size={18} /></>}
          </button>
        </form>

        {/* 🚀 رابط إنشاء حساب جديد (تمت الإضافة هنا) */}
        <div className="mt-8 text-center text-sm text-slate-500">
          Don't have an account?{" "}
          <Link href="/signup" className="text-green-600 font-bold hover:underline transition">
            Sign up now
          </Link>
        </div>

      </div>
    </div>
  );
}