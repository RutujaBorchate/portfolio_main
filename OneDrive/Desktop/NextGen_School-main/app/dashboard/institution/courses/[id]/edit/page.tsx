"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookOpen, Loader2, AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function EditCoursePage() {
  const router = useRouter()
  const params: any = useParams()
  
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [classGrade, setClassGrade] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch(`/api/course/${params.id}`)
        if (res.ok) {
          const c = await res.json()
          setTitle(c.title || "")
          setDescription(c.description || "")
          setClassGrade(c.class || "")
        } else {
          setError("Failed to fetch course details")
        }
      } catch (err) {
        setError("Network error parsing course")
      } finally {
        setFetching(false)
      }
    }
    init()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      const res = await fetch(`/api/course/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, class: classGrade }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to update course")
        setIsLoading(false)
        return
      }
      
      setSuccess("Course updated successfully!")
      router.refresh()
      setTimeout(() => {
        router.push("/dashboard/institution/courses")
      }, 1500)
    } catch {
      setError("Something went wrong. Please try again!")
      setIsLoading(false)
    }
  }

  if (fetching) {
     return <div className="flex h-40 items-center justify-center"><Loader2 className="animate-spin text-amber-500 w-8 h-8" /></div>
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link 
        href="/dashboard/institution/courses" 
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-amber-600"
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
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 shadow-lg shadow-amber-500/30">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-extrabold text-gray-800">Edit Institution Course</CardTitle>
            <p className="text-gray-500">Update your course details</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="border-rose-200 bg-rose-50 text-rose-700">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="border-emerald-200 bg-emerald-50 text-emerald-700">
                  <AlertDescription>{success}</AlertDescription>
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
                  className="h-12 border-2 border-amber-200 bg-white/70 text-base focus:border-amber-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="font-semibold text-gray-700">
                  Description
                </Label>
                <textarea
                  id="description"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isLoading}
                  placeholder="Course description..."
                  className="w-full rounded-md border-2 border-amber-200 bg-white/70 p-3 text-base focus:border-amber-400 focus:outline-none min-h-[100px]"
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
                    required
                    disabled={isLoading}
                    className="h-12 w-full rounded-md border-2 border-amber-200 bg-white/70 px-3 text-base focus:border-amber-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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

              <div className="flex gap-4">
                <Link href="/dashboard/institution/courses" className="flex-1">
                  <Button type="button" variant="outline" className="w-full h-12 border-2">
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  className="flex-1 h-12 bg-gradient-to-r from-amber-500 to-rose-500 font-semibold text-white hover:from-amber-600 hover:to-rose-600" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Course"
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
