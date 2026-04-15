const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  try {
    const { climate, room, style, sqft, budget } = JSON.parse(event.body);

    if (!climate || !room || !style) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing required fields" })
      };
    }

    const prompt = `You are a professional interior designer.

Design a ${style} ${room} suitable for ${climate} climate.

Room Size: ${sqft || "standard"} sqft
Budget: Rs.${budget || "medium"}

Return ONLY this format:

Color Palette
- short point
- short point

Furniture Style
- short point
- short point

Flooring & Lighting
- short point
- short point

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
        "HTTP-Referer": "https://norvex.netlify.app",
        "X-Title": "Norvex AI"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3-8b-instruct",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter error:", errText);
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: "OpenRouter request failed", detail: errText })
      };
    }

    const data = await response.json();
    const description =
      data.choices?.[0]?.message?.content?.trim()?.replace(/\n{2,}/g, "\n")
      || "AI description not available.";

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ description })
    };

  } catch (err) {
    console.error("Function error:", err.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal error", detail: err.message })
    };
  }
};

module.exports = { handler };
