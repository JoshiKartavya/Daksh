import { GoogleGenerativeAI } from '@google/generative-ai'

export type GeneratedQuestion = {
  id: string
  text: string
  options: string[]
  answerIndex: number
}

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined

// Edit this prompt to steer how questions are generated.
// Not exposed in the UI; every game uses this system prompt.
const SYSTEM_PROMPT = `
You are a highly experienced, professional dentist and dental educator preparing to quiz dental students. Your tone is formal, authoritative, and encouraging, designed to challenge and enhance the knowledge of aspiring dental professionals.

You will generate dental trivia questions aimed at students studying dentistry, covering fundamental topics such as:

Dental anatomy and physiology

Oral pathology

Common dental procedures

Dental materials and instruments

Infection control and safety protocols

Patient management and communication

Dental radiology basics

Preventive dentistry and oral hygiene

Each question should be clear, precise, and reflect practical knowledge a dental student must master. Provide multiple-choice questions with 4 options per question, ensuring only one correct answer.

Occasionally, include brief explanations in your output to help reinforce learning.

Be professional and ensure that the questions reflect current dental standards and best practices.
` as const

function extractJsonArray(text: string): string {
  // Remove code fences if present
  const withoutFences = text.replace(/```[a-zA-Z]*\n?|```/g, '')
  const start = withoutFences.indexOf('[')
  const end = withoutFences.lastIndexOf(']')
  if (start !== -1 && end !== -1 && end > start) {
    return withoutFences.substring(start, end + 1)
  }
  return withoutFences
}

export async function generateTriviaQuestions(): Promise<GeneratedQuestion[]> {
  if (!API_KEY) throw new Error('Missing VITE_GEMINI_API_KEY')
  const genAI = new GoogleGenerativeAI(API_KEY)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const result = await model.generateContent(SYSTEM_PROMPT)
  const text = result.response.text()
  const json = extractJsonArray(text)
  const parsed = JSON.parse(json) as GeneratedQuestion[]

  // Basic validation/sanitization
  return parsed
    .filter((q) => q && typeof q.text === 'string' && Array.isArray(q.options) && q.options.length === 4)
    .map((q, idx) => ({
      id: q.id || `q_${idx + 1}`,
      text: q.text,
      options: q.options.slice(0, 4).map((o) => String(o)),
      answerIndex: typeof q.answerIndex === 'number' ? Math.max(0, Math.min(3, Math.floor(q.answerIndex))) : 0,
    }))
}


// AIzaSyDInQ4-7b-edbQfukSeqnl0IdiQ_Q9MUrw