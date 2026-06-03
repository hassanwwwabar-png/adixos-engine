from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# اسم ملف قاعدة البيانات الذي سيتم إنشاؤه تلقائياً
SQLALCHEMY_DATABASE_URL = "sqlite:///./adixos.db"

# إنشاء محرك الاتصال
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# إنشاء جلسة (Session) للتحدث مع قاعدة البيانات
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# الأساس الذي سنبني عليه جداولنا (Models)
Base = declarative_base()

# دالة مساعدة لفتح وإغلاق الاتصال بأمان
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()