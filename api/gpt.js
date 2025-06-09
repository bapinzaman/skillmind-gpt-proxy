export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*") // Allow all domains (or set your Framer URL only)
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end()
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" })
  }

  const { messages } = req.body

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer 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`, // Replace with your real key
      },
      body: JSON.stringify({
        model: "gpt-4", // or "gpt-3.5-turbo"
        messages,
      }),
    })

    const data = await response.json()
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ error: "OpenAI request failed", details: err.message })
  }
}
