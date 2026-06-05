from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import bcrypt
import uuid
import requests
from datetime import datetime, timedelta 
from fastapi.staticfiles import StaticFiles
from typing import Optional  # 👈 هذا هو السطر الجديد الذي أضفناه

app = FastAPI()

# 👈 أضف هيكل المنتج هنا مباشرة تحت app = FastAPI()
class Product(BaseModel):
    user_id: str
    name: str
    price: float
    details: str
    image: Optional[str] = None
# 🛡️ إعداد الـ CORS للسماح للواجهة الأمامية بالاتصال
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", # نتركه للتجارب المحلية
        "https://adixos-frontend.vercel.app" # 👈 الدومين الحقيقي الخاص بك
    ], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ==========================================
# 🔑 مفاتيح ميتا (Meta Credentials)
# ==========================================
# ⚠️ استبدل هذه القيم بالقيم الحقيقية من حساب المطور الخاص بك
META_APP_ID = "ضع_رقم_التطبيق_هنا"
META_APP_SECRET = "ضع_الرقم_السري_للتطبيق_هنا"
META_VERIFY_TOKEN = "adixos_super_secret_123"
META_ACCESS_TOKEN = "EAAcNWslZBr00BQZCrZCBNpp7apdkwuZCbV0p6hg6tOmkeqZBghn1V3Lfqqn6xLB8jSHuiW7StlUMXTsRvChAV5UCIpxDxQMFdL8eE3jYF6hNZBCB5CZB95rfUweldi7jy1rMAxDrRmb2C2wno46P2u4JYSt6DT5IsTF4uzRthysZBrah9ZAyC6mA6MU01VTIWZBtAbjx0Yr5lzSaZB6kFmbVOLxWpY8liZA23hZCGp8Fy2x1p1qGwKJt0dWaUJWQY6GvmrW0WZBF8dWZAcLFr5ekboxGZAfD"
PHONE_NUMBER_ID = "972036212662630"

# ==========================================
# 🗄️ إعداد قاعدة البيانات (SQLite)
# ==========================================
# ==========================================
# 🗄️ إعداد قاعدة البيانات (SQLite) المحدثة
# ==========================================
conn = sqlite3.connect("saas.db", check_same_thread=False)
cursor = conn.cursor()

# 1. جدول المستخدمين (الآن يحتوي على role و subscription_ends)
cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        store_name TEXT,
        password_hash TEXT,
        role TEXT DEFAULT 'user',
        subscription_ends TIMESTAMP
    )
""")
conn.commit()
# 2. جدول الاتصالات
cursor.execute("""
    CREATE TABLE IF NOT EXISTS connections (
        user_id TEXT,
        platform TEXT,
        access_token TEXT,
        PRIMARY KEY (user_id, platform)
    )
""")

# 3. جدول الرسائل
cursor.execute("""
    CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        platform TEXT,
        sender TEXT,
        text TEXT,
        type TEXT
    )
""")
# ==========================================
# 🛒 جدول الطلبات (Orders Table)
# ==========================================
# ==========================================
# 🛒 جدول الطلبات (Orders من الواتساب)
# ==========================================
cursor.execute("""
    CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        phone_id TEXT,
        customer_phone TEXT,
        customer_name TEXT,
        customer_address TEXT,
        product_name TEXT,
        total_price REAL,
        platform TEXT,
        created_at TIMESTAMP
    )
""")
# ==========================================
# 🛍️ جدول الكتالوج (المنتجات الخاصة بكل مستخدم)
# ==========================================
cursor.execute("""
    CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        name TEXT,
        price REAL,
        details TEXT,
        image TEXT
    )
""")
conn.commit()

# 🚨 جدول الإنذارات والأسئلة الصعبة (Escalations)
cursor.execute("""
    CREATE TABLE IF NOT EXISTS escalations (
        id TEXT PRIMARY KEY,
        phone_id TEXT,
        customer_phone TEXT,
        question TEXT,
        created_at TIMESTAMP
    )
""")
conn.commit()

# --- نماذج استقبال البيانات ---
class NewOrder(BaseModel):
    phone_id: str
    customer_phone: str
    customer_name: str
    customer_address: str
    product_name: str
    total_price: float
    platform: str

class EscalationAlert(BaseModel):
    phone_id: str
    customer_phone: str
    question: str

# 1. مسار استقبال الطلبات الجديدة من البوت
@app.post("/api/orders")
def create_order(order: NewOrder):
    order_id = "ORD-" + str(uuid.uuid4())[:8]
    cursor.execute(
        "INSERT INTO orders VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (order_id, order.phone_id, order.customer_phone, order.customer_name, 
         order.customer_address, order.product_name, order.total_price, order.platform, datetime.now())
    )
    conn.commit()
    print(f"💰 NEW ORDER SAVED: {order.product_name} by {order.customer_name}")
    return {"message": "Order saved successfully"}

# 2. مسار استقبال الأسئلة الصعبة من البوت
@app.post("/api/escalations")
def create_escalation(alert: EscalationAlert):
    esc_id = "ESC-" + str(uuid.uuid4())[:8]
    cursor.execute(
        "INSERT INTO escalations VALUES (?, ?, ?, ?, ?)",
        (esc_id, alert.phone_id, alert.customer_phone, alert.question, datetime.now())
    )
    conn.commit()
    print(f"🚨 ESCALATION SAVED: Need help with {alert.customer_phone}")
    return {"message": "Escalation saved"}
# 2. مسار إرسال الطلبات للوحة التحكم (Frontend)
@app.get("/my-orders")
def get_orders(phone_id: str):
    cursor.execute("SELECT * FROM orders WHERE phone_id=? ORDER BY created_at DESC", (phone_id,))
    rows = cursor.fetchall()
    return [{
        "id": r[0], "customer_phone": r[2], "customer_name": r[3],
        "customer_address": r[4], "product_name": r[5], "total_price": r[6], "platform": r[7]
    } for r in rows]
conn.commit()

# ==========================================
# 👑 إنشاء حساب المدير الافتراضي (Admin Account)
# ==========================================
cursor.execute("SELECT * FROM users WHERE email = 'admin@adixos.com'")
if not cursor.fetchone():
    salt = bcrypt.gensalt()
    admin_password = "AdixosAdmin2026"
    hashed_admin_pw = bcrypt.hashpw(admin_password.encode('utf-8'), salt)
    
    cursor.execute(
        "INSERT INTO users (id, name, email, store_name, password_hash, role, subscription_ends) VALUES (?, ?, ?, ?, ?, 'admin', '2099-12-31 00:00:00.000000')",
        ("ADMIN-1", "Super Admin", "admin@adixos.com", "ADIXOS HQ", hashed_admin_pw)
    )
    conn.commit()
    print("👑 Admin Account created automatically!")
# ==========================================
# 📦 قوالب البيانات (Pydantic Models)
# ==========================================
class SignUpRequest(BaseModel):
    name: str
    email: str
    storeName: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class ConnectRequest(BaseModel):
    user_id: str
    platform: str
    auth_code: str


# ==========================================
# 🚀 مسارات التوثيق (Auth Routes)
# ==========================================

@app.post("/api/login")
def login(user: LoginRequest):
    # 1. جلب تاريخ الانتهاء (subscription_ends) مع البيانات
    cursor.execute("SELECT id, name, store_name, password_hash, role, subscription_ends FROM users WHERE email = ?", (user.email,))
    db_user = cursor.fetchone()

    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    user_id, name, store_name, password_hash, role, sub_ends = db_user

    if isinstance(password_hash, str):
        if password_hash.startswith("b'") or password_hash.startswith('b"'):
            password_hash = eval(password_hash)
        else:
            password_hash = password_hash.encode('utf-8')

    if not bcrypt.checkpw(user.password.encode('utf-8'), password_hash):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    # 2. إرسال تاريخ الانتهاء للواجهة الأمامية
    return {
        "message": "Login successful", 
        "user": {
            "id": user_id, 
            "name": name, 
            "storeName": store_name, 
            "role": role,
            "subscriptionEnds": sub_ends # 👈 أضفنا هذا!
        }
    }
# 🔗 مسار ربط منصات ميتا (OAuth)
# ==========================================

@app.post("/api/connect")
def connect_platform(req: ConnectRequest):
    # 👈 تم تغيير الرابط ليعود العميل إلى لوحة التحكم الحقيقية بعد ربط فيسبوك
    REDIRECT_URI = "https://adixos-frontend.vercel.app/connect" 
    meta_url = f"https://graph.facebook.com/v19.0/oauth/access_token"
    params = {
        "client_id": META_APP_ID,
        "redirect_uri": REDIRECT_URI,
        "client_secret": META_APP_SECRET,
        "code": req.auth_code
    }
    # ... بقية الكود كما هو ...
    
    response = requests.get(meta_url, params=params)
    data = response.json()

    if "error" in data:
        raise HTTPException(status_code=400, detail=f"Meta Error: {data['error'].get('message', 'Unknown error')}")

    real_access_token = data.get("access_token")
    if not real_access_token:
        raise HTTPException(status_code=400, detail="Failed to get access token from Meta")

    cursor.execute("""
        INSERT INTO connections (user_id, platform, access_token) 
        VALUES (?, ?, ?)
        ON CONFLICT(user_id, platform) DO UPDATE SET access_token=excluded.access_token
    """, (req.user_id, req.platform, real_access_token))
    conn.commit()

    return {"message": "Successfully connected to Meta!", "platform": req.platform}


# ==========================================
# 📩 مسار جلب الرسائل للواجهة الأمامية
# ==========================================
@app.get("/api/messages/{platform}/{user_id}")
def get_messages(platform: str, user_id: str):
    cursor.execute("SELECT id, sender, text, type FROM messages WHERE platform = ? AND user_id = ?", (platform, user_id))
    rows = cursor.fetchall()
    
    # تحويل البيانات إلى JSON
    messages_list = [{"id": r[0], "sender": r[1], "text": r[2], "type": r[3]} for r in rows]
    return {"messages": messages_list}
# 🛒 مسار جلب الطلبات لعرضها في لوحة التحكم
@app.get("/api/orders")
# 🛒 مسار جلب الطلبات لعرضها في لوحة التحكم
@app.get("/api/orders")
def get_orders():
    # 👈 أضفنا customer_phone في الاستعلام
    cursor.execute("SELECT id, customer_name, customer_address, product_name, total_price, platform, created_at, customer_phone FROM orders ORDER BY created_at DESC")
    rows = cursor.fetchall()
    
    return [{
        "id": r[0],
        "customer_name": r[1],
        "customer_address": r[2],
        "product_name": r[3],
        "total_price": r[4],
        "platform": r[5],
        "date": r[6],
        "customer_phone": r[7] if len(r) > 7 else "N/A" # 👈 إضافة الرقم هنا
    } for r in rows]
# ==========================================
# 🤖 دالة إرسال الرد عبر واتساب API
# ==========================================
def send_whatsapp_reply(to_phone, text):
    url = f"https://graph.facebook.com/v24.0/{PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {META_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": to_phone,
        "type": "text",
        "text": {"body": text}
    }
    
    response = requests.post(url, headers=headers, json=payload)
    if response.status_code == 200:
        print("✅ تم إرسال الرد للعميل بنجاح!")
    else:
        print(f"❌ فشل إرسال الرد: {response.text}")


# ==========================================
# 📡 مسارات الواتساب (Webhooks & Auto-Reply)
# ==========================================

# 1. التحقق من الـ Webhook
@app.get("/webhook")
async def verify_webhook(request: Request):
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")

    if mode == "subscribe" and token == META_VERIFY_TOKEN:
        print("✅ Webhook Verified Successfully!")
        return int(challenge)
    
    return Response(content="Forbidden", status_code=403)

# 2. استقبال الرسائل وحفظها والرد عليها
@app.post("/webhook")
async def receive_whatsapp_message(request: Request):
    body = await request.json()
    
    try:
        if body.get("entry") and body["entry"][0].get("changes") and body["entry"][0]["changes"][0].get("value"):
            value = body["entry"][0]["changes"][0]["value"]
            if value.get("messages"):
                message = value["messages"][0]
                customer_phone = message["from"] 
                message_text = message["text"]["body"] 
                
                print(f"\n📩 رسالة جديدة من {customer_phone}: {message_text}")
                
                # أ) البحث عن المستخدم المالك لهذا الواتساب (مؤقتاً سنجلب أول مستخدم متصل)
                cursor.execute("SELECT user_id FROM connections WHERE platform='whatsapp' LIMIT 1")
                conn_row = cursor.fetchone()
                user_id = conn_row[0] if conn_row else "UNKNOWN_USER"

                # ب) حفظ رسالة العميل في قاعدة البيانات
                msg_id = "MSG-" + str(uuid.uuid4())[:8]
                cursor.execute("INSERT INTO messages VALUES (?, ?, ?, ?, ?, ?)", 
                               (msg_id, user_id, "whatsapp", customer_phone, message_text, "incoming"))
                conn.commit()
                
                # ج) إرسال رد تلقائي
                reply_text = f"مرحباً! لقد استلمنا رسالتك: '{message_text}'. كيف يمكننا مساعدتك؟ 🤖"
                send_whatsapp_reply(customer_phone, reply_text)

                # د) حفظ رد البوت في قاعدة البيانات
                reply_id = "MSG-" + str(uuid.uuid4())[:8]
                cursor.execute("INSERT INTO messages VALUES (?, ?, ?, ?, ?, ?)", 
                               (reply_id, user_id, "whatsapp", "Adixos AI", reply_text, "outgoing"))
                conn.commit()

    except Exception as e:
        print(f"حدث خطأ أثناء قراءة الرسالة: {e}")

    return Response(content="EVENT_RECEIVED", status_code=200)
    from datetime import datetime, timedelta

# ... (الكود السابق في الأعلى كما هو) ...

# 🗄️ إعداد قاعدة البيانات (المحدثة للـ SaaS)
conn = sqlite3.connect("saas.db", check_same_thread=False)
cursor = conn.cursor()

cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        store_name TEXT,
        password_hash TEXT,
        role TEXT DEFAULT 'user', 
        subscription_ends TIMESTAMP 
    )
""")
# ... (باقي الجداول connections و messages كما هي) ...
conn.commit()


# 🚀 مسار التسجيل (مع إعطاء 3 أيام تجربة مجانية تلقائياً)
@app.post("/api/signup")
def signup(user: SignUpRequest):
    cursor.execute("SELECT * FROM users WHERE email = ?", (user.email,))
    if cursor.fetchone():
        raise HTTPException(status_code=400, detail="Email already exists!")

    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), salt)
    user_id = "USR-" + str(uuid.uuid4())[:8]
    
    # 🌟 إعطاء العميل 3 أيام فترة تجريبية (Free Trial)
    trial_ends = datetime.now() + timedelta(days=3)

    cursor.execute(
        "INSERT INTO users (id, name, email, store_name, password_hash, role, subscription_ends) VALUES (?, ?, ?, ?, ?, 'user', ?)",
        (user_id, user.name, user.email, user.storeName, hashed_password, trial_ends)
    )
    conn.commit()
    return {"message": "Account created!", "user": {"id": user_id, "name": user.name, "storeName": user.storeName, "role": "user"}}







# 🛍️ جلب المنتجات (مخصصة لكل مستخدم)
@app.get("/api/products")
def get_products(user_id: str):
    cursor.execute("SELECT id, name, price, details, image FROM products WHERE user_id = ?", (user_id,))
    rows = cursor.fetchall()
    return [
        {"id": r[0], "name": r[1], "price": r[2], "details": r[3], "image": r[4]}
        for r in rows
    ]

# 🛍️ إضافة منتج جديد
@app.post("/api/products")
def add_product(prod: Product):
    product_id = str(uuid.uuid4())
    cursor.execute(
        "INSERT INTO products (id, user_id, name, price, details, image) VALUES (?, ?, ?, ?, ?, ?)",
        (product_id, prod.user_id, prod.name, prod.price, prod.details, prod.image)
    )
    conn.commit()
    return {"message": "Product added successfully", "id": product_id}

# 🛍️ حذف منتج
@app.delete("/api/products/{product_id}")
def delete_product(product_id: str):
    cursor.execute("DELETE FROM products WHERE id = ?", (product_id,))
    conn.commit()
    return {"message": "Product deleted successfully"}




    
# ==========================================
# 👑 مسارات الإدارة (Admin Routes)
# ==========================================

# 1. جلب كل العملاء
@app.get("/api/admin/users")
def get_all_users():
    cursor.execute("SELECT id, name, email, store_name, subscription_ends FROM users WHERE role='user'")
    rows = cursor.fetchall()
    users_list = []
    for r in rows:
        expiry_date = datetime.strptime(r[4], '%Y-%m-%d %H:%M:%S.%f') if r[4] else datetime.now()
        is_active = expiry_date > datetime.now()
        users_list.append({
            "id": r[0], "name": r[1], "email": r[2], "storeName": r[3], 
            "expiry": expiry_date.strftime('%Y-%m-%d'), "isActive": is_active
        })
    return {"users": users_list}

# 2. إضافة أيام لاشتراك العميل (بعد الدفع)
@app.post("/api/admin/users/{user_id}/add-days")
def add_days_to_user(user_id: str, days: int = 30):
    cursor.execute("SELECT subscription_ends FROM users WHERE id=?", (user_id,))
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    
    current_expiry = datetime.strptime(row[0], '%Y-%m-%d %H:%M:%S.%f') if row[0] else datetime.now()
    # إذا كان منتهي الصلاحية، نبدأ من اليوم. إذا لم ينتهِ، نضيف على المدة المتبقية
    start_date = datetime.now() if current_expiry < datetime.now() else current_expiry
    new_expiry = start_date + timedelta(days=days)
    
    cursor.execute("UPDATE users SET subscription_ends=? WHERE id=?", (new_expiry, user_id))
    conn.commit()
    return {"message": f"Added {days} days successfully", "new_expiry": new_expiry.strftime('%Y-%m-%d')}

# 3. حذف عميل نهائياً
@app.delete("/api/admin/users/{user_id}")
def delete_user(user_id: str):
    cursor.execute("DELETE FROM users WHERE id=?", (user_id,))
    cursor.execute("DELETE FROM messages WHERE user_id=?", (user_id,)) # مسح رسائله أيضاً
    conn.commit()
    return {"message": "User deleted successfully"}

# ... (أكمل باقي الكود الخاص بـ login و get_messages كما كان) ...
# ==========================================
# 👑 إنشاء حساب المدير الافتراضي (Admin Account)
# ==========================================
cursor.execute("SELECT * FROM users WHERE email = 'admin@adixos.com'")
if not cursor.fetchone():
    salt = bcrypt.gensalt()
    # 🔑 كلمة المرور الخاصة بك كمدير:
    admin_password = "AdixosAdmin2026"
    hashed_admin_pw = bcrypt.hashpw(admin_password.encode('utf-8'), salt)
    
    # إعطاء المدير اشتراك لا ينتهي أبداً (سنة 2099)
    cursor.execute(
        "INSERT INTO users (id, name, email, store_name, password_hash, role, subscription_ends) VALUES (?, ?, ?, ?, ?, 'admin', '2099-12-31 00:00:00.000000')",
        ("ADMIN-1", "Super Admin", "admin@adixos.com", "ADIXOS HQ", hashed_admin_pw)
    )
    conn.commit()
    print("👑 Admin Account created automatically!")
    # 💰 جدول طلبات الدفع (Payment Requests)
cursor.execute("""
    CREATE TABLE IF NOT EXISTS payment_requests (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        user_name TEXT,
        image_url TEXT,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP
    )
""")
# 🚨 جدول الأسئلة الصعبة (Escalations)
cursor.execute("""
    CREATE TABLE IF NOT EXISTS escalations (
        id TEXT PRIMARY KEY,
        phone_id TEXT,
        customer_phone TEXT,
        question TEXT,
        created_at TIMESTAMP
    )
""")
conn.commit()

class EscalationCreate(BaseModel):
    phone_id: str
    customer_phone: str
    question: str

# مسار استلام السؤال الصعب من الذكاء الاصطناعي
@app.post("/api/escalations")
def create_escalation(esc: EscalationCreate):
    esc_id = "ESC-" + str(uuid.uuid4())[:8]
    cursor.execute(
        "INSERT INTO escalations VALUES (?, ?, ?, ?, ?)",
        (esc_id, esc.phone_id, esc.customer_phone, esc.question, datetime.now())
    )
    conn.commit()
    return {"message": "Escalation saved!"}

# مسار جلب الأسئلة الصعبة للوحة الإدارة
# 🚨 مسار جلب الإنذارات (الأسئلة التي لم يعرف البوت إجابتها)
@app.get("/api/escalations")
def get_escalations():
    cursor.execute("SELECT id, customer_phone, question, created_at FROM escalations ORDER BY created_at DESC")
    rows = cursor.fetchall()
    
    return [{
        "id": r[0],
        "customer_phone": r[1],
        "question": r[2],
        "date": r[3]
    } for r in rows]

    # 🗑️ مسار حذف الإنذار بعد أن يحله المدير
@app.delete("/api/escalations/{esc_id}")
def delete_escalation(esc_id: str):
    cursor.execute("DELETE FROM escalations WHERE id = ?", (esc_id,))
    conn.commit()
    print(f"✅ ESCALATION RESOLVED AND DELETED: {esc_id}")
    return {"message": "Escalation resolved successfully"}
# مسار حذف السؤال بعد أن يرد عليه المدير
@app.delete("/api/escalations/{esc_id}")
def resolve_escalation(esc_id: str):
    cursor.execute("DELETE FROM escalations WHERE id=?", (esc_id,))
    conn.commit()
    return {"message": "Resolved!"}
conn.commit()

# --- مسارات الدفع للإدارة ---

# 1. العميل يرفع صورة التحويل
class PaymentUpload(BaseModel):
    user_id: str
    image_url: str # سنستخدم رابط وهمي أو Base64 للتسهيل حالياً
# 🆘 جدول رسائل الدعم (Support Tickets)
cursor.execute("""
    CREATE TABLE IF NOT EXISTS support_messages (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        user_name TEXT,
        issue_type TEXT,
        message TEXT,
        created_at TIMESTAMP
    )
""")
conn.commit()

# --- مسارات الدعم الفني ---

class SupportMessage(BaseModel):
    user_id: str
    user_name: str
    issue_type: str
    message: str

# 1. العميل يرسل رسالة
@app.post("/api/support")
def send_support_message(msg: SupportMessage):
    msg_id = "MSG-" + str(uuid.uuid4())[:8]
    cursor.execute(
        "INSERT INTO support_messages VALUES (?, ?, ?, ?, ?, ?)",
        (msg_id, msg.user_id, msg.user_name, msg.issue_type, msg.message, datetime.now())
    )
    conn.commit()
    return {"message": "Support ticket received!"}

# 2. الأدمن يقرأ الرسائل
@app.get("/api/admin/support_messages")
def get_support_messages():
    cursor.execute("SELECT * FROM support_messages ORDER BY created_at DESC")
    rows = cursor.fetchall()
    return [{
        "id": r[0], "userId": r[1], "userName": r[2], 
        "issueType": r[3], "message": r[4], "date": r[5]
    } for r in rows]
import base64

import base64  # تأكد من وجود هذا السطر

@app.post("/api/payments/upload")
def upload_payment(data: PaymentUpload):
    try:
        print("====== 🚀 NEW PAYMENT UPLOAD ======")
        print(f"User ID: {data.user_id}")
        
        # 1. التأكد من مجلد uploads
        if not os.path.exists("uploads"):
            os.makedirs("uploads")
            
        # 2. فصل الصورة عن النص
        header, encoded = data.image_url.split(",", 1)
        file_ext = header.split(";")[0].split("/")[1] # استخراج صيغة الصورة (png/jpg)
        
        # 3. حفظ الصورة كملف حقيقي
        file_name = f"pay_{uuid.uuid4().hex[:8]}.{file_ext}"
        file_path = os.path.join("uploads", file_name)
        
        with open(file_path, "wb") as f:
            f.write(base64.b64decode(encoded))
            
        print(f"✅ Image saved to: {file_path}")
            
        # 4. الرابط الذي سيتم إرساله للوحة الإدارة
        final_url = f"http://2.24.14.60:8000/uploads/{file_name}"
        
        # 5. الحفظ في قاعدة البيانات
        payment_id = "PAY-" + str(uuid.uuid4())[:8]
        cursor.execute(
            "INSERT INTO payments (id, user_id, image_url, status, created_at) VALUES (?, ?, ?, ?, ?)",
            (payment_id, data.user_id, final_url, "pending", datetime.now())
        )
        conn.commit()
        
        print("✅ Payment saved to Database successfully!")
        print("===================================")
        
        return {"message": "Payment proof uploaded successfully!"}
        
    except Exception as e:
        # 🚨 إذا حدث خطأ، سيطبعه لك السيرفر هنا باللون الأحمر!
        print("❌ CRASH ERROR IN PAYMENT:", e)
        raise HTTPException(status_code=500, detail=f"Error saving image: {str(e)}")
# 2. مسار جلب المدفوعات للوحة الإدارة (المطور)
@app.get("/api/admin/payments")
def get_admin_payments():
    # نستخدم LEFT JOIN بدلاً من JOIN العادية
    # هذا يعني: اجلب الدفعة حتى لو لم نجد اسم المستخدم في الجدول
    cursor.execute("""
        SELECT p.id, p.user_id, u.name, u.email, p.image_url, p.status, p.created_at
        FROM payments p
        LEFT JOIN users u ON p.user_id = u.id 
        ORDER BY p.created_at DESC
    """)
    rows = cursor.fetchall()
    
    # طباعة عدد الدفعات في الشاشة السوداء للتأكد
    print(f"📊 Admin requested payments. Found: {len(rows)}")

    return [{
        "id": r[0], 
        "user_id": r[1], 
        "user_name": r[2] if r[2] else "Unknown User (Deleted?)", # إذا لم يوجد اسم
        "user_email": r[3] if r[3] else "No Email",
        "image_url": r[4], 
        "status": r[5], 
        "date": r[6]
    } for r in rows]
# 3. المدير يوافق على الدفع (ويضيف 30 يوماً تلقائياً!)
@app.post("/api/admin/payments/{pay_id}/approve")
def approve_payment(pay_id: str):
    # 1. نجلب تفاصيل الطلب
    cursor.execute("SELECT user_id FROM payment_requests WHERE id=?", (pay_id,))
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Payment not found")
    user_id = row[0]

    # 2. نضيف 30 يوماً للمستخدم
    cursor.execute("SELECT subscription_ends FROM users WHERE id=?", (user_id,))
    user_data = cursor.fetchone()
    current_expiry = datetime.strptime(user_data[0], '%Y-%m-%d %H:%M:%S.%f') if user_data[0] else datetime.now()
    start_date = datetime.now() if current_expiry < datetime.now() else current_expiry
    new_expiry = start_date + timedelta(days=30)
    
    cursor.execute("UPDATE users SET subscription_ends=? WHERE id=?", (new_expiry, user_id))
    
    # 3. نحدث حالة الطلب إلى "مقبول"
    cursor.execute("UPDATE payment_requests SET status='approved' WHERE id=?", (pay_id,))
    conn.commit()
    
    return {"message": "Payment Approved & 30 Days Added!", "new_expiry": new_expiry}
    # ==========================================
# 💰 جدول المدفوعات (Payments)
# ==========================================
cursor.execute("""
    CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        image_url TEXT,
        status TEXT,
        created_at TIMESTAMP
    )
""")
conn.commit()

class PaymentUpload(BaseModel):
    user_id: str
    image_url: str

# 1. مسار رفع إيصال الدفع (من العميل)
@app.post("/api/payments/upload")
def upload_payment(data: PaymentUpload):
    payment_id = "PAY-" + str(uuid.uuid4())[:8]
    cursor.execute(
        "INSERT INTO payments VALUES (?, ?, ?, ?, ?)",
        (payment_id, data.user_id, data.image_url, "pending", datetime.now())
    )
    conn.commit()
    return {"message": "Payment proof uploaded successfully!"}

# 2. مسار جلب المدفوعات للوحة الإدارة (الأدمن)
@app.get("/api/admin/payments")
def get_admin_payments():
    # نربط جدول المدفوعات بجدول المستخدمين لنجلب اسم العميل
    cursor.execute("""
        SELECT p.id, p.user_id, u.name, u.email, p.image_url, p.status, p.created_at
        FROM payments p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
    """)
    rows = cursor.fetchall()
    return [{
        "id": r[0], "user_id": r[1], "user_name": r[2], "user_email": r[3],
        "image_url": r[4], "status": r[5], "date": r[6]
    } for r in rows]

# 3. مسار تفعيل الحساب (الزر السحري للأدمن)
@app.post("/api/admin/payments/approve/{payment_id}")
def approve_payment(payment_id: str):
    # البحث عن الدفعة لمعرفة صاحبها
    cursor.execute("SELECT user_id FROM payments WHERE id=?", (payment_id,))
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    user_id = row[0]
    
    # 1. تغيير حالة الدفعة إلى "مقبولة"
    cursor.execute("UPDATE payments SET status='approved' WHERE id=?", (payment_id,))
    
    # 2. إضافة 30 يوماً لاشتراك العميل!
    new_expiry_date = datetime.now() + timedelta(days=30)
    cursor.execute("UPDATE users SET subscription_ends=? WHERE id=?", (new_expiry_date, user_id))
    
    conn.commit()
    return {"message": "Account activated for 30 days!"}
    # 🛑 زر الإيقاف الفوري (Revoke Access)
@app.post("/api/admin/users/{user_id}/revoke")
def revoke_user_access(user_id: str):
    # نجعل تاريخ الانتهاء هو "البارحة" ليصبح منتهي الصلاحية فوراً
    past_date = datetime.now() - timedelta(days=1)
    cursor.execute("UPDATE users SET subscription_ends=? WHERE id=?", (past_date, user_id))
    conn.commit()
    return {"message": "User access revoked immediately!"}
    from fastapi.staticfiles import StaticFiles # 👈 أضف هذا
import os

# إنشاء مجلد للصور إذا لم يكن موجوداً
if not os.path.exists("uploads"):
    os.makedirs("uploads")

# ربط المجلد لكي نستطيع فتح الصور من المتصفح
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
# ⚙️ جدول الإعدادات (لتغيير السعر وطرق الدفع)
cursor.execute("""
    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
    )
""")
# قيم افتراضية
cursor.execute("INSERT OR IGNORE INTO settings VALUES ('price', '29.99')")
cursor.execute("INSERT OR IGNORE INTO settings VALUES ('bank_info', 'CIH: 1234-5678-9012')")
cursor.execute("INSERT OR IGNORE INTO settings VALUES ('crypto_info', 'USDT (TRC20): TKhJqYx...9xY')")
conn.commit()

# مسار جلب الإعدادات
@app.get("/api/settings")
def get_settings():
    cursor.execute("SELECT key, value FROM settings")
    return {row[0]: row[1] for row in cursor.fetchall()}

# مسار تحديث الإعدادات (للأدمن)
class SettingsUpdate(BaseModel):
    price: str
    bank_info: str
    crypto_info: str

@app.post("/api/admin/settings")
def update_settings(data: SettingsUpdate):
    cursor.execute("UPDATE settings SET value=? WHERE key='price'", (data.price,))
    cursor.execute("UPDATE settings SET value=? WHERE key='bank_info'", (data.bank_info,))
    cursor.execute("UPDATE settings SET value=? WHERE key='crypto_info'", (data.crypto_info,))
    conn.commit()
    return {"message": "Settings updated!"}

    # ==========================================
# 🛡️ جدول مكافحة الاحتيال (قفل رقم الواتساب)
# ==========================================
cursor.execute("""
    CREATE TABLE IF NOT EXISTS used_whatsapp_numbers (
        phone_number TEXT PRIMARY KEY,
        first_user_id TEXT,
        created_at TIMESTAMP
    )
""")
conn.commit()

class FraudCheck(BaseModel):
    user_id: str
    phone_number: str

@app.post("/api/check-whatsapp-fraud")
def check_fraud(data: FraudCheck):
    # 1. هل هذا العميل دفع الفلوس؟ (نبحث عن دفعة مقبولة له)
    cursor.execute("SELECT status FROM payments WHERE user_id=? AND status='approved'", (data.user_id,))
    is_paid = cursor.fetchone()

    # 2. هل الرقم مستخدم من قبل؟
    cursor.execute("SELECT first_user_id FROM used_whatsapp_numbers WHERE phone_number=?", (data.phone_number,))
    row = cursor.fetchone()

    if row:
        if row[0] != data.user_id: # الرقم مستخدم في حساب آخر!
            if is_paid:
                # 🟢 العميل محتال سابقاً لكنه "دفع الفلوس الآن"! 
                # نسامحه وننقل ملكية الرقم لحسابه الجديد (المدفوع)
                cursor.execute("UPDATE used_whatsapp_numbers SET first_user_id=? WHERE phone_number=?", (data.user_id, data.phone_number))
                conn.commit()
                print(f"💰 VIP PASS: User {data.user_id} paid. Ownership of {data.phone_number} transferred to him!")
                return {"status": "ok", "message": "Paid customer. Ownership transferred."}
            else:
                # 🚨 العميل محتال ولم يدفع! (عاقبه)
                past_date = datetime.now() - timedelta(days=1)
                cursor.execute("UPDATE users SET subscription_ends=? WHERE id=?", (past_date, data.user_id))
                conn.commit()
                print(f"🚨 FRAUD DETECTED: User {data.user_id} tried to reuse WhatsApp {data.phone_number}")
                return {"status": "fraud", "message": "This WhatsApp number has already used a free trial."}
        else:
            # نفس العميل القديم يعيد الاتصال بحسابه
            return {"status": "ok", "message": "Same user, all good."}
    else:
        # ✅ رقم جديد تماماً (بريء)
        cursor.execute("INSERT INTO used_whatsapp_numbers VALUES (?, ?, ?)", (data.phone_number, data.user_id, datetime.now()))
        conn.commit()
        return {"status": "new", "message": "Number registered securely."}
        # 🛑 مسار فحص حالة الاشتراك الحقيقية (لإيقاف البوت أوتوماتيكياً)
@app.get("/api/subscription-status/{user_id}")
def check_subscription(user_id: str):
    # 1. هل العميل قام بالدفع وأنت وافقت على الدفعة؟ (البوس)
    cursor.execute("SELECT status FROM payments WHERE user_id=? AND status='approved'", (user_id,))
    if cursor.fetchone():
        return {"active": True, "reason": "paid"}

    # 2. إذا لم يدفع، هل لا تزال فترته التجريبية (3 أيام) سارية؟
    cursor.execute("SELECT subscription_ends FROM users WHERE id=?", (user_id,))
    row = cursor.fetchone()
    if row and row[0]:
        # مقارنة تاريخ اليوم مع تاريخ انتهاء الاشتراك
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        sub_ends_str = str(row[0])
        
        if sub_ends_str > current_time:
            return {"active": True, "reason": "trial"}

    # 🚨 لم يدفع + انتهت التجربة = إيقاف البوت!
    return {"active": False, "reason": "expired"}
    # 🗑️ مسار حذف طلب (Order) من قاعدة البيانات
@app.delete("/api/orders/{order_id}")
def delete_order(order_id: str):
    cursor.execute("DELETE FROM orders WHERE id = ?", (order_id,))
    conn.commit()
    return {"message": "Order deleted successfully"}