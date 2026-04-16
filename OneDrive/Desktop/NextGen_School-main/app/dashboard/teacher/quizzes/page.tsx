"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CheckSquare, PlusCircle, Loader2, Trash2, Users, Clock, Star, Rocket } from "lucide-react"

interface Quiz {
  id: string; title: string; course_title: string; course_id: string
  time_limit: number; passing_score: number; max_attempts: number
  question_count: number; submission_count: number; created_at: string
}
interface Course { id: string; title: string }
interface QuestionForm { question: string; option1: string; option2: string; option3: string; option4: string; correctAnswer: number }

const defaultQuestion = (): QuestionForm => ({ question: "", option1: "", option2: "", option3: "", option4: "", correctAnswer: 1 })

export default function TeacherQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ courseId: "", title: "", timeLimit: 30, passingScore: 70, maxAttempts: 3 })
  const [questions, setQuestions] = useState<QuestionForm[]>([defaultQuestion()])

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const [qRes, cRes] = await Promise.all([fetch("/api/teacher/quizzes"), fetch("/api/teacher/courses")])
    if (qRes.ok) setQuizzes(await qRes.json())
    if (cRes.ok) setCourses(await cRes.json())
    setLoading(false)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/api/teacher/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, questions }),
      })
      if (res.ok) {
        setDialogOpen(false)
        setForm({ courseId: "", title: "", timeLimit: 30, passingScore: 70, maxAttempts: 3 })
        setQuestions([defaultQuestion()])
        fetchData()
      }
    } finally { setSaving(false) }
  }

  if (loading) return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
        <Rocket className="h-12 w-12 text-cyan-500" />
      </motion.div>
    </div>
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800">Quizzes</h1>
          <p className="text-gray-500">Create and manage quizzes for your courses</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-500">
              <PlusCircle className="h-5 w-5" /> Create Quiz
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Create New Quiz</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label>Course *</Label>
                  <Select value={form.courseId} onValueChange={v => setForm(p => ({ ...p, courseId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select a course" /></SelectTrigger>
                    <SelectContent>
                      {courses.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Quiz Title *</Label>
                  <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g., Chapter 1 Quiz" required />
                </div>
                <div className="space-y-2">
                  <Label>Time Limit (minutes)</Label>
                  <Input type="number" value={form.timeLimit} onChange={e => setForm(p => ({ ...p, timeLimit: +e.target.value }))} min={5} max={120} />
                </div>
                <div className="space-y-2">
                  <Label>Passing Score (%)</Label>
                  <Input type="number" value={form.passingScore} onChange={e => setForm(p => ({ ...p, passingScore: +e.target.value }))} min={1} max={100} />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Questions</Label>
                  <Button type="button" size="sm" variant="outline" onClick={() => setQuestions(q => [...q, defaultQuestion()])}>
                    <PlusCircle className="mr-1 h-4 w-4" /> Add Question
                  </Button>
                </div>
                {questions.map((q, qi) => (
                  <div key={qi} className="rounded-xl border-2 border-gray-100 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-700">Q{qi + 1}</span>
                      {questions.length > 1 && (
                        <Button type="button" size="sm" variant="ghost" className="text-rose-500 h-7" onClick={() => setQuestions(qs => qs.filter((_, i) => i !== qi))}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <Input placeholder="Question text" value={q.question} onChange={e => setQuestions(qs => qs.map((x, i) => i === qi ? { ...x, question: e.target.value } : x))} required />
                    <div className="grid grid-cols-2 gap-2">
                      {(["option1", "option2", "option3", "option4"] as const).map((opt, oi) => (
                        <div key={opt} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${qi}`}
                            checked={q.correctAnswer === oi + 1}
                            onChange={() => setQuestions(qs => qs.map((x, i) => i === qi ? { ...x, correctAnswer: oi + 1 } : x))}
                            className="h-4 w-4 accent-cyan-500"
                          />
                          <Input
                            placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                            value={q[opt]}
                            onChange={e => setQuestions(qs => qs.map((x, i) => i === qi ? { ...x, [opt]: e.target.value } : x))}
                            required
                            className="text-sm"
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">● = correct answer</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500" disabled={saving || !form.courseId || !form.title}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Quiz"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {quizzes.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz, index) => (
            <motion.div key={quiz.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card className="border-0 bg-white/80 shadow-xl backdrop-blur h-full">
                <CardContent className="p-0">
                  <div className="h-32 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-t-lg flex items-center justify-center relative">
                    <CheckSquare className="h-14 w-14 text-white/30" />
                    <div className="absolute right-3 top-3">
                      <Badge className="bg-white/20 text-white backdrop-blur">{quiz.question_count} Qs</Badge>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-sm font-medium text-cyan-600 mb-1">{quiz.course_title}</p>
                    <h3 className="text-lg font-bold text-gray-800 mb-3">{quiz.title}</h3>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{quiz.time_limit} min</span>
                      <span className="flex items-center gap-1"><Star className="h-4 w-4" />{quiz.passing_score}%</span>
                      <span className="flex items-center gap-1"><Users className="h-4 w-4" />{quiz.submission_count} attempts</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-cyan-100 to-blue-100">
            <CheckSquare className="h-12 w-12 text-cyan-500" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-gray-800">No quizzes yet</h3>
          <p className="text-gray-500">Create your first quiz to test students</p>
        </div>
      )}
    </div>
  )
}
