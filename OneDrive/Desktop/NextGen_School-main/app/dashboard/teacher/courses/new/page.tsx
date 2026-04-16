"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookOpen, Loader2, AlertCircle, ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"

export default function CreateCoursePage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [classGrade, setClassGrade] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/teacher/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, class: classGrade }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to create course")
        setIsLoading(false)
        return
      }

      router.push(`/dashboard/teacher/courses/${data.id}`)
      router.refresh()
    } catch {
      setError("Something went wrong. Please try again!")
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link 
        href="/dashboard/teacher/courses" 
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-cyan-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Courses
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-0 bg-white/80 shadow-xl backdrop-blur">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/30">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-extrabold text-gray-800">Create New Course</CardTitle>
            <p className="text-gray-500">Share your knowledge with students</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="border-rose-200 bg-rose-50 text-rose-700">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="title" className="font-semibold text-gray-700">
                  Course Title
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Introduction to Mathematics"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 border-2 border-cyan-200 bg-white/70 text-base focus:border-cyan-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="class" className="font-semibold text-gray-700">
                  Target Class/Grade
                </Label>
                <div className="grid gap-2">
                  <select 
                    id="class"
                    value={classGrade}
                    onChange={(e) => setClassGrade(e.target.value)}
                    disabled={isLoading}
                    className="h-12 w-full rounded-md border-2 border-cyan-200 bg-white/70 px-3 text-base focus:border-cyan-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="" disabled>Select class range</option>
                    {["Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9"].map(grade => (
                       <option key={grade} value={grade}>
                         {grade}
                       </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rounded-xl bg-gradient-to-r from-cyan-50 to-blue-50 p-4 ring-1 ring-cyan-200/50">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-cyan-500 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-700">What happens next?</p>
                    <p className="text-sm text-gray-500">
                      After creating the course, you can add modules, quizzes, and assignments. 
                      Your course will be reviewed by an admin before being published.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Link href="/dashboard/teacher/courses" className="flex-1">
                  <Button type="button" variant="outline" className="w-full h-12 border-2">
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  className="flex-1 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 font-semibold" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Course"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
