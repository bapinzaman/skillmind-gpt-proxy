export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")

  if (req.method === "OPTIONS") {
    return res.status(200).end()
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" })
  }

  const { messages } = req.body
  console.log("📨 Received messages:", messages)

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer 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`, // Replace this!
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // Try "gpt-3.5-turbo" if you want to save cost
        messages,
      }),
    })

    const data = await response.json()
    console.log("✅ OpenAI response:", data)

    res.status(200).json(data)
  } catch (err) {
    console.error("❌ OpenAI error:", err)
    res.status(500).json({ error: "OpenAI request failed", details: err.message })
  }
}
