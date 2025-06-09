export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end()
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { messages } = req.body

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "Missing OpenAI API key" })
  }

  const systemPrompt = {
    role: "system",
    content: `
You are SkillMind, an AI career assistant. Your job is to guide users through a 10-question interview to understand their personality and recommend 2–3 specific job titles.

Rules:
1. Ask ONE question at a time.
2. Always format questions with exactly three choices labeled:
   A. ...
   B. ...
   C. ...
3. Start with a short welcome message.
4. Then ask: "Do you have a high school diploma or GED?"
5. Follow with 2 questions about their work style and social preference:
   - "Do you prefer solo work, teamwork, or a mix?"
   - "Do you enjoy variety, routine, or a mix of both?"

6. Then ask 6–7 OCEAN-based personality questions (Big Five traits).
7. Do NOT give personality scores or reports.
8. After 10 total questions, suggest 2–3 real-world job titles matched to their personality and background. Give a 1-line reason for each match.
9. Do NOT give job categories — only specific titles.
10. Keep the tone simple, friendly, and helpful.

Example question format:
Which setting do you prefer?
A. Working independently  
B. Collaborating with others  
C. Both, depending on the task
`
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [systemPrompt, ...messages],
      }),
    })

    const data = await response.json()

    if (!data || !data.choices || !data.choices[0]) {
      return res.status(500).json({ error: "No response from OpenAI" })
    }

    res.status(200).json({ choices: data.choices })
  } catch (error) {
    console.error("GPT error:", error)
    res.status(500).json({ error: "Error communicating with OpenAI" })
  }
}
