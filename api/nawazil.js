export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { action, scenario, answer } = req.body;
    const apiKey = process.env.GOOGLE_API_KEY; 

    let prompt = action === 'generate' 
        ? "أنت أستاذ فقه، ألف نازلة فقهية معاصرة قصيرة عن (الخلع أو الطلاق) تنتهي بسؤال." 
        : `قيم إجابة الطالب علمياً: النازلة: ${scenario}، الإجابة: ${answer}`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await response.json();
        res.status(200).json({ result: data.candidates[0].content.parts[0].text });
    } catch (e) { res.status(500).json({ error: 'Error' }); }
}
