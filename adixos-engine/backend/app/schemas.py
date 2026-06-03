from pydantic import BaseModel
from typing import Optional

# 📦 قالب إضافة منتج جديد
class ProductCreate(BaseModel):
    name: str
    price: float
    description: Optional[str] = ""
    options: Optional[str] = ""
    owner_id: str  # المعرف الذي نرسله من الـ Frontend (مثل ID الواتساب أو الصفحة)

# 📦 قالب إرسال بيانات المنتج للواجهة
class ProductResponse(BaseModel):
    id: int
    name: str
    price: float
    description: Optional[str] = None
    options: Optional[str] = None
    code: str

    class Config:
        from_attributes = True  # للسماح بتحويل بيانات قاعدة البيانات إلى JSON بسهولة

# 🛒 قالب إرسال بيانات الطلبات للواجهة
class OrderResponse(BaseModel):
    id: int
    platform: str
    customer_phone: str
    product_name: str
    total_price: float
    status: str

    class Config:
        from_attributes = True