export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { action, scenario, answer } = req.body;
    const apiKey = process.env.GOOGLE_API_KEY; // سنضيف هذا المفتاح في Vercel

    let systemPrompt = "";
    let userPrompt = "";

    if (action === 'generate') {
        systemPrompt = "أنت أستاذ جامعي متخصص في الفقه الإسلامي (الفقه الميسر).";
        userPrompt = `قم بتأليف "نازلة فقهية" (قصة واقعية قصيرة جداً ومعاصرة) تتعلق بـ (الخلع، أو الطلاق بأنواعه، أو الرجعة). 
        يجب أن تنتهي القصة بسؤال مباشر للطالب عن الحكم الفقهي لهذه الحالة.
        لا تكتب الإجابة، فقط اكتب القصة والسؤال.`;
    } 
    else if (action === 'evaluate') {
        systemPrompt = "أنت أستاذ جامعي متخصص في الفقه الإسلامي (الفقه الميسر). مهمتك تصحيح إجابة الطالب وتقييمها بأسلوب مشجع وعلمي.";
        userPrompt = `النازلة الفقهية كانت: "${scenario}"
        إجابة الطالب هي: "${answer}"
        
        قم بتقييم إجابة الطالب. 
        1. ابدأ بكلمة (إجابة صحيحة / إجابة خاطئة / إجابة ناقصة).
        2. اشرح الحكم الفقهي الصحيح باختصار بناءً على قواعد (الخلع، الطلاق، الرجعة) في الفقه السني الميسر.`;
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents: [{ parts: [{ text: userPrompt }] }]
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error?.message || 'خطأ في الاتصال بجوجل');
        }

        const result = data.candidates[0].content.parts[0].text;
        res.status(200).json({ result });

    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
