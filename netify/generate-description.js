export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { climate, room, style, sqft, budget } = JSON.parse(event.body);

  const prompt = `You are a professional interior designer.

Design a ${style} ${room} suitable for ${climate} climate.

Room Size: ${sqft || "standard"} sqft
Budget: ₹${budget || "medium"}

Return ONLY this format:

Color Palette
• short point
• short point

Furniture Style
• short point
• short point

Flooring & Lighting
• short point
• short point

Rules:
- Maximum 60 words
- Bullet points only
- No explanations
- Focus only on highlights`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://yoursite.netlify.app",
      "X-Title": "Archinova AI"
    },
    body: JSON.stringify({
      model: "meta-llama/llama-3-8b-instruct",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 120,
      temperature: 0.2
    })
  });

  const data = await response.json();
  const description =
    data.choices?.[0]?.message?.content?.trim()?.replace(/\n{2,}/g, "\n")
    || "AI description not available.";

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description })
  };
}
