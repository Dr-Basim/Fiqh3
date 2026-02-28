export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { action, scenario, answer } = req.body;
    const apiKey = process.env.GOOGLE_API_KEY; 

    let prompt = action === 'generate' 
        ? "قم بتأليف نازلة فقهية معاصرة قصيرة عن (الخلع أو الطلاق) تنتهي بسؤال للطالب." 
        : `قيم إجابة الطالب علمياً وبأسلوب مشجع: النازلة: ${scenario}، إجابة الطالب: ${answer}`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();
        const result = data.candidates[0].content.parts[0].text;
        res.status(200).json({ result });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
