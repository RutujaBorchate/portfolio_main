"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookOpen, Loader2, AlertCircle, ArrowLeft, Rocket, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function CreateInstitutionCoursePage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [classGrade, setClassGrade] = useState("")
  const [thumbnail, setThumbnail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!title || !classGrade) {
      setError("Please fill in the required fields (Title and Class)")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/institution/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title, 
          description, 
          class: classGrade,
          thumbnail 
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to create course")
        setIsLoading(false)
        return
      }

      toast.success("Course created successfully!")
      router.push("/dashboard/institution/courses")
      router.refresh()
    } catch {
      setError("Something went wrong. Please try again!")
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link 
        href="/dashboard/institution/courses" 
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-amber-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Courses
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="overflow-hidden border-0 bg-white/80 shadow-2xl backdrop-blur-xl">
          <CardHeader className="bg-gradient-to-r from-amber-500/10 to-rose-500/10 text-center pb-8 border-b border-gray-100">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 shadow-lg shadow-amber-500/30">
              <Rocket className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-extrabold text-gray-800">Add New Course</CardTitle>
            <CardDescription className="text-gray-500 max-w-sm mx-auto">
              Set up a new course for your institution. It will be available to students immediately.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="border-rose-200 bg-rose-50 text-rose-700">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-bold text-gray-700">
                  Course Title <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Advanced Robotics for Beginners"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 border-gray-200 bg-white/50 text-base focus:border-amber-400 focus:ring-amber-400"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="class" className="text-sm font-bold text-gray-700">
                    Target Class/Grade <span className="text-rose-500">*</span>
                  </Label>
                  <select 
                    id="class"
                    value={classGrade}
                    onChange={(e) => setClassGrade(e.target.value)}
                    disabled={isLoading}
                    className="flex h-12 w-full rounded-md border border-gray-200 bg-white/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="" disabled>Select grade</option>
                    {["Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9"].map(grade => (
                       <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thumbnail" className="text-sm font-bold text-gray-700">
                    Thumbnail URL
                  </Label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="thumbnail"
                      placeholder="https://..."
                      value={thumbnail}
                      onChange={(e) => setThumbnail(e.target.value)}
                      disabled={isLoading}
                      className="h-12 border-gray-200 bg-white/50 pl-10 text-base focus:border-amber-400 focus:ring-amber-400"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-bold text-gray-700">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Tell students what they will achieve in this course..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  disabled={isLoading}
                  className="min-h-[120px] border-gray-200 bg-white/50 text-base focus:border-amber-400 focus:ring-amber-400"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Link href="/dashboard/institution/courses" className="flex-1">
                  <Button type="button" variant="outline" className="w-full h-12 border-gray-200 text-gray-600 hover:bg-gray-50">
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  className="flex-1 h-12 bg-gradient-to-r from-amber-500 to-rose-500 font-bold text-white shadow-lg shadow-amber-500/25 transition-transform active:scale-[0.98]" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Launch Course"
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
