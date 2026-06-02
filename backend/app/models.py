from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    business_name = Column(String, default="My Store")
    
    # 🔗 ربط المنصات (Integration IDs)
    whatsapp_id = Column(String, unique=True, index=True, nullable=True) # Phone Number ID
    facebook_page_id = Column(String, unique=True, index=True, nullable=True)
    instagram_id = Column(String, unique=True, index=True, nullable=True)
    
    # 🔑 توكن ميتا (للسماح للبوت بإرسال الرسائل)
    meta_access_token = Column(String, nullable=True)
    
    # 🤖 شخصية البوت (Prompt)
    ai_prompt = Column(String, default="You are a helpful sales assistant. Sell our products and ask for the customer's phone and address.")

    # العلاقات (Relations)
    products = relationship("Product", back_populates="owner")
    orders = relationship("Order", back_populates="store")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    price = Column(Float)
    description = Column(String, nullable=True)
    options = Column(String, nullable=True) # مثل: "Red, Blue, XL"
    code = Column(String, unique=True, index=True) # كود فريد للمنتج
    
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="products")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    platform = Column(String) # "whatsapp", "instagram", "facebook"
    customer_phone = Column(String) # رقم العميل أو يوزر إنستغرام
    product_name = Column(String)
    total_price = Column(Float)
    status = Column(String, default="sold") # inquiry, lead, sold
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user_id = Column(Integer, ForeignKey("users.id"))
    store = relationship("User", back_populates="orders")