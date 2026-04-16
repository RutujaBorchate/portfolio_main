"use client"

import { useEffect, useState, use } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import confetti from "canvas-confetti"
import { 
  Trophy, CheckCircle, XCircle, Clock, ArrowLeft, 
  HelpCircle, Rocket, Star, ShieldCheck, AlertCircle, Loader2
} from "lucide-react"
import Link from "next/link"

interface Question {
  id: string
  question: string
  points: number
  order_number: number
}

interface Option {
  id: string
  question_id: string
  option_text: string
}

interface QuizData {
  id: string
  title: string
  time_limit: number
  passing_score: number
  questions: Question[]
  options: Option[]
  completed: boolean
  previousScore?: number
}

export default function StudentQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [quiz, setQuiz] = useState<QuizData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState<{ score: number, passed: boolean, correct: number, total: number } | null>(null)

  useEffect(() => {
    fetchQuiz()
  }, [])

  async function fetchQuiz() {
    try {
      const res = await fetch(`/api/student/quizzes/${id}`)
      if (res.ok) {
        const data = await res.json()
        setQuiz(data)
        if (data.completed) {
           setResult({ score: data.previousScore, passed: data.previousScore >= 70, correct: 0, total: data.questions.length })
        }
      } else {
        toast.error("Failed to load quiz.")
      }
    } catch (e) {
      toast.error("Connection error.")
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit() {
    if (Object.keys(answers).length < (quiz?.questions.length || 0)) {
       toast.warning("Please answer all questions before submitting.")
       return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/student/quizzes/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId: id, answers })
      })
      if (res.ok) {
        const data = await res.json()
        setResult(data)
        if (data.passed) {
          confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } })
        }
      } else {
        const err = await res.json()
        toast.error(err.error || "Submission failed.")
      }
    } catch (e) {
      toast.error("Network error.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="p-8 space-y-6"><Skeleton className="h-12 w-64" /><Skeleton className="h-96 rounded-3xl" /></div>

  if (result) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Card className="max-w-md border-0 bg-white/80 shadow-2xl backdrop-blur text-center overflow-hidden">
             <div className={`h-3 bg-gradient-to-r ${result.passed ? "from-emerald-400 to-teal-500" : "from-rose-400 to-red-500"}`} />
             <CardContent className="p-10">
                <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl ${result.passed ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-500"}`}>
                   {result.passed ? <Trophy className="h-10 w-10" /> : <XCircle className="h-10 w-10" />}
                </div>
                <h2 className="text-3xl font-black text-gray-800">{result.passed ? "Congratulations!" : "Keep Practicing!"}</h2>
                <p className="mt-2 text-gray-500">You scored {result.score}% on the {quiz?.title}</p>
                
                <div className="mt-8 grid grid-cols-2 gap-4">
                   <div className="rounded-2xl bg-gray-50 p-4">
                      <p className="text-xs font-bold text-gray-400 uppercase">Passing Score</p>
                      <p className="text-xl font-black text-gray-700">{quiz?.passing_score}%</p>
                   </div>
                   <div className="rounded-2xl bg-gray-50 p-4">
                      <p className="text-xs font-bold text-gray-400 uppercase">Your Result</p>
                      <p className={`text-xl font-black ${result.passed ? "text-emerald-600" : "text-rose-500"}`}>
                        {result.passed ? "PASSED" : "FAILED"}
                      </p>
                   </div>
                </div>
                
                <Button asChild className="mt-10 w-full bg-violet-600 font-bold" size="lg">
                   <Link href="/dashboard/student/quizzes">Back to Quizzes</Link>
                </Button>
             </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  const currentQuestion = quiz?.questions[currentStep]
  const currentOptions = quiz?.options.filter(o => o.question_id === currentQuestion?.id)
  const isLast = currentStep === (quiz?.questions.length || 0) - 1

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
       <div className="mb-8 flex items-center justify-between">
          <div>
             <Link href="/dashboard/student/quizzes" className="flex items-center gap-2 text-sm font-bold text-violet-600 mb-2">
                <ArrowLeft className="h-4 w-4" /> Exit Quiz
             </Link>
             <h1 className="text-2xl font-black text-gray-800">{quiz?.title}</h1>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-xl border border-gray-100">
             <Clock className="h-5 w-5 text-amber-500" />
             <span className="font-bold text-gray-700">{quiz?.time_limit} MINS</span>
          </div>
       </div>

       <div className="mb-6 space-y-2">
          <div className="flex justify-between text-xs font-black text-gray-400 uppercase tracking-widest">
             <span>Question {currentStep + 1} of {quiz?.questions.length}</span>
             <span>{Math.round(((currentStep + 1) / (quiz?.questions.length || 1)) * 100)}% COMPLETE</span>
          </div>
          <Progress value={((currentStep + 1) / (quiz?.questions.length || 1)) * 100} className="h-2" />
       </div>

       <AnimatePresence mode="wait">
          <motion.div 
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
             <Card className="border-0 bg-white/80 shadow-2xl backdrop-blur overflow-hidden transition-all">
                <CardHeader className="p-8 pb-4">
                   <div className="flex items-start gap-4">
                      <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-violet-100 text-violet-600 font-bold">
                         Q{currentStep + 1}
                      </div>
                      <CardTitle className="text-xl leading-relaxed text-gray-800">
                        {currentQuestion?.question}
                      </CardTitle>
                   </div>
                </CardHeader>
                <CardContent className="p-8 pt-4">
                   <RadioGroup 
                    value={answers[currentQuestion?.id || ""]} 
                    onValueChange={(val) => setAnswers({...answers, [currentQuestion?.id || ""]: val})}
                    className="grid gap-4"
                   >
                      {currentOptions?.map((option) => (
                        <Label
                          key={option.id}
                          className={`flex items-center gap-4 p-5 rounded-3xl border-2 transition-all cursor-pointer group hover:bg-violet-50 ${
                            answers[currentQuestion?.id || ""] === option.id 
                            ? "border-violet-500 bg-violet-50 ring-2 ring-violet-200" 
                            : "border-gray-100 bg-white"
                          }`}
                        >
                          <RadioGroupItem value={option.id} className="h-5 w-5 border-2 text-violet-600" />
                          <span className="text-lg font-medium text-gray-700 group-hover:text-violet-700">
                            {option.option_text}
                          </span>
                        </Label>
                      ))}
                   </RadioGroup>
                </CardContent>
                <CardFooter className="bg-gray-50/50 p-8 flex justify-between">
                   <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                    disabled={currentStep === 0}
                    className="font-bold px-8 rounded-2xl"
                   >
                      Previous
                   </Button>
                   {isLast ? (
                     <Button 
                      onClick={handleSubmit} 
                      disabled={submitting}
                      className="bg-gradient-to-r from-violet-600 to-indigo-600 font-black px-12 rounded-2xl shadow-xl shadow-violet-200"
                     >
                        {submitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting...</> : "Submit Quiz"}
                     </Button>
                   ) : (
                     <Button 
                      onClick={() => setCurrentStep(prev => prev + 1)} 
                      disabled={!answers[currentQuestion?.id || ""]}
                      className="bg-violet-600 font-black px-12 rounded-2xl"
                     >
                        Next Question
                     </Button>
                   )}
                </CardFooter>
             </Card>
          </motion.div>
       </AnimatePresence>
    </div>
  )
}
