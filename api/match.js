import { readFileSync } from "fs"
import path from "path"
import { parse } from "csv-parse/sync"

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") return res.status(200).end()
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

  try {
    const { jobMatches } = req.body // this is GPT's response

    if (!Array.isArray(jobMatches)) {
      return res.status(400).json({ error: "Missing or invalid jobMatches in body" })
    }

    // Load and parse the CSV
    const filePath = path.join(process.cwd(), "data", "Exploded_Job-Course_Mapping.csv")
    const fileContent = readFileSync(filePath)
    const records = parse(fileContent, { columns: true, skip_empty_lines: true })

    // Match each job to course info
    const results = jobMatches.map(job => {
      const course = records.find(row =>
        row["Job Title"].toLowerCase().trim() === job.jobTitle.toLowerCase().trim()
      )
      return {
        jobTitle: job.jobTitle,
        matchScore: job.match_score,
        whyFit: job.why_fit,
        whatYouDo: job.what_you_do,
        labels: job.labels,
        courseName: course?.Program || "",
        college: course?.College || "",
        duration: course?.Duration || "",
        link: course?.Link || "",
        description: course?.Description || ""
      }
    })

    return res.status(200).json({ results })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Server error", details: err.message })
  }
}
