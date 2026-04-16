"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowLeft, BookOpen, PlusCircle, Users, CheckCircle, Clock, Loader2, Trash2, Video, FileText, GripVertical } from "lucide-react"

interface Module {
  id: string
  title: string
  description: string
  video_url?: string
  content?: string
  order_number: number
}

interface CourseDetail {
  id: string
  title: string
  description: string
  status: string
  enrolled_count: number
  modules_count: number
  modules: Module[]
}

export default function TeacherCourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [addingModule, setAddingModule] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [moduleForm, setModuleForm] = useState({ title: "", description: "", videoUrl: "", content: "" })

  useEffect(() => { fetchCourse() }, [params.id])

  async function fetchCourse() {
    try {
      const res = await fetch(`/api/teacher/courses/${params.id}`)
      if (res.ok) setCourse(await res.json())
      else router.push("/teacher/courses")
    } catch { router.push("/teacher/courses") }
    finally { setLoading(false) }
  }

  async function handleAddModule(e: React.FormEvent) {
    e.preventDefault()
    setAddingModule(true)
    try {
      const res = await fetch("/api/teacher/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: params.id, ...moduleForm }),
      })
      if (res.ok) {
        setDialogOpen(false)
        setModuleForm({ title: "", description: "", videoUrl: "", content: "" })
        fetchCourse()
      }
    } finally { setAddingModule(false) }
  }

  async function handleDeleteModule(moduleId: string) {
    if (!confirm("Delete this module?")) return
    await fetch(`/api/teacher/modules/${moduleId}`, { method: "DELETE" })
    fetchCourse()
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-cyan-500" />
      </div>
    )
  }

  if (!course) return null

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/teacher/courses" className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-cyan-600">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      </div>

      {/* Course Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 p-8 text-white shadow-2xl">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <div className="mb-3 flex items-center gap-3">
            <Badge className={`${course.status === "approved" ? "bg-emerald-400" : course.status === "pending" ? "bg-amber-400" : "bg-gray-400"} text-white`}>
              {course.status === "approved" ? <><CheckCircle className="mr-1 h-3 w-3" />Published</> : course.status === "pending" ? <><Clock className="mr-1 h-3 w-3" />Pending Review</> : "Draft"}
            </Badge>
          </div>
          <h1 className="mb-2 text-3xl font-extrabold">{course.title}</h1>
          <p className="text-white/80">{course.description}</p>
          <div className="mt-4 flex gap-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span className="font-semibold">{course.enrolled_count} students</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <span className="font-semibold">{course.modules?.length || 0} modules</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modules */}
      <Card className="border-0 bg-white/80 shadow-xl backdrop-blur">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold text-gray-800">Course Modules</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 gap-2">
                <PlusCircle className="h-4 w-4" /> Add Module
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Module</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddModule} className="space-y-4">
                <div className="space-y-2">
                  <Label>Module Title *</Label>
                  <Input
                    placeholder="e.g., Introduction to Algebra"
                    value={moduleForm.title}
                    onChange={e => setModuleForm(p => ({ ...p, title: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="What students will learn in this module..."
                    value={moduleForm.description}
                    onChange={e => setModuleForm(p => ({ ...p, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Video URL</Label>
                  <Input
                    placeholder="https://youtube.com/... or https://vimeo.com/..."
                    value={moduleForm.videoUrl}
                    onChange={e => setModuleForm(p => ({ ...p, videoUrl: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Text Content</Label>
                  <Textarea
                    placeholder="Add any notes, text content, or reading material..."
                    value={moduleForm.content}
                    onChange={e => setModuleForm(p => ({ ...p, content: e.target.value }))}
                    rows={4}
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500" disabled={addingModule}>
                    {addingModule ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Module"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {course.modules?.length > 0 ? (
            <div className="space-y-3">
              {course.modules.map((mod, index) => (
                <motion.div
                  key={mod.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-4 rounded-2xl border-2 border-gray-100 bg-white p-4 transition-all hover:border-cyan-200 hover:shadow-md"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 font-bold text-cyan-600">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-gray-800">{mod.title}</h4>
                    {mod.description && <p className="mt-1 text-sm text-gray-500 line-clamp-2">{mod.description}</p>}
                    <div className="mt-2 flex gap-3">
                      {mod.video_url && (
                        <span className="flex items-center gap-1 text-xs text-cyan-600">
                          <Video className="h-3 w-3" /> Video
                        </span>
                      )}
                      {mod.content && (
                        <span className="flex items-center gap-1 text-xs text-violet-600">
                          <FileText className="h-3 w-3" /> Content
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-rose-400 hover:bg-rose-50 hover:text-rose-600"
                    onClick={() => handleDeleteModule(mod.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cyan-100 to-blue-100">
                <BookOpen className="h-10 w-10 text-cyan-500" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-gray-700">No modules yet</h3>
              <p className="text-gray-500">Add your first module to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
