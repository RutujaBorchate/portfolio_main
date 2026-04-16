"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Clock, Calendar, Upload, CheckCircle, AlertCircle, Rocket, Star } from "lucide-react"

interface Assignment {
  id: string
  title: string
  description: string
  course_title: string
  course_id: string
  due_date: string
  max_score: number
  submitted: boolean
  submission_status?: string
  score?: number
  feedback?: string
}

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAssignments() {
      try {
        const res = await fetch("/api/student/assignments")
        if (res.ok) {
          const data = await res.json()
          setAssignments(data)
        }
      } catch (error) {
        console.error("Failed to fetch assignments:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchAssignments()
  }, [])

  const getStatusBadge = (assignment: Assignment) => {
    if (assignment.submission_status === "graded") {
      return (
        <Badge className="bg-emerald-500 text-white">
          <CheckCircle className="mr-1 h-3 w-3" />
          Graded: {assignment.score}/{assignment.max_score}
        </Badge>
      )
    }
    if (assignment.submitted) {
      return (
        <Badge className="bg-amber-500 text-white">
          <Clock className="mr-1 h-3 w-3" />
          Pending Review
        </Badge>
      )
    }
    const dueDate = new Date(assignment.due_date)
    const now = new Date()
    if (dueDate < now) {
      return (
        <Badge className="bg-rose-500 text-white">
          <AlertCircle className="mr-1 h-3 w-3" />
          Overdue
        </Badge>
      )
    }
    return (
      <Badge className="bg-cyan-500 text-white">
        <Upload className="mr-1 h-3 w-3" />
        Pending
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Rocket className="h-12 w-12 text-amber-500" />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800">My Assignments</h1>
          <p className="text-gray-500">Complete assignments and earn grades!</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <span className="font-semibold text-emerald-600">
              {assignments.filter((a) => a.submission_status === "graded").length} Graded
            </span>
          </div>
        </div>
      </div>

      {assignments.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {assignments.map((assignment, index) => (
            <motion.div
              key={assignment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full border-0 bg-white/80 shadow-xl backdrop-blur transition-all hover:scale-[1.02] hover:shadow-2xl">
                <CardContent className="p-0">
                  <div className={`relative h-32 overflow-hidden rounded-t-lg bg-gradient-to-br ${
                    assignment.submission_status === "graded"
                      ? "from-emerald-500 to-teal-500"
                      : assignment.submitted
                      ? "from-amber-500 to-orange-500"
                      : "from-violet-500 to-pink-500"
                  }`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FileText className="h-14 w-14 text-white/30" />
                    </div>
                    <div className="absolute right-3 top-3">
                      {getStatusBadge(assignment)}
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="mb-1 text-sm font-medium text-violet-600">{assignment.course_title}</p>
                    <h3 className="mb-2 line-clamp-1 text-lg font-bold text-gray-800">
                      {assignment.title}
                    </h3>
                    <p className="mb-4 line-clamp-2 text-sm text-gray-500">
                      {assignment.description}
                    </p>
                    <div className="mb-4 flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Due: {new Date(assignment.due_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        {assignment.max_score} pts
                      </span>
                    </div>
                    {assignment.submission_status === "graded" && assignment.feedback && (
                      <div className="mb-4 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 p-3">
                        <p className="text-xs font-medium text-emerald-700">Teacher Feedback:</p>
                        <p className="text-sm text-gray-600 line-clamp-2">{assignment.feedback}</p>
                      </div>
                    )}
                    <Link href={`/student/assignments/${assignment.id}`}>
                      <Button 
                        className={`w-full ${
                          assignment.submission_status === "graded"
                            ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                            : assignment.submitted
                            ? "bg-gradient-to-r from-amber-500 to-orange-500"
                            : "bg-gradient-to-r from-violet-500 to-pink-500"
                        }`}
                      >
                        {assignment.submission_status === "graded" ? (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            View Feedback
                          </>
                        ) : assignment.submitted ? (
                          <>
                            <Clock className="mr-2 h-4 w-4" />
                            View Submission
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Submit Assignment
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
          <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-100">
            <FileText className="h-12 w-12 text-amber-500" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-gray-800">No assignments yet!</h3>
          <p className="mb-6 text-gray-500">Enroll in courses to access assignments</p>
          <Link href="/dashboard/student/courses">
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500">
              Browse Courses
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
