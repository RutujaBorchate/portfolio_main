"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckSquare, Clock, Trophy, Star, Rocket, CheckCircle, XCircle, Play } from "lucide-react"

interface Quiz {
  id: string
  title: string
  course_title: string
  course_id: string
  time_limit: number
  total_questions: number
  passing_score: number
  attempts: number
  max_attempts: number
  passed: boolean
  best_score?: number
}

export default function StudentQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        const res = await fetch("/api/student/quizzes")
        if (res.ok) {
          const data = await res.json()
          setQuizzes(data)
        }
      } catch (error) {
        console.error("Failed to fetch quizzes:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchQuizzes()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Rocket className="h-12 w-12 text-cyan-500" />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800">My Quizzes</h1>
          <p className="text-gray-500">Test your knowledge and earn points!</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2">
            <Trophy className="h-5 w-5 text-emerald-600" />
            <span className="font-semibold text-emerald-600">
              {quizzes.filter((q) => q.passed).length} Passed
            </span>
          </div>
        </div>
      </div>

      {quizzes.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz, index) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full border-0 bg-white/80 shadow-xl backdrop-blur transition-all hover:scale-[1.02] hover:shadow-2xl">
                <CardContent className="p-0">
                  <div className={`relative h-32 overflow-hidden rounded-t-lg bg-gradient-to-br ${
                    quiz.passed 
                      ? "from-emerald-500 to-teal-500" 
                      : quiz.attempts >= quiz.max_attempts
                      ? "from-gray-400 to-gray-500"
                      : "from-cyan-500 to-blue-500"
                  }`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CheckSquare className="h-14 w-14 text-white/30" />
                    </div>
                    <div className="absolute right-3 top-3">
                      {quiz.passed ? (
                        <Badge className="bg-white/20 text-white backdrop-blur">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Passed
                        </Badge>
                      ) : quiz.attempts >= quiz.max_attempts ? (
                        <Badge className="bg-white/20 text-white backdrop-blur">
                          <XCircle className="mr-1 h-3 w-3" />
                          Max Attempts
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="mb-1 text-sm font-medium text-violet-600">{quiz.course_title}</p>
                    <h3 className="mb-3 line-clamp-1 text-lg font-bold text-gray-800">
                      {quiz.title}
                    </h3>
                    <div className="mb-4 flex flex-wrap gap-2 text-sm">
                      <span className="flex items-center gap-1 text-gray-500">
                        <Clock className="h-4 w-4" />
                        {quiz.time_limit} min
                      </span>
                      <span className="flex items-center gap-1 text-gray-500">
                        <CheckSquare className="h-4 w-4" />
                        {quiz.total_questions} questions
                      </span>
                      <span className="flex items-center gap-1 text-gray-500">
                        <Star className="h-4 w-4" />
                        {quiz.passing_score}% to pass
                      </span>
                    </div>
                    {quiz.best_score !== undefined && (
                      <div className="mb-4 rounded-lg bg-gradient-to-r from-violet-50 to-pink-50 p-3">
                        <p className="text-sm text-gray-600">
                          Best Score: <span className="font-bold text-violet-600">{quiz.best_score}%</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          Attempts: {quiz.attempts}/{quiz.max_attempts}
                        </p>
                      </div>
                    )}
                    <Link href={`/student/quizzes/${quiz.id}`}>
                      <Button 
                        className={`w-full ${
                          quiz.passed
                            ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                            : quiz.attempts >= quiz.max_attempts
                            ? "bg-gray-400"
                            : "bg-gradient-to-r from-cyan-500 to-blue-500"
                        }`}
                        disabled={quiz.attempts >= quiz.max_attempts && !quiz.passed}
                      >
                        {quiz.passed ? (
                          <>
                            <Trophy className="mr-2 h-4 w-4" />
                            Review Quiz
                          </>
                        ) : quiz.attempts >= quiz.max_attempts ? (
                          <>
                            <XCircle className="mr-2 h-4 w-4" />
                            No Attempts Left
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            {quiz.attempts > 0 ? "Retry Quiz" : "Start Quiz"}
                          </>
                        )}
                      </Button>
                    </Link>
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
          <h3 className="mb-2 text-xl font-bold text-gray-800">No quizzes yet!</h3>
          <p className="mb-6 text-gray-500">Enroll in courses to access quizzes</p>
          <Link href="/dashboard/student/courses">
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-500">
              Browse Courses
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
