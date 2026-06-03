"use client";
import { LifeBuoy, Send, ShieldAlert, MessageCircleQuestion } from "lucide-react";
import { useState, useEffect } from "react";

export default function WhatsAppSupport() {
  const [msg, setMsg] = useState("");
  const [issueType, setIssueType] = useState("WhatsApp Bot not replying"); // 👈 أضفنا هذا
  const [sending, setSending] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("adixos_user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleSendToAdmin = async () => {
    if(!msg) return alert("Please write a message first.");
    setSending(true);

    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.id || "Unknown",
          user_name: user?.name || "Guest",
          issue_type: issueType,
          message: msg
        }),
      });

      if (response.ok) {
        setMsg("");
        alert("✅ Message sent to Admin! We will reply shortly.");
      } else {
        alert("❌ Failed to send message.");
      }
    } catch (error) {
      alert("❌ Connection error.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500 pb-10">
      
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <LifeBuoy className="text-green-600" size={32} />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Contact Admin Support</h1>
        <p className="text-slate-500 mt-2">Need help with your WhatsApp API or Bot? Send a direct message to our technical team.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <MessageCircleQuestion size={150} />
        </div>

        <div className="relative z-10 space-y-6">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 text-amber-800">
            <ShieldAlert className="shrink-0 mt-0.5" size={20} />
            <p className="text-sm font-medium leading-relaxed">
              If your bot is not replying, please check if your <strong>Meta Token</strong> has expired before sending a ticket.
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Issue Type</label>
            <select 
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full border p-3 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-green-500 font-medium text-slate-700"
            >
              <option>WhatsApp Bot not replying</option>
              <option>Meta API Disconnection</option>
              <option>Billing & Subscription</option>
              <option>Other / Feature Request</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Your Message</label>
            <textarea 
              rows={6} 
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Describe your issue..." 
              className="w-full border p-4 rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-green-500 resize-none text-sm" 
            />
          </div>

          <button 
            onClick={handleSendToAdmin} 
            disabled={sending}
            className="w-full bg-green-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-lg shadow-green-200"
          >
            {sending ? "Sending..." : <><Send size={20}/> Send Message to Admin</>}
          </button>
        </div>
      </div>
    </div>
  );
}