export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { action, scenario, answer } = req.body;
    const apiKey = process.env.GOOGLE_API_KEY; 

    // إعداد الأوامر للمساعد
    let promptText = "";
    if (action === 'generate') {
        promptText = "أنت أستاذ فقه ميسر. قم بتأليف نازلة فقهية معاصرة قصيرة جداً عن (الخلع أو الطلاق) تنتهي بسؤال مباشر للطالب عن الحكم. لا تكتب الحل.";
    } else {
        promptText = `أنت مصحح فقهي. النازلة: ${scenario}. إجابة الطالب: ${answer}. قيم الإجابة بـ (صحيحة/خاطئة) مع تعليل فقهي مختصر جداً.`;
    }

    try {
        // الرابط المحدث للإصدار المستقر v1
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: promptText }]
                }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Google API Error Details:", data);
            throw new Error(data.error?.message || 'خطأ في الاتصال بجوجل');
        }

        const result = data.candidates[0].content.parts[0].text;
        res.status(200).json({ result });

    } catch (error) {
        console.error("Full Error:", error);
        res.status(500).json({ error: error.message });
    }
}
