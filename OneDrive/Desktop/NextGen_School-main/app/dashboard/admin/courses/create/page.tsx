"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, ArrowLeft, BookOpen } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface User {
  id: number
  name: string
  email: string
  role: string
}

export default function CreateCoursePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [teachers, setTeachers] = useState<User[]>([])
  
  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [symbol, setSymbol] = useState("")
  const [teacherId, setTeacherId] = useState("")
  const [classGrade, setClassGrade] = useState("")

  useEffect(() => {
    fetchTeachers()
  }, [])

  async function fetchTeachers() {
    try {
      const res = await fetch("/api/admin/users")
      if (res.ok) {
        const data: User[] = await res.json()
        setTeachers(data.filter((u) => u.role === "teacher"))
      }
    } catch (e) {
      toast.error("Failed to fetch teachers")
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!title || !description || !teacherId || !classGrade) {
      toast.error("Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          symbol,
          teacherId: parseInt(teacherId),
          classGrade
        }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success("Course created successfully")
        router.push("/dashboard/admin/courses")
        router.refresh()
      } else {
        toast.error(data.error || "Failed to create course")
      }
    } catch (e) {
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin/courses">
          <Button variant="outline" size="icon" className="h-10 w-10">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800">Create New Course</h1>
          <p className="text-gray-500">Directly add a course that will be approved automatically</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-xl border-b border-emerald-100">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-emerald-600" />
              <CardTitle className="text-2xl text-emerald-900">Course Details</CardTitle>
            </div>
            <CardDescription className="text-emerald-700/80">
              Fill in the required info to set up a new course.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={onSubmit} className="space-y-6">
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Course Title <span className="text-rose-500">*</span></label>
                <Input 
                  placeholder="e.g. Introduction to Physics" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Description <span className="text-rose-500">*</span></label>
                <textarea 
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Detailed description of the course content..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Select Teacher <span className="text-rose-500">*</span></label>
                  <Select value={teacherId} onValueChange={setTeacherId} disabled={loading || teachers.length === 0}>
                    <SelectTrigger>
                      <SelectValue placeholder={teachers.length > 0 ? "Select a teacher" : "Loading teachers..."} />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map(t => (
                         <SelectItem key={t.id.toString()} value={t.id.toString()}>
                           {t.name} ({t.email})
                         </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Class/Grade <span className="text-rose-500">*</span></label>
                  <Select value={classGrade} onValueChange={setClassGrade} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class/grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9"].map(grade => (
                         <SelectItem key={grade} value={grade}>
                           {grade}
                         </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Course Symbol / Thumbnail URL <span className="text-gray-400 font-normal">(Optional)</span></label>
                <Input 
                  placeholder="https://example.com/image.png" 
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Link href="/dashboard/admin/courses">
                  <Button variant="outline" type="button" disabled={loading}>
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white min-w-[150px]"
                  disabled={loading}
                >
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
                  ) : "Create Course"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
