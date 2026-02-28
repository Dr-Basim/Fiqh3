export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { action, scenario, answer } = req.body;
    const apiKey = process.env.GOOGLE_API_KEY; 

    // صياغة الطلب بشكل مبسط لضمان التوافق
    let promptText = "";
    if (action === 'generate') {
        promptText = "بصفتك أستاذ فقه متخصص، قم بتأليف نازلة فقهية معاصرة قصيرة جداً عن الخلع أو الطلاق تنتهي بسؤال مباشر للطالب عن الحكم. لا تكتب الحل.";
    } else {
        promptText = `بصفتك مصححاً فقهياً، قيم هذه الإجابة بـ (صحيحة أو خاطئة) مع ذكر التعليل باختصار: النازلة هي (${scenario})، وإجابة الطالب هي (${answer}).`;
    }

    try {
        // استخدمنا هنا gemini-pro وهو الموديل الأكثر استقراراً
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

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

        if (data.error) {
            console.error("Google Error:", data.error);
            throw new Error(data.error.message);
        }

        const result = data.candidates[0].content.parts[0].text;
        res.status(200).json({ result });

    } catch (error) {
        console.error("API Failure:", error.message);
        res.status(500).json({ error: error.message });
    }
}
