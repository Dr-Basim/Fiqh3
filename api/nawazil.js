module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { action, scenario, answer } = req.body;

    let systemPrompt = "";
    let userPrompt = "";

    if (action === 'generate') {
        systemPrompt = `أنت أستاذ جامعي متخصص في الفقه الإسلامي (الفقه الميسر).`;
        userPrompt = `قم بتأليف "نازلة فقهية" (قصة واقعية قصيرة جداً ومعاصرة) تتعلق بـ (الخلع، أو الطلاق بأنواعه، أو الرجعة). 
        يجب أن تنتهي القصة بسؤال مباشر للطالب عن الحكم الفقهي لهذه الحالة.
        لا تكتب الإجابة، فقط اكتب القصة والسؤال.`;
    } 
    else if (action === 'evaluate') {
        systemPrompt = `أنت أستاذ جامعي متخصص في الفقه الإسلامي (الفقه الميسر). مهمتك تصحيح إجابة الطالب وتقييمها بأسلوب مشجع وعلمي.`;
        userPrompt = `النازلة الفقهية كانت: "${scenario}"
        إجابة الطالب هي: "${answer}"
        
        قم بتقييم إجابة الطالب. 
        1. ابدأ بكلمة (إجابة صحيحة / إجابة خاطئة / إجابة ناقصة).
        2. اشرح الحكم الفقهي الصحيح باختصار بناءً على قواعد (الخلع، الطلاق، الرجعة) في الفقه السني الميسر.`;
    } 
    else {
        return res.status(400).json({ error: 'Invalid action' });
    }

    try {
        // تأكد من إضافة المفتاح في Vercel
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages:[
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                temperature: 0.7,
                max_tokens: 400
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'Failed to fetch from OpenAI');
        }

        const result = data.choices[0].message.content;
        res.status(200).json({ result });

    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
