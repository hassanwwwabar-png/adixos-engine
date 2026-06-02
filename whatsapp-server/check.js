require('dotenv').config();

async function checkModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        console.log("❌ لم يتم العثور على مفتاح API في ملف .env!");
        return;
    }

    console.log("🔍 جاري الاتصال بسيرفرات Google لجلب الموديلات المتاحة لمفتاحك...");
    
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.error) {
            console.error("❌ خطأ من Google:", data.error.message);
        } else {
            console.log("\n✅ الموديلات الجاهزة للاستخدام مع مفتاحك هي:");
            data.models.forEach(m => {
                // طباعة موديلات Gemini فقط
                if (m.name.includes("gemini")) {
                    console.log(`➡️  ${m.name.replace('models/', '')}`);
                }
            });
            console.log("\n💡 انسخ أحد هذه الأسماء وضعه في ملف index.js!");
        }
    } catch (err) {
        console.error("❌ فشل الاتصال:", err.message);
    }
}

checkModels();