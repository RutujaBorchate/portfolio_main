"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { 
  Users, CheckCircle, XCircle, Clock, Search, BookOpen, AlertCircle, Loader2
} from "lucide-react"

interface Enrollment {
  id: string
  student_name: string
  student_email: string
  course_title: string
  status: string
  enrolled_at: string
}

export default function TeacherEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchEnrollments()
  }, [])

  async function fetchEnrollments() {
    try {
      const res = await fetch("/api/teacher/enrollments")
      if (res.ok) {
        setEnrollments(await res.json())
      }
    } catch (e) {
      toast.error("Failed to load enrollments.")
    } finally {
      setLoading(false)
    }
  }

  async function handleAction(id: string, status: "approved" | "rejected") {
    setActionLoading(id + status)
    try {
      const res = await fetch("/api/teacher/enrollments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentId: id, status })
      })
      if (res.ok) {
        toast.success(`Enrollment ${status} successfully.`)
        fetchEnrollments()
      } else {
        toast.error("Failed to update enrollment.")
      }
    } catch (e) {
      toast.error("An error occurred.")
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
        </div>
      </div>
    )
  }

  const pending = enrollments.filter(e => e.status === "pending")
  const active = enrollments.filter(e => e.status === "approved")

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-800">Enrollment Approvals</h1>
        <p className="text-gray-500">Review and approve students who want to join your courses</p>
      </div>

      {/* Pending Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
            {pending.length} Pending
          </Badge>
          <h2 className="text-xl font-bold text-gray-800">New Requests</h2>
        </div>
        
        {pending.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pending.map((e, idx) => (
              <motion.div key={e.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                <Card className="border-0 bg-white/80 shadow-xl backdrop-blur">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100">
                        <Users className="h-6 w-6 text-violet-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-bold text-gray-800">{e.student_name}</p>
                        <p className="truncate text-sm text-gray-500">{e.student_email}</p>
                      </div>
                    </div>
                    <div className="mb-6 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <BookOpen className="h-4 w-4 text-pink-500" />
                        <span className="font-semibold">{e.course_title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock className="h-3.5 w-3.5" />
                        Requested {new Date(e.enrolled_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 font-bold"
                        onClick={() => handleAction(e.id, "approved")}
                        disabled={!!actionLoading}
                      >
                        {actionLoading === e.id + "approved" ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle className="mr-1 h-4 w-4" /> Approve</>}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50"
                        onClick={() => handleAction(e.id, "rejected")}
                        disabled={!!actionLoading}
                      >
                        {actionLoading === e.id + "rejected" ? <Loader2 className="h-4 w-4 animate-spin" /> : <><XCircle className="mr-1 h-4 w-4" /> Reject</>}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-white/50 rounded-3xl border border-dashed border-gray-200">
            <CheckCircle className="h-12 w-12 text-emerald-500 mb-2 opacity-50" />
            <p className="text-gray-500 font-medium">No new enrollment requests.</p>
          </div>
        )}
      </section>

      {/* Active Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Approved Students</h2>
        <div className="overflow-hidden rounded-2xl bg-white/80 shadow-xl backdrop-blur">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50">
                <tr className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Approved Date</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {active.map(e => (
                  <tr key={e.id} className="text-sm transition-colors hover:bg-white/50">
                    <td className="px-6 py-4 font-medium text-gray-800">{e.student_name}</td>
                    <td className="px-6 py-4 text-gray-600">{e.course_title}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(e.enrolled_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-center">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-rose-500 hover:bg-rose-50"
                        onClick={() => handleAction(e.id, "rejected")}
                        disabled={!!actionLoading}
                      >
                        Revoke Access
                      </Button>
                    </td>
                  </tr>
                ))}
                {active.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      No approved students yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
