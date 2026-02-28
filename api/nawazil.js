export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    
    const { action, scenario, answer } = req.body;
    const apiKey = (process.env.GOOGLE_API_KEY || "").trim(); 

    let promptText = "";
    if (action === 'generate') {
        promptText = "أنت أستاذ فقه. ألف قصة قصيرة جداً عن حالة طلاق أو خلع واقعية، ثم اسأل الطالب عن الحكم الفقهي. لا تذكر الإجابة.";
    } else {
        // تم استخدام علامة الزائد لضمان عدم تعطل الكود عند النسخ
        promptText = "أنت مصحح فقهي. النازلة: " + scenario + ". إجابة الطالب: " + answer + ". قيم الإجابة بـ (صحيحة/خاطئة) مع تعليل مختصر.";
    }

    try {
        // تم استخدام علامة الزائد لدمج المفتاح بشكل آمن تماماً
        const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error?.message || 'خطأ من جوجل');

        res.status(200).json({ result: data.candidates[0].content.parts[0].text });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
