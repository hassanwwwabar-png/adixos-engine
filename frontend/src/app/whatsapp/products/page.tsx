"use client";
import { useState, useEffect } from "react";
import { ShoppingBag, Plus, Trash2, Tag, FileText, DollarSign, UploadCloud, Image as ImageIcon } from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [details, setDetails] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 🚀 1. جلب المنتجات الحقيقية من السيرفر
  useEffect(() => {
    const storedUser = localStorage.getItem("adixos_user");
    if (!storedUser) return;
    
    const user = JSON.parse(storedUser);

    fetch(`/api/products?user_id=${user.id}`, { cache: "no-store" })
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  }, []);

  // 📸 2. دالة رفع الصورة
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert("⚠️ حجم الصورة كبير جداً! يرجى رفع صورة أقل من 3 ميجابايت.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // 🚀 3. إضافة منتج وإرساله للسيرفر
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    const storedUser = localStorage.getItem("adixos_user");
    if (!storedUser) {
      alert("الرجاء تسجيل الدخول أولاً");
      return;
    }
    const user = JSON.parse(storedUser);

    const newProduct = {
      user_id: user.id, // 👈 ربط المنتج بهذا المستخدم حصراً
      name,
      price: parseFloat(price),
      details: details || "بدون تفاصيل إضافية",
      image: image,
    };

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });

      if (res.ok) {
        // تحديث القائمة بعد الإضافة بنجاح
        fetch(`/api/products?user_id=${user.id}`, { cache: "no-store" })
          .then(r => r.json())
          .then(data => setProducts(data));
          
        // تفريغ الخانات
        setName("");
        setPrice("");
        setDetails("");
        setImage(null);
      } else {
        alert("Failed to save product to server.");
      }
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  // 🚀 4. حذف منتج من السيرفر
  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/products/${id}`, { method: "DELETE" });
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      
      <div className="flex items-center gap-4 mb-8 border-b border-slate-200 pb-6">
        <div className="w-14 h-14 bg-green-500/10 text-green-600 rounded-2xl flex items-center justify-center">
          <ShoppingBag size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Products Catalog</h1>
          <p className="text-slate-500">Add your products and pictures here, and your AI Bot will learn them instantly!</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* 📝 الجانب الأيسر: فورم إضافة منتج */}
        <div className="lg:col-span-1">
          <form onSubmit={handleAddProduct} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 space-y-5 sticky top-24">
            <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
              <Plus className="text-green-500" /> Add New Item
            </h2>
            
            {/* 📸 رفع الصورة */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Product Image</label>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:bg-slate-50 transition cursor-pointer relative group h-32 flex flex-col items-center justify-center overflow-hidden bg-slate-50/50">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                {image ? (
                  <img src={image} alt="Preview" className="w-full h-full object-cover absolute inset-0 opacity-80 group-hover:opacity-100 transition" />
                ) : (
                  <div className="group-hover:scale-105 transition-transform text-slate-400">
                    <UploadCloud size={32} className="mx-auto mb-2 text-slate-300" />
                    <p className="font-bold text-xs text-slate-500">Click to upload photo</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Product Name</label>
              <div className="relative">
                <Tag className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input type="text" required value={name} onChange={(e)=>setName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-green-500 font-medium" placeholder="e.g. Digital Marketing Consultation" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Price ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <input type="number" step="0.01" required value={price} onChange={(e)=>setPrice(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-green-500 font-medium" placeholder="99.00" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Details & AI Context</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3.5 text-slate-400" size={18} />
                <textarea rows={3} value={details} onChange={(e)=>setDetails(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-green-500 resize-none text-sm" placeholder="Comprehensive digital strategy for online growth..." />
              </div>
              <p className="text-[11px] font-bold text-slate-400 mt-2 uppercase tracking-wide">💡 AI uses this to answer questions</p>
            </div>

            <button type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-black transition flex items-center justify-center gap-2 mt-4 shadow-lg shadow-slate-900/20">
              Save Product to Catalog
            </button>
          </form>
        </div>

        {/* 🛍️ الجانب الأيمن: قائمة المنتجات */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Your AI Catalog ({products.length})</h2>
            </div>
            
            <div className="p-6">
              {loading ? (
                 <div className="text-center py-10"><p className="text-slate-500">Loading your catalog...</p></div>
              ) : products.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-3xl">
                  <ShoppingBag size={48} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500 font-bold text-lg">Your catalog is empty.</p>
                  <p className="text-slate-400 text-sm mt-1">Add a product to train your AI!</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {products.map((product) => (
                    <div key={product.id} className="border border-slate-100 rounded-2xl p-4 flex gap-4 hover:border-green-300 hover:shadow-lg transition bg-white group">
                      
                      {/* 🖼️ عرض صورة المنتج */}
                      <div className="w-24 h-24 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 overflow-hidden">
                        {product.image ? (
                           <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                        ) : (
                           <ImageIcon size={28} className="text-slate-300" />
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-extrabold text-slate-800 text-md line-clamp-1 pr-2">{product.name}</h3>
                            <button onClick={() => handleDelete(product.id)} className="text-slate-300 hover:text-red-500 transition p-1 bg-slate-50 rounded-md hover:bg-red-50">
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 pr-2">{product.details}</p>
                        </div>
                        
                        {/* 💰 شارة السعر */}
                        <div className="mt-3">
                           <span className="bg-green-100 text-green-700 font-extrabold px-3 py-1.5 rounded-lg text-sm inline-flex items-center gap-1 border border-green-200">
                             <DollarSign size={14}/> {product.price}
                           </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}