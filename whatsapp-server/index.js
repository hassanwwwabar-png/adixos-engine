require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js'); 
const { GoogleGenerativeAI } = require("@google/generative-ai");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const app = express();
app.use(cors());
app.use(express.json());

const userSessions = {}; 
const activeClients = {}; 
// 🧠 أضفنا دفتر الذاكرة هنا: سيحفظ محادثة كل زبون برقم هاتفه
const customerMemories = {}; 

app.get('/api/whatsapp/status/:userId', (req, res) => {
    const client = activeClients[req.params.userId];
    if (client && client.info) res.json({ connected: true, number: client.info.wid.user });
    else if (client) res.json({ connected: true, number: "Connecting..." });
    else res.json({ connected: false, number: null });
});

app.post('/api/whatsapp/disconnect', async (req, res) => {
    const { userId } = req.body;
    if (activeClients[userId]) {
        await activeClients[userId].logout();
        delete activeClients[userId];
    }
    res.json({ success: true });
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

io.on('connection', (socket) => {
    socket.on('start_session', async (data) => {
        const userId = data.userId;
        const userProducts = data.products || [];

        let dynamicCatalog = "";
        if (userProducts.length === 0) {
            dynamicCatalog = "لا توجد منتجات.";
        } else {
            userProducts.forEach((p, index) => {
                dynamicCatalog += `${index + 1}. ${p.name}\n   - السعر: ${p.price}\n   - التفاصيل: ${p.details}\n`;
                if(p.image) dynamicCatalog += `   - كود الصورة: ID_${index}\n`; 
                dynamicCatalog += "\n";
            });
        }

        const DYNAMIC_STORE_CONTEXT = `
أنت بائع مغربي محترف وودود تتحدث بالدارجة المغربية.
كتالوج المنتجات الخاص بك:
${dynamicCatalog}

تعليمات هامة:
1. ردودك يجب أن تكون قصيرة، طبيعية، وتكمل سياق المحادثة (لا تكرر الترحيب إذا رحبت به سابقاً).
2. إذا أرسل العميل صورة، تعرف عليها. وإذا أرسل صوتاً، أجب على ما فيه.
3. 📸 لإرسال صورة منتج، اكتب: [SEND_IMAGE]ID_رقم[/SEND_IMAGE] (مثال: [SEND_IMAGE]ID_0[/SEND_IMAGE]).
4. 💰 لتأكيد الطلب، استخدم: [ORDER_JSON]{"customer_name": "اسم", "customer_address": "عنوان", "product_name": "منتج", "total_price": 0}[/ORDER_JSON]
5. 🚨 للأسئلة الصعبة، استخدم: [ESCALATE]
        `;

        userSessions[userId] = { context: DYNAMIC_STORE_CONTEXT, step: 'start' };

        if (activeClients[userId]) {
            socket.emit('connected', 'WhatsApp Already Linked!');
            return;
        }

        const client = new Client({
    authStrategy: new LocalAuth({ clientId: userId }),
    puppeteer: { 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

        activeClients[userId] = client;

        client.on('qr', (qr) => socket.emit('qr_code', qr));

        client.on('ready', async () => {
            const phoneNumber = client.info.wid.user; 
            console.log(`✅ WhatsApp Ready! Number: ${phoneNumber}`);
            
            try {
                // 1. فحص الاحتيال (نفس الكود القديم)
                const response = await fetch("http://2.24.14.60:8000/api/check-whatsapp-fraud", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user_id: userId, phone_number: phoneNumber })
                });
                const data = await response.json();

                if (data.status === "fraud") {
                    socket.emit('connected', '⚠️ Trial Expired! Number already used.');
                    await client.logout();
                    delete activeClients[userId];
                    return; 
                }

                // 🛑 2. الفحص الجديد: فحص الاشتراك المالي!
                const subRes = await fetch(`http://2.24.14.60:8000/api/subscription-status/${userId}`);
                const subData = await subRes.json();
                
                if (!subData.active) {
                    console.log(`🚨 KICKED OUT: User ${userId} subscription expired!`);
                    socket.emit('connected', '💳 Subscription Expired! Please pay to activate bot.');
                    await client.logout(); // طرد فوري من الواتساب
                    delete activeClients[userId];
                    return;
                }

            } catch (err) {}
            
            socket.emit('connected', 'Bot Connected & Secured! 🚀');
        });

        // ==========================================
        // 🧠 عقل البوت (مع الذاكرة الحديدية)
        // ==========================================
        client.on('message', async (msg) => {
            if (msg.from === 'status@broadcast' || msg.isGroupMsg) return;

            // 🛑 جدار الأمان: هل الاشتراك لا يزال فعالاً قبل أن نرد على الزبون؟
            try {
                const subRes = await fetch(`http://2.24.14.60:8000/api/subscription-status/${userId}`);
                const subData = await subRes.json();
                
                if (!subData.active) {
                    console.log(`⏳ Ignored message for ${userId} - Subscription Expired/Not Paid.`);
                    return; // 👈 البوت سيتجاهل الرسالة ويصمت تماماً!
                }
            } catch (err) {}
            const sender = msg.from;
            const currentContext = userSessions[userId]?.context || DYNAMIC_STORE_CONTEXT;

            // 🧠 1. إنشاء ذاكرة للزبون إذا لم تكن موجودة
            if (!customerMemories[sender]) {
                customerMemories[sender] = [];
            }

            const chat = await msg.getChat();
            await chat.sendStateTyping();

            try {
                let promptParts = [];

                // 🧠 2. تسجيل ما قاله العميل الآن في الذاكرة
                const userText = msg.body ? `الزبون: "${msg.body}"` : `الزبون: [أرسل صورة أو مقطع صوتي]`;
                customerMemories[sender].push(userText);

                // 🧠 3. الحفاظ على آخر 8 رسائل فقط (لكي لا يمتلئ عقل البوت ويصبح بطيئاً)
                if (customerMemories[sender].length > 8) {
                    customerMemories[sender].shift();
                }

                // دمج المحادثة كـ "تاريخ" يقترح عليه سياق الحديث
                const historyText = customerMemories[sender].join('\n');

                if (msg.hasMedia) {
                    const media = await msg.downloadMedia();
                    if (media) {
                        const cleanMimeType = media.mimetype.split(';')[0]; 
                        console.log(`📥 Processing Media: ${cleanMimeType}`);
                        
                        promptParts.push({
                            inlineData: {
                                data: media.data,
                                mimeType: cleanMimeType
                            }
                        });
                        
                        promptParts.push(`\n${currentContext}\n\n--- سجل المحادثة السابق ---\n${historyText}\n------------------------\n\nالعميل أرسل الوسائط المرفقة للتو. بناءً على السجل أعلاه، أجب عليه برد طبيعي ومختصر بالدارجة المغربية:`);
                    }
                } else {
                    promptParts = [`${currentContext}\n\n--- سجل المحادثة السابق ---\n${historyText}\n------------------------\n\nبناءً على هذا السجل، اكتب ردك التالي كبائع (بدون أن تكتب كلمة "البائع:" في البداية):`];
                }

                const result = await model.generateContent(promptParts);
                let response = result.response.text();

                // 🚨 فحص الاستغاثة والطلبات
                if (response.includes('[ESCALATE]')) {
                    try {
                        await fetch("http://2.24.14.60:8000/api/escalations", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ phone_id: "bot", customer_phone: sender.split('@')[0], question: msg.body })
                        });
                        response = response.replace('[ESCALATE]', '').trim();
                    } catch (err) {}
                }

                const orderMatch = response.match(/\[ORDER_JSON\]([\s\S]*?)\[\/ORDER_JSON\]/);
                if (orderMatch) {
                    try {
                        const orderData = JSON.parse(orderMatch[1]);
                        await fetch("http://2.24.14.60:8000/api/orders", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ ...orderData, phone_id: "bot", customer_phone: sender.split('@')[0], platform: "whatsapp" })
                        });
                        response = response.replace(/\[ORDER_JSON\][\s\S]*?\[\/ORDER_JSON\]/, '').trim();
                    } catch (err) {}
                }

                // 📸 فحص إرسال الصورة
                const imageMatch = response.match(/\[SEND_IMAGE\](ID_\d+)\[\/SEND_IMAGE\]/);
                if (imageMatch) {
                    const imageId = imageMatch[1]; 
                    const pIndex = parseInt(imageId.replace('ID_', ''));
                    const product = userProducts[pIndex];

                    if (product && product.image) {
                        try {
                            const matches = product.image.match(/^data:(image\/[A-Za-z-+\/]+);base64,(.+)$/);
                            if (matches && matches.length === 3) {
                                const mediaFile = new MessageMedia(matches[1], matches[2]);
                                await client.sendMessage(sender, mediaFile); 
                            }
                        } catch (err) {
                            console.error("❌ Failed to send image media:", err);
                        }
                    }
                    response = response.replace(/\[SEND_IMAGE\](.*?)\[\/SEND_IMAGE\]/g, '').trim();
                }

                // ✉️ إرسال النص
                if (response.trim().length > 0) {
                    await client.sendMessage(sender, response);
                    
                    // 🧠 4. حفظ رد البوت في الذاكرة ليتذكره في المرة القادمة
                    customerMemories[sender].push(`البائع: "${response}"`);
                }

            } catch (error) {
                console.error("❌ Gemini Error:", error);
            }
        });

        client.initialize();
    });
});

server.listen(3001, () => {
    console.log('🔥 Omni-Channel AI WhatsApp Engine running on port 3001');
});