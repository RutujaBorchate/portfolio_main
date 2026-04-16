"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, FileText, CheckSquare, PlusCircle, Star, Rocket, TrendingUp, Award } from "lucide-react"

interface DashboardData {
  totalCourses: number
  totalStudents: number
  totalQuizzes: number
  totalAssignments: number
  pendingEnrollments: number
  pendingSubmissions: number
  recentCourses: Array<{
    id: string
    title: string
    enrolled_count: number
    status: string
  }>
}

export default function TeacherDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/teacher/dashboard")
        if (res.ok) {
          const json = await res.json()
          console.log("DEBUG: Teacher Dashboard Data Received:", json);
          setData(json)
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const stats = [
    {
      label: "Enrollment Approvals",
      value: data?.pendingEnrollments || 0,
      icon: Users,
      gradient: "from-emerald-500 to-teal-500",
      link: "/dashboard/teacher/enrollments",
    },
    {
      label: "My Courses",
      value: data?.totalCourses || 0,
      icon: BookOpen,
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      label: "Total Students",
      value: data?.totalStudents || 0,
      icon: Star,
      gradient: "from-violet-500 to-purple-500",
    },
    {
      label: "Quizzes Created",
      value: data?.totalQuizzes || 0,
      icon: CheckSquare,
      gradient: "from-amber-500 to-orange-500",
    },
    {
      label: "Pending Reviews",
      value: data?.pendingSubmissions || 0,
      icon: FileText,
      gradient: "from-rose-500 to-pink-500",
    },
  ]

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Rocket className="h-12 w-12 text-cyan-500" />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 p-8 text-white shadow-2xl"
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-extrabold">Teacher Dashboard</h1>
            <p className="text-white/90">Create amazing courses and inspire your students!</p>
          </div>
          <Link href="/dashboard/teacher/courses/new">
            <Button size="lg" className="gap-2 bg-white font-bold text-cyan-600 hover:bg-white/90">
              <PlusCircle className="h-5 w-5" />
              Create New Course
            </Button>
          </Link>
        </div>

        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute right-20 top-4"
        >
          <Star className="h-6 w-6 fill-amber-300 text-amber-300" />
        </motion.div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {stat.link ? (
              <Link href={stat.link}>
                <Card className="h-full border-0 bg-white/80 shadow-xl backdrop-blur transition-all hover:scale-105 hover:shadow-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.gradient}`}>
                        <stat.icon className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-extrabold text-gray-800">{stat.value}</p>
                        <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ) : (
              <Card className="h-full border-0 bg-white/80 shadow-xl backdrop-blur transition-all hover:scale-105 hover:shadow-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.gradient}`}>
                      <stat.icon className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-extrabold text-gray-800">{stat.value}</p>
                      <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        ))}
      </div>

      {/* Recent Courses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-0 bg-white/80 shadow-xl backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-800">
              <BookOpen className="h-5 w-5 text-cyan-500" />
              My Courses
            </CardTitle>
            <Link href="/dashboard/teacher/courses">
              <Button variant="ghost" className="text-cyan-600 hover:text-cyan-700">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {data?.recentCourses && data.recentCourses.length > 0 ? (
              <div className="space-y-4">
                {data.recentCourses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link href={`/teacher/courses/${course.id}`}>
                      <div className="group flex items-center justify-between rounded-xl bg-gradient-to-r from-gray-50 to-cyan-50 p-4 transition-all hover:shadow-md">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500">
                            <BookOpen className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 group-hover:text-cyan-600">
                              {course.title}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {course.enrolled_count} students enrolled
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {course.status === "approved" ? (
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-600">
                              Published
                            </span>
                          ) : course.status === "pending" ? (
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-600">
                              Pending
                            </span>
                          ) : (
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                              Draft
                            </span>
                          )}
                          <TrendingUp className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cyan-100 to-blue-100">
                  <BookOpen className="h-10 w-10 text-cyan-500" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-800">No courses yet!</h3>
                <p className="mb-4 text-gray-500">Create your first course and start teaching</p>
                <Link href="/dashboard/teacher/courses/new">
                  <Button className="bg-gradient-to-r from-cyan-500 to-blue-500">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Course
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Link href="/dashboard/teacher/quizzes">
            <Card className="group cursor-pointer border-0 bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                  <CheckSquare className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-bold">Manage Quizzes</h3>
                  <p className="text-sm text-white/80">Create and edit quizzes</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Link href="/dashboard/teacher/assignments">
            <Card className="group cursor-pointer border-0 bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                  <FileText className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-bold">Grade Assignments</h3>
                  <p className="text-sm text-white/80">Review student work</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Link href="/dashboard/teacher/enrollments">
            <Card className="group cursor-pointer border-0 bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                  <Users className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-bold">Student Enrollments</h3>
                  <p className="text-sm text-white/80">Manage your students</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
