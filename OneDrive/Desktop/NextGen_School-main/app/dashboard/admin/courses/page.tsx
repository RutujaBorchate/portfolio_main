"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink } from "@/components/ui/pagination"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { BookOpen, Search, CheckCircle, XCircle, Clock, Users, Loader2, Filter, Trash2, Eye, AlertCircle, PlusCircle } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface Course {
  id: string
  title: string
  description: string
  status: string
  teacher_name: string
  teacher_email: string
  enrolled_count: number
  created_at: string
}

const statusColors: Record<string, string> = {
  approved: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  rejected: "bg-rose-100 text-rose-700",
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const [page, setPage] = useState(1)
  const itemsPerPage = 6

  useEffect(() => { fetchCourses() }, [])

  async function fetchCourses() {
    try {
      const res = await fetch("/api/admin/all-courses")
      if (res.ok) {
        setCourses(await res.json())
      } else {
        setError("Failed to load courses.")
      }
    } catch (e) {
      setError("An error occurred while fetching courses.")
    } finally {
      setLoading(false)
    }
  }

  async function handleAction(courseId: string, action: "approve" | "reject") {
    setActionLoading(courseId + action)
    try {
      const res = await fetch(`/api/admin/${action}-course`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      })
      if (res.ok) {
        toast.success(`Course ${action}d successfully.`)
        fetchCourses()
      } else {
        toast.error(`Failed to ${action} course.`)
      }
    } catch (e) {
      toast.error("An error occurred.")
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDelete(courseId: string) {
    if (!confirm("Are you sure you want to delete this course permanently?")) return
    setActionLoading(courseId + "delete")
    try {
      const res = await fetch(`/api/admin/all-courses`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      })
      if (res.ok) {
        toast.success(`Course deleted successfully.`)
        fetchCourses()
      } else {
        toast.error(`Failed to delete course.`)
      }
    } catch (e) {
      toast.error("An error occurred.")
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = courses.filter(c => {
    const matchSearch =
      (c.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.teacher_name || "").toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "all" || c.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const paginatedCourses = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  const counts = {
    all: courses.length,
    approved: courses.filter(c => c.status === "approved").length,
    pending: courses.filter(c => c.status === "pending").length,
    rejected: courses.filter(c => c.status === "rejected").length,
  }

  if (loading) return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
    </div>
  )

  if (error) return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
      <AlertCircle className="h-12 w-12 text-rose-500" />
      <h2 className="text-xl font-bold text-gray-800">Something went wrong</h2>
      <p className="text-gray-500">{error}</p>
      <Button onClick={() => window.location.reload()} variant="outline">Try Again</Button>
    </div>
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800">All Courses</h1>
          <p className="text-gray-500">Review and manage all courses on the platform</p>
        </div>
        <Link href="/dashboard/admin/courses/create">
          <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
            <PlusCircle className="mr-2 h-4 w-4" /> Create Course
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total", value: counts.all, color: "from-emerald-500 to-teal-500" },
          { label: "Published", value: counts.approved, color: "from-cyan-500 to-blue-500" },
          { label: "Pending", value: counts.pending, color: "from-amber-500 to-orange-500" },
          { label: "Rejected", value: counts.rejected, color: "from-rose-500 to-pink-500" },
        ].map(stat => (
          <div key={stat.label} className={`rounded-2xl bg-gradient-to-br ${stat.color} p-5 text-white shadow-lg`}>
            <p className="text-3xl font-extrabold">{stat.value}</p>
            <p className="text-sm opacity-80">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by title or teacher..."
            value={search}
            onChange={e => {setSearch(e.target.value); setPage(1)}}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={v => {setStatusFilter(v); setPage(1)}}>
          <SelectTrigger className="w-44">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Published</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Course Grid */}
      {paginatedCourses.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="h-full border-0 bg-white/80 shadow-xl backdrop-blur flex flex-col relative group">
                <div className="absolute right-2 top-2 z-10 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="secondary" size="icon" className="h-8 w-8 shadow-md">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{course.title}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <p className="text-sm text-gray-600">{course.description}</p>
                        <div className="text-sm">
                          <strong>Teacher:</strong> {course.teacher_name} ({course.teacher_email})
                        </div>
                        <div className="text-sm">
                          <strong>Enrolled:</strong> {course.enrolled_count}
                        </div>
                        <div className="text-sm">
                          <strong>Status:</strong> {course.status}
                        </div>
                        <div className="text-sm">
                          <strong>Created:</strong> {new Date(course.created_at).toLocaleString()}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="destructive" size="icon" className="h-8 w-8 shadow-md" onClick={() => handleDelete(course.id)} disabled={!!actionLoading}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <CardContent className="flex flex-col flex-1 p-0">
                  {/* Header */}
                  <div className="relative h-32 overflow-hidden rounded-t-lg bg-gradient-to-br from-emerald-500 to-teal-500">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="h-14 w-14 text-white/20" />
                    </div>
                    <div className="absolute left-3 top-3">
                      <Badge className={statusColors[course.status]}>
                        {course.status === "approved" && <CheckCircle className="mr-1 h-3 w-3" />}
                        {course.status === "pending" && <Clock className="mr-1 h-3 w-3" />}
                        {course.status === "rejected" && <XCircle className="mr-1 h-3 w-3" />}
                        {course.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="mb-1 line-clamp-1 text-lg font-bold text-gray-800" title={course.title}>{course.title}</h3>
                    <p className="mb-1 text-sm font-medium text-emerald-600">by {course.teacher_name}</p>
                    <p className="mb-4 line-clamp-2 flex-1 text-sm text-gray-500" title={course.description}>{course.description || "No description"}</p>

                    <div className="mb-4 flex items-center gap-3 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {course.enrolled_count} enrolled
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(course.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Actions */}
                    {course.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500"
                          onClick={() => handleAction(course.id, "approve")}
                          disabled={!!actionLoading}
                        >
                          {actionLoading === course.id + "approve" ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <><CheckCircle className="mr-1 h-4 w-4" />Approve</>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50"
                          onClick={() => handleAction(course.id, "reject")}
                          disabled={!!actionLoading}
                        >
                          {actionLoading === course.id + "reject" ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <><XCircle className="mr-1 h-4 w-4" />Reject</>
                          )}
                        </Button>
                      </div>
                    )}
                    {course.status === "approved" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full border-rose-200 text-rose-600 hover:bg-rose-50"
                        onClick={() => handleAction(course.id, "reject")}
                        disabled={!!actionLoading}
                      >
                         {actionLoading === course.id + "reject" ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <XCircle className="mr-1 h-4 w-4" />
                          )}
                         Unpublish
                      </Button>
                    )}
                    {course.status === "rejected" && (
                      <Button
                        size="sm"
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500"
                        onClick={() => handleAction(course.id, "approve")}
                        disabled={!!actionLoading}
                      >
                         {actionLoading === course.id + "approve" ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <CheckCircle className="mr-1 h-4 w-4" />
                          )}
                         Re-approve
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-teal-100">
            <BookOpen className="h-12 w-12 text-emerald-500" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-gray-800">No courses found</h3>
          <p className="text-gray-500">Courses will appear here once teachers submit them</p>
        </div>
      )}

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                className="cursor-pointer" 
                onClick={(e) => { e.preventDefault(); setPage(p => Math.max(1, p - 1)) }}
              />
            </PaginationItem>
            
            {[...Array(totalPages)].map((_, idx) => (
              <PaginationItem key={idx}>
                 <PaginationLink href="#" isActive={page === idx + 1} onClick={(e) => { e.preventDefault(); setPage(idx + 1) }}>
                   {idx + 1}
                 </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext 
                className="cursor-pointer" 
                onClick={(e) => { e.preventDefault(); setPage(p => Math.min(totalPages, p + 1)) }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
