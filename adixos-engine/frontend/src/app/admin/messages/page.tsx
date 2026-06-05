"use client";
import { useState, useEffect } from "react";
import { MessageSquare, User, Clock, Tag, RefreshCw } from "lucide-react";

export default function AdminMessages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/support_messages");
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <MessageSquare className="text-blue-600" size={32} />
            Support Inbox
          </h1>
          <p className="text-slate-500 mt-1">Check messages and issues from your clients.</p>
        </div>
        <button onClick={fetchMessages} className="bg-white border border-slate-200 px-4 py-2 rounded-xl font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""}/> Refresh
        </button>
      </div>

      <div className="grid gap-4">
        {messages.length === 0 ? (
           <div className="p-10 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
             <MessageSquare size={48} className="mx-auto mb-4 opacity-20"/>
             No support messages yet.
           </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{msg.userName}</h3>
                    <p className="text-xs text-slate-400 font-mono">ID: {msg.userId}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold flex items-center gap-1">
                        <Tag size={12}/> {msg.issueType}
                    </span>
                    <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-lg text-xs font-bold flex items-center gap-1">
                        <Clock size={12}/> {new Date(msg.date).toLocaleDateString()}
                    </span>
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl text-slate-700 text-sm leading-relaxed border border-slate-100">
                {msg.message}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}