"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { 
  FileText, Plus, Calendar, Clock, BookOpen, 
  CheckCircle, Users, LayoutDashboard, Loader2, ArrowRight
} from "lucide-react"
import Link from "next/link"

interface Course {
  id: string
  title: string
}

interface Assignment {
  id: string
  title: string
  course_title: string
  due_date: string
  status: string
  submission_count: number
}

export default function TeacherAssignmentsPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // Form State
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [courseId, setCourseId] = useState("")
  const [dueDate, setDueDate] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [coursesRes, assignmentsRes] = await Promise.all([
        fetch("/api/teacher/courses"),
        fetch("/api/teacher/assignments")
      ])
      if (coursesRes.ok) setCourses(await coursesRes.json())
      if (assignmentsRes.ok) setAssignments(await assignmentsRes.json())
    } catch (e) {
      toast.error("Failed to load data.")
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    if (!title || !courseId || !dueDate) {
      toast.warning("Please fill in all required fields.")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/teacher/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, courseId, dueDate })
      })

      if (res.ok) {
        toast.success("Assignment created successfully!")
        setTitle("")
        setDescription("")
        setCourseId("")
        setDueDate("")
        fetchData()
      } else {
        toast.error("Failed to create assignment.")
      }
    } catch (e) {
      toast.error("Error creating assignment.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="p-8 space-y-6"><Skeleton className="h-10 w-48" /><Skeleton className="h-96 rounded-3xl" /></div>

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
           <h1 className="text-3xl font-black text-gray-800 tracking-tight">Assignment Lab</h1>
           <p className="text-gray-500 font-medium">Create and manage student assessments</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
        {/* Create Form */}
        <section className="space-y-6">
           <Card className="border-0 bg-white/80 shadow-2xl backdrop-blur overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-violet-500 to-indigo-600" />
              <CardHeader>
                 <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Plus className="h-5 w-5 text-violet-500" /> New Assignment
                 </CardTitle>
                 <CardDescription>Launch a new task for your students</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="course" className="text-xs font-bold uppercase text-gray-400">Select Course</Label>
                    <Select value={courseId} onValueChange={setCourseId}>
                       <SelectTrigger id="course" className="rounded-xl border-gray-100 bg-gray-50/50">
                          <SelectValue placeholder="Choose a course..." />
                       </SelectTrigger>
                       <SelectContent>
                          {courses.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.title}</SelectItem>)}
                       </SelectContent>
                    </Select>
                 </div>

                 <div className="space-y-2">
                    <Label htmlFor="title" className="text-xs font-bold uppercase text-gray-400">Assignment Title</Label>
                    <Input 
                      id="title" 
                      placeholder="e.g. Mid-term Research Project" 
                      value={title} 
                      onChange={e => setTitle(e.target.value)} 
                      className="rounded-xl border-gray-100 bg-gray-50/50"
                    />
                 </div>

                 <div className="space-y-2">
                    <Label htmlFor="due" className="text-xs font-bold uppercase text-gray-400">Due Date</Label>
                    <Input 
                      id="due" 
                      type="date" 
                      value={dueDate} 
                      onChange={e => setDueDate(e.target.value)} 
                      className="rounded-xl border-gray-100 bg-gray-50/50"
                    />
                 </div>

                 <div className="space-y-2">
                    <Label htmlFor="desc" className="text-xs font-bold uppercase text-gray-400">Instructions (Optional)</Label>
                    <Textarea 
                      id="desc" 
                      placeholder="Explain the requirements..." 
                      rows={4} 
                      value={description} 
                      onChange={e => setDescription(e.target.value)}
                      className="rounded-xl border-gray-100 bg-gray-50/50 resize-none"
                    />
                 </div>

                 <Button 
                  onClick={handleCreate} 
                  disabled={submitting} 
                  className="w-full bg-violet-600 font-bold mt-4"
                 >
                    {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create & Publish"}
                 </Button>
              </CardContent>
           </Card>
        </section>

        {/* Assignments List */}
        <section className="space-y-6">
           <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-800">Active Assignments</h2>
              <Badge variant="outline" className="bg-violet-50 text-violet-600 border-violet-100">{assignments.length}</Badge>
           </div>

           {assignments.length > 0 ? (
             <div className="grid gap-6 sm:grid-cols-2">
                {assignments.map((a, idx) => (
                  <motion.div 
                    key={a.id} 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="group h-full border-0 bg-white/80 shadow-xl backdrop-blur transition-all hover:shadow-2xl hover:scale-[1.01]">
                       <CardContent className="p-6">
                          <div className="mb-4 flex items-start justify-between">
                             <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-violet-50 text-violet-500">
                                <FileText className="h-5 w-5" />
                             </div>
                             <Badge className="bg-emerald-100 text-emerald-700 border-0">{a.submission_count} Submitted</Badge>
                          </div>
                          
                          <div className="mb-6">
                             <p className="text-xs font-bold text-violet-500 mb-1">{a.course_title}</p>
                             <h3 className="text-lg font-black text-gray-800 group-hover:text-violet-600 transition-colors">{a.title}</h3>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                             <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>Due: {new Date(a.due_date).toLocaleDateString()}</span>
                             </div>
                             <Button asChild variant="ghost" size="sm" className="text-violet-600 hover:bg-violet-50 font-bold">
                                <Link href={`/dashboard/teacher/assignments/${a.id}`}>
                                   Grade <ArrowRight className="ml-1 h-3.5 w-3.5" />
                                </Link>
                             </Button>
                          </div>
                       </CardContent>
                    </Card>
                  </motion.div>
                ))}
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-[40px] border-2 border-dashed border-gray-100">
                <LayoutDashboard className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">No active assignments. Create one to get started!</p>
             </div>
           )}
        </section>
      </div>
    </div>
  )
}
