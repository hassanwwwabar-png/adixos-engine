"use client";
import Link from "next/link";
import { Mail, Lock, User, ArrowRight, Store, Loader2, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); 
    setIsLoading(true);

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, storeName, password }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.detail || "Failed to create account");

      localStorage.setItem("adixos_user", JSON.stringify(data.user));
      // 🚀 التوجيه مباشرة لصفحة مسح الـ QR Code للواتساب!
      router.push("/connect");

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 animate-in fade-in duration-500">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-100 p-8">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="text-green-500" size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Join ADIXOS 🚀</h1>
          <p className="text-slate-500">Create your WhatsApp AI Bot today</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold text-center mb-6 border border-red-100">⚠️ {error}</div>}

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input type="text" required value={name} onChange={(e)=>setName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-green-500" placeholder="John Doe" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Business Name</label>
            <div className="relative">
              <Store className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input type="text" required value={storeName} onChange={(e)=>setStoreName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-green-500" placeholder="My Awesome Store" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-green-500" placeholder="admin@store.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input type="password" required value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-green-500" placeholder="••••••••" />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-green-500 text-white font-bold py-3.5 rounded-xl hover:bg-green-600 transition flex items-center justify-center gap-2 mt-6 shadow-lg shadow-green-500/30 disabled:opacity-70">
            {isLoading ? <Loader2 className="animate-spin" size={20}/> : <>Start Automating <ArrowRight size={18} /></>}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6 font-medium">
          Already have an account? <Link href="/login" className="text-green-600 font-bold hover:underline">Sign In here</Link>
        </p>
      </div>
    </div>
  );
}