'use client'
import { useEffect, useState } from 'react'
import { IoMdCloseCircleOutline } from "react-icons/io";
import { SiQuizlet } from "react-icons/si";


type Question = {
  id: string | number
  type: 'text'|'checkbox'|'radio'
  question: string
  choices?: string[]
}

type Result = { id: string|number, correct: boolean }

export default function QuizPage() {
  const [questions, setQuestions] = useState<Question[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{score:number,total:number,results:Result[]} | null>(null)
  
  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`https://quiz-api.quiz-app-sam.workers.dev/api/quiz`)
      .then(async res => {
        if (!res.ok) throw new Error(await res.text())
        return res.json()
      })
      .then(setQuestions)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false))
  }, [])

  function setAnswer(id: string|number, value:any){
    setAnswers(prev => ({...prev, [String(id)]: value}))
  }

  async function submit() {
    if(!questions) return
    setSubmitting(true)
    const payload = {
      answers: Object.entries(answers).map(([id, value]) => ({ id, value }))
    }
    try {
      const res = await fetch('https://quiz-api.quiz-app-sam.workers.dev/api/grade', {
        method: 'POST',
        headers: {'content-type':'application/json'},
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Grading failed')
      setResult(data)
    } catch (e: any) {
      setError(String(e))
    } finally { setSubmitting(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-screen text-lg font-medium bg-gray-100">Loading quiz…</div>
  if (error) return <div className="flex items-center justify-center h-screen text-red-600 font-medium bg-gray-100">{error}</div>
  if (!questions) return <div className="flex items-center justify-center h-screen text-gray-600 bg-gray-100">No questions found</div>

  return (
    <div className="min-h-screen bg-gray-100 p-4 overflow-x-hidden">
      {/* Quiz Panel */}
      <div className="flex-1  mx-auto md:mx-0">
        <div className='text-gray-800 text-3xl font-bold mb-6 text-center flex gap-5'>
          <h1 className=" md:text-left ">
        </h1>
         <SiQuizlet />Welcome to the Quiz App
        </div>

        <div className="space-y-6 overflow-y-auto max-h-[80vh]">
          {questions.map((q, idx) => (
            <div key={String(q.id)} className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition-shadow select-none">
              <div className="font-medium text-lg mb-3 text-gray-700">{idx+1}. {q.question}</div>

              {/* Text Input */}
              {q.type === 'text' && (
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={answers[String(q.id)] ?? ''}
                  onChange={e => setAnswer(q.id, e.target.value)}
                />
              )}

              {/* Radio Buttons */}
              {q.type === 'radio' && q.choices && (
                <div className="space-y-2">
                  {q.choices.map((c, i) => (
                    <label key={i} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name={String(q.id)}
                        checked={Number(answers[String(q.id)]) === i}
                        onChange={() => setAnswer(q.id, i)}
                        className="accent-blue-500"
                      />
                      <span className="text-gray-700">{c}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Checkbox */}
              {q.type === 'checkbox' && q.choices && (
                <div className="space-y-2">
                  {q.choices.map((c, i) => {
                    const arr: number[] = answers[String(q.id)] ?? []
                    return (
                      <label key={i} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={arr.includes(i)}
                          onChange={(e) => {
                            const next = e.target.checked ? [...arr, i] : arr.filter(n=>n!==i)
                            setAnswer(q.id, next)
                          }}
                          className="accent-blue-500"
                        />
                        <span className="text-gray-700">{c}</span>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-4 mt-6">
          <button
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            onClick={submit}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
          <button
            className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            onClick={()=>{setAnswers({}); setResult(null)}}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Results Panel */}
      {result && (
        <div className='w-full  h-screen flex justify-center items-center absolute top-0 left-0 p-10 overflow-hidden'>
          <div className="relative w-96 h-[400px] lg:h-full  mt-8 md:mt-0 bg-white rounded-xl shadow p-5 overflow-auto">
            <div className='h-20 w-full flex  justify-between '>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Results</h2>
              <div onClick={() => setResult(null)}>
                <IoMdCloseCircleOutline color='black' size={30}/>
              </div>
            </div>

            <div className="text-lg mb-3 text-gray-700">Score: <span className="font-bold">{result.score}</span> / {result.total}</div>
            <ul className="space-y-2">
              {result.results.map((r, index) => (
                <li
                  key={String(r.id)}
                  className={`px-3 py-1 rounded ${r.correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                >
                   Question {index + 1}: {r.correct ? 'Correct' : 'Incorrect'}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
