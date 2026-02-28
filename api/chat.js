export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // أضفنا هنا "topic" لكي يعرف الذكاء الاصطناعي عن ماذا يتحدث الدرس الحالي
    const { action, scenario, answer, topic = "الفقه الإسلامي الميسر" } = req.body;

    let systemPrompt = "";
    let userPrompt = "";

    if (action === 'generate') {
        systemPrompt = `أنت أستاذ جامعي متخصص في ${topic}.`;
        userPrompt = `قم بتأليف "نازلة فقهية" (قصة واقعية قصيرة جداً ومعاصرة) تتعلق بـ (${topic}). 
        يجب أن تنتهي القصة بسؤال مباشر للطالب عن الحكم الفقهي لهذه الحالة.
        لا تكتب الإجابة، فقط اكتب القصة والسؤال.`;
    } 
    else if (action === 'evaluate') {
        systemPrompt = `أنت أستاذ جامعي متخصص في ${topic}. مهمتك تصحيح إجابة الطالب وتقييمها بأسلوب مشجع وعلمي.`;
        userPrompt = `النازلة الفقهية كانت: "${scenario}"
        إجابة الطالب هي: "${answer}"
        
        قم بتقييم إجابة الطالب. 
        1. ابدأ بكلمة (إجابة صحيحة / إجابة خاطئة / إجابة ناقصة).
        2. اشرح الحكم الفقهي الصحيح باختصار بناءً على الراجح في موضوع (${topic}).`;
    } 

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini', // تم التحديث لموديل أسرع وأذكى
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                temperature: 0.7
            })
        });

        const data = await response.json();
        const result = data.choices[0].message.content;
        res.status(200).json({ result });

    } catch (error) {
        res.status(500).json({ error: 'حدث خطأ في الاتصال بالمساعد الذكي' });
    }
}
