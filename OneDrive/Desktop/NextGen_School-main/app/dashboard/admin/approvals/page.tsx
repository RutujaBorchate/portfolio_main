"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserCheck, BookOpen, CheckCircle, XCircle, Rocket, Clock, GraduationCap, Building2, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface PendingTeacher {
  id: string
  name: string
  email: string
  role: string
  created_at: string
}

interface PendingCourse {
  id: string
  title: string
  description: string
  teacher_name: string
  teacher_email: string
  created_at: string
}

export default function ApprovalsPage() {
  const [pendingTeachers, setPendingTeachers] = useState<PendingTeacher[]>([])
  const [pendingCourses, setPendingCourses] = useState<PendingCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchPending()
  }, [])

  async function fetchPending() {
    try {
      const [teachersRes, coursesRes] = await Promise.all([
        fetch("/api/admin/pending-teachers"),
        fetch("/api/admin/pending-courses"),
      ])

      if (teachersRes.ok && coursesRes.ok) {
        setPendingTeachers(await teachersRes.json())
        setPendingCourses(await coursesRes.json())
      } else {
        setError("Failed to fetch pending approvals.")
      }
    } catch (error) {
      console.error("Failed to fetch pending:", error)
      setError("An error occurred while fetching.")
    } finally {
      setLoading(false)
    }
  }

  async function handleApproveUser(userId: string, role: string) {
    setActionLoading(userId)
    const endpoint = role === 'institution' ? `/api/admin/institute/${userId}` : `/api/admin/teacher/${userId}`
    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      })
      if (res.ok) {
        toast.success(`${role === 'institution' ? 'Institute' : 'Teacher'} approved successfully.`)
        fetchPending()
      } else {
        toast.error(`Failed to approve ${role === 'institution' ? 'institute' : 'teacher'}.`)
      }
    } catch (error) {
      console.error("Failed to approve user:", error)
      toast.error("An error occurred.")
    } finally {
      setActionLoading(null)
    }
  }

  async function handleRejectUser(userId: string, role: string) {
    setActionLoading(userId)
    const endpoint = role === 'institution' ? `/api/admin/institute/${userId}` : `/api/admin/teacher/${userId}`
    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      })
      if (res.ok) {
        toast.success(`${role === 'institution' ? 'Institute' : 'Teacher'} rejected successfully.`)
        fetchPending()
      } else {
        toast.error(`Failed to reject ${role === 'institution' ? 'institute' : 'teacher'}.`)
      }
    } catch (error) {
      console.error("Failed to reject user:", error)
      toast.error("An error occurred.")
    } finally {
      setActionLoading(null)
    }
  }

  async function handleApproveCourse(courseId: string) {
    setActionLoading(courseId)
    try {
      const res = await fetch(`/api/admin/course/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      })
      if (res.ok) {
        toast.success("Course approved successfully.")
        fetchPending()
      } else {
        toast.error("Failed to approve course.")
      }
    } catch (error) {
      console.error("Failed to approve course:", error)
      toast.error("An error occurred.")
    } finally {
      setActionLoading(null)
    }
  }

  async function handleRejectCourse(courseId: string) {
    setActionLoading(courseId)
    try {
      const res = await fetch(`/api/admin/course/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      })
      if (res.ok) {
        toast.success("Course rejected successfully.")
        fetchPending()
      } else {
        toast.error("Failed to reject course.")
      }
    } catch (error) {
      console.error("Failed to reject course:", error)
      toast.error("An error occurred.")
    } finally {
      setActionLoading(null)
    }
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

  if (error) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
        <AlertCircle className="h-12 w-12 text-rose-500" />
        <h2 className="text-xl font-bold text-gray-800">Something went wrong</h2>
        <p className="text-gray-500">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">Try Again</Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-800">Pending Approvals</h1>
        <p className="text-gray-500">Review and approve teachers and courses</p>
      </div>

      <Tabs defaultValue="teachers" className="space-y-6">
        <TabsList className="bg-white/80 p-1">
          <TabsTrigger value="teachers" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white">
            Teachers ({pendingTeachers.length})
          </TabsTrigger>
          <TabsTrigger value="courses" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white">
            Courses ({pendingCourses.length})
          </TabsTrigger>
        </TabsList>

        {/* Pending Teachers */}
        <TabsContent value="teachers">
          {pendingTeachers.length > 0 ? (
            <div className="grid gap-4">
              {pendingTeachers.map((teacher, index) => (
                <motion.div
                  key={teacher.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-0 bg-white/80 shadow-xl backdrop-blur">
                    <CardContent className="flex items-center justify-between p-6">
                      <div className="flex items-center gap-4">
                        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${
                          teacher.role === "institution" ? "from-amber-500 to-orange-500" : "from-cyan-500 to-blue-500"
                        }`}>
                          {teacher.role === "institution" ? (
                            <Building2 className="h-7 w-7 text-white" />
                          ) : (
                            <GraduationCap className="h-7 w-7 text-white" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">{teacher.name}</h3>
                          <p className="text-sm text-gray-500">{teacher.email}</p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                              teacher.role === "institution" ? "bg-amber-100 text-amber-600" : "bg-cyan-100 text-cyan-600"
                            }`}>
                              {teacher.role}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <Clock className="h-3 w-3" />
                              {new Date(teacher.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApproveUser(teacher.id, teacher.role)}
                          disabled={actionLoading === teacher.id}
                          className="bg-emerald-500 hover:bg-emerald-600"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleRejectUser(teacher.id, teacher.role)}
                          disabled={actionLoading === teacher.id}
                          variant="outline"
                          className="border-rose-300 text-rose-600 hover:bg-rose-50"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-teal-100">
                <CheckCircle className="h-10 w-10 text-emerald-500" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-800">All caught up!</h3>
              <p className="text-gray-500">No pending teacher approvals</p>
            </div>
          )}
        </TabsContent>

        {/* Pending Courses */}
        <TabsContent value="courses">
          {pendingCourses.length > 0 ? (
            <div className="grid gap-4">
              {pendingCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-0 bg-white/80 shadow-xl backdrop-blur">
                    <CardContent className="flex items-center justify-between p-6">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500">
                          <BookOpen className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">{course.title}</h3>
                          <p className="text-sm text-gray-500 line-clamp-1">{course.description}</p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              by {course.teacher_name}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <Clock className="h-3 w-3" />
                              {new Date(course.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApproveCourse(course.id)}
                          disabled={actionLoading === course.id}
                          className="bg-emerald-500 hover:bg-emerald-600"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleRejectCourse(course.id)}
                          disabled={actionLoading === course.id}
                          variant="outline"
                          className="border-rose-300 text-rose-600 hover:bg-rose-50"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-teal-100">
                <CheckCircle className="h-10 w-10 text-emerald-500" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-800">All caught up!</h3>
              <p className="text-gray-500">No pending course approvals</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
