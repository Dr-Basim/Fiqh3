export default async function handler(req, res) {
    // 1. السماح بمرور الطلب بأمان
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        // 2. معالجة البيانات القادمة من الموقع بطريقة آمنة جداً
        let body = req.body || {};
        if (typeof body === 'string') {
            try { body = JSON.parse(body); } catch(e) { body = {}; }
        }
        
        const action = body.action || 'generate';
        const scenario = body.scenario || '';
        const answer = body.answer || '';

        // 3. سحب المفتاح وتنظيفه من أي مسافات مخفية
        const apiKey = (process.env.GOOGLE_API_KEY || "").trim(); 
        if (!apiKey) throw new Error('مفتاح جوجل غير موجود في Vercel.');

        // 4. صياغة الطلب
        let promptText = action === 'generate' 
            ? "أنت أستاذ جامعي في الفقه. اكتب قصة قصيرة جدا كمسألة فقهية عن الخلع أو الطلاق، واختمها بسؤال. لا تذكر الحل." 
            : "قيم الإجابة: النازلة: " + scenario + " الإجابة: " + answer;

        const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
        });

        const data = await response.json();

        // 5. التحقق من أخطاء الاتصال
        if (!response.ok) {
            throw new Error(data.error?.message || "خطأ في الاتصال بخوادم جوجل.");
        }

        // 6. التحقق من فلاتر الأمان (السبب الخفي للمشكلة السابقة)
        const candidate = data.candidates && data.candidates[0];
        if (!candidate || !candidate.content) {
            throw new Error("قامت خوادم جوجل بحجب الرد بسبب (فلاتر الأمان) لوجود كلمات حساسة. اضغط على الزر مرة أخرى.");
        }

        // 7. إرسال النتيجة السليمة
        res.status(200).json({ result: candidate.content.parts[0].text });

    } catch (error) {
        // إظهار الخطأ الدقيق بدلاً من انهيار الموقع
        res.status(500).json({ error: error.message });
    }
}
