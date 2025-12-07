// src/index.ts
import { Hono } from 'hono'
import { z } from 'zod'

const app = new Hono()

app.use('*', async (c, next) => {
  const origin = "http://localhost:3000"
  c.header('Access-Control-Allow-Origin', origin)
  c.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  c.header('Access-Control-Allow-Headers', 'Content-Type')
  if (c.req.method === 'OPTIONS') {
     return c.json("ok")
  }
  await next()
})

// Mock data
const QUESTIONS = [
  { id: 1, type: 'radio', question: 'What is 2 + 2?', choices: ['2', '3', '4', '5'], correctIndex: 2 },
  { id: 2, type: 'checkbox', question: 'Select prime numbers', choices: ['2', '3', '4', '5'], correctIndexes: [0, 1, 3] },
  { id: 3, type: 'text', question: 'Name the chemical symbol for water', correctText: 'H2O' },
  { id: 4, type: 'radio', question: 'Which is a frontend framework?', choices: ['Express', 'React', 'Flask', 'Django'], correctIndex: 1 },
  { id: 5, type: 'checkbox', question: 'Select JavaScript data types', choices: ['String', 'Number', 'Boolean', 'Integer'], correctIndexes: [0, 1, 2] },
  { id: 6, type: 'text', question: 'What planet is known as the Red Planet?', correctText: 'Mars' },
  { id: 7, type: 'radio', question: 'HTTP status code for success?', choices: ['200', '400', '404', '500'], correctIndex: 0 },
  { id: 8, type: 'text', question: 'Who wrote "The Odyssey"?', correctText: 'Homer' },
  { id: 9, type: 'radio', question: 'What language does the browser run?', choices: ['Python', 'C++', 'JavaScript', 'Java'], correctIndex: 2 },
  { id: 10, type: 'checkbox', question: 'Which are frontend technologies?', choices: ['HTML', 'CSS', 'Node.js', 'React'], correctIndexes: [0, 1, 3] },
  { id: 11, type: 'text', question: 'What does HTML stand for?', correctText: 'HyperText Markup Language' },
  { id: 12, type: 'text', question: 'What does API stand for?', correctText: 'Application Programming Interface' },
  { id: 13, type: 'radio', question: 'Which one is NOT a programming language?', choices: ['Java', 'Python', 'HTML', 'C#'], correctIndex: 2 },
  { id: 14, type: 'radio', question: 'Which is a version control system?', choices: ['Git', 'Node', 'React', 'Laravel'], correctIndex: 0 },
  { id: 15, type: 'checkbox', question: 'Select fruits', choices: ['Apple', 'Carrot', 'Banana', 'Potato'], correctIndexes: [0, 2] },
  { id: 16, type: 'text', question: 'What is the largest ocean on Earth?', correctText: 'Pacific Ocean' },
  { id: 17, type: 'radio', question: 'Which company created JavaScript?', choices: ['Microsoft', 'Netscape', 'Google', 'Apple'], correctIndex: 1 },
  { id: 18, type: 'checkbox', question: 'Select odd numbers', choices: ['1', '2', '3', '4', '5'], correctIndexes: [0, 2, 4] },
  { id: 19, type: 'text', question: 'What gas do plants breathe in?', correctText: 'Carbon Dioxide' },
  { id: 20, type: 'radio', question: 'React is a ___?', choices: ['Library', 'Language', 'Database', 'Compiler'], correctIndex: 0 }
]


//  shuffle Questions
function shuffleArray<T>(arr: T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = copy[i];
      copy[i] = copy[j]!;
      copy[j] = tmp!;
    }
    return copy;
}

// Validation schemas
const AnswerSchema  = z.object({
  id: z.union([z.string(), z.number()]),
  value: z.union([z.string(), z.number(), z.array(z.number())])
})

const GradeRequestSchema  = z.object({
  answers: z.array(AnswerSchema)
})

// api get random questions
app.get('/api/quiz', (ctx) => {
  try {
    const shuffled = shuffleArray(QUESTIONS)

    const count = 8 + Math.floor(Math.random() * 5) // 8–12
    const selected = shuffled.slice(0, count)

    return ctx.json(selected)
  } catch (err) {
    return ctx.json({ error: 'Failed to load quiz' }, 500)
  }
})

app.post('/api/grade', async (ctx) => {
  try {
    const body = await ctx.req.json()
    const parsed = GradeRequestSchema.safeParse(body)
    if (!parsed.success) {
      return ctx.json({ error: 'Invalid payload' }, 400)
    }
    const { answers } = parsed.data

    // grading
    const results: { id: string|number, correct: boolean }[] = []
    let score = 0
    let total = QUESTIONS.length

    for (const question of QUESTIONS) {
      const ans = answers.find(ans => String(ans.id) === String(question.id))
      let correct = false

      if (question.type === 'text') {
        const submitted = ans?.value
        if (typeof submitted === 'string' && typeof question.correctText === 'string') {
          // simple normalization
          correct = submitted.trim().toLowerCase() === question.correctText.trim().toLowerCase()
        }
      } else if (question.type === 'radio') {
        if ((typeof ans?.value === 'number' || typeof ans?.value === 'string') && typeof question.correctIndex === 'number') {
          correct = Number(ans.value) === question.correctIndex
        }
      } else if (question.type === 'checkbox') {
        if (Array.isArray(ans?.value) && Array.isArray(question.correctIndexes)) {
          const submittedArr = (ans.value as number[]).map(n => Number(n)).sort((a,b)=>a-b)
          const correctArr = question.correctIndexes.map(n => Number(n)).sort((a,b)=>a-b)
          if (submittedArr.length === correctArr.length && submittedArr.every((v,i)=>v===correctArr[i])) correct = true
        }
      }

      if (correct) score++
      results.push({ id: question.id, correct })
    }

    return ctx.json({ score, total, results })
  } catch (err) {
    return ctx.json({ error: 'Server error' }, 500)
  }
})

export default app
