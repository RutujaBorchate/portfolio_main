"use client"

import { useEffect, useState, use } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { 
  FileText, Calendar, Clock, ArrowLeft, 
  Upload, CheckCircle, AlertCircle, Loader2, Link as LinkIcon
} from "lucide-react"
import Link from "next/link"

interface Assignment {
  id: string
  title: string
  description: string
  due_date: string
  max_score: number
  course_title: string
  submitted: boolean
  submission_status?: string
  score?: number
  feedback?: string
}

export default function StudentAssignmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [text, setText] = useState("")

  useEffect(() => {
    async function fetchDetails() {
      try {
        const res = await fetch("/api/student/assignments")
        if (res.ok) {
           const data = await res.json()
           const found = data.find((a: any) => a.id.toString() === id)
           setAssignment(found)
        }
      } catch (e) {
        toast.error("Failed to load assignment details.")
      } finally {
        setLoading(false)
      }
    }
    fetchDetails()
  }, [])

  async function handleSubmit() {
    if (!text) {
      toast.warning("Please provide your submission text or link.")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/student/assignments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId: id, submissionText: text })
      })
      if (res.ok) {
        toast.success("Assignment submitted successfully!")
        window.location.reload()
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

  if (loading) return <div className="p-8 space-y-6"><Skeleton className="h-10 w-48" /><Skeleton className="h-96 rounded-3xl" /></div>

  if (!assignment) return <div>Assignment not found.</div>

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
       <Link href="/dashboard/student/assignments" className="flex items-center gap-2 text-sm font-bold text-violet-600 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Assignments
       </Link>

       <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <div className="space-y-6">
             <Card className="border-0 bg-white/80 shadow-2xl backdrop-blur overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-violet-500 to-indigo-600" />
                <CardHeader className="p-8">
                   <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-violet-50 text-violet-600 border-violet-100">{assignment.course_title}</Badge>
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
                         <Calendar className="h-4 w-4" /> Due: {new Date(assignment.due_date).toLocaleDateString()}
                      </div>
                   </div>
                   <CardTitle className="text-4xl font-black text-gray-800">{assignment.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                   <div className="prose max-w-none text-gray-600 leading-relaxed mb-8">
                      {assignment.description || "No specific instructions provided. Please follow the course guidelines for this assignment."}
                   </div>

                   {!assignment.submitted ? (
                     <div className="space-y-4 pt-6 border-t border-gray-100">
                        <Label className="text-sm font-black text-gray-800 uppercase tracking-widest">Your Submission</Label>
                        <Textarea 
                          placeholder="Type your response or paste a link to your file (Google Drive, GitHub, etc.)..."
                          rows={8}
                          value={text}
                          onChange={e => setText(e.target.value)}
                          className="rounded-2xl border-gray-100 bg-gray-50/50 p-6 resize-none focus:ring-violet-500"
                        />
                        <Button 
                          onClick={handleSubmit} 
                          disabled={submitting}
                          className="w-full h-14 bg-violet-600 font-black text-lg rounded-2xl shadow-xl shadow-violet-200"
                        >
                           {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Upload className="mr-2 h-5 w-5" /> Submit Assignment</>}
                        </Button>
                     </div>
                   ) : (
                     <div className="p-8 rounded-[32px] bg-emerald-50 border-2 border-emerald-100 flex flex-col items-center text-center">
                        <div className="h-20 w-20 flex items-center justify-center rounded-[28px] bg-emerald-100 text-emerald-600 mb-4 shadow-inner">
                           <CheckCircle className="h-10 w-10" />
                        </div>
                        <h3 className="text-2xl font-black text-emerald-800">Assignment Submitted</h3>
                        <p className="text-emerald-600 font-medium">Your work has been received and is waiting for grading.</p>
                     </div>
                   )}
                </CardContent>
             </Card>
          </div>

          <div className="space-y-6">
             <Card className="border-0 bg-white/80 shadow-xl backdrop-blur">
                <CardHeader>
                   <CardTitle className="text-xl font-bold">Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                      <p className="text-xs font-bold text-gray-400 uppercase">Max Score</p>
                      <p className="font-black text-gray-800">{assignment.max_score} pts</p>
                   </div>
                   
                   {assignment.submitted && (
                     <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-3">
                        <div>
                           <p className="text-xs font-bold text-emerald-600 uppercase">Progress</p>
                           <p className="font-black text-emerald-800">{assignment.submission_status === 'graded' ? 'GRADED' : 'PENDING'}</p>
                        </div>
                        {assignment.submission_status === 'graded' && (
                          <div className="pt-3 border-t border-emerald-100">
                             <p className="text-xs font-bold text-emerald-600 uppercase">Score Earned</p>
                             <p className="text-3xl font-black text-emerald-800">{assignment.score}/{assignment.max_score}</p>
                          </div>
                        )}
                     </div>
                   )}

                   {assignment.feedback && (
                     <div className="p-4 rounded-2xl bg-violet-50 border border-violet-100">
                        <p className="text-xs font-bold text-violet-600 uppercase mb-2">Teacher Feedback</p>
                        <p className="text-sm text-gray-700 italic">"{assignment.feedback}"</p>
                     </div>
                   )}
                </CardContent>
             </Card>
          </div>
       </div>
    </div>
  )
}
