"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Trophy, CheckSquare, FileText, Play, Star, Rocket, Clock, Award } from "lucide-react"

interface DashboardData {
  enrolledCourses: number
  totalCourses: number
  completedCourses: number
  totalQuizzes: number
  completedQuizzes: number
  totalAssignments: number
  completedAssignments: number
  certificates: number
  recentCourses: Array<{
    id: string
    title: string
    progress: number
    thumbnail?: string
  }>
}

export default function StudentDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/student/dashboard")
        if (res.ok) {
          const json = await res.json()
          console.log("DEBUG: Dashboard Data Received:", json);
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
      label: "Courses Enrolled",
      value: `${data?.enrolledCourses || 0} / ${data?.totalCourses || 0}`,
      icon: BookOpen,
      gradient: "from-violet-500 to-purple-500",
      bgGradient: "from-violet-100 to-purple-100",
    },
    {
      label: "Quizzes Completed",
      value: `${data?.completedQuizzes || 0}/${data?.totalQuizzes || 0}`,
      icon: CheckSquare,
      gradient: "from-cyan-500 to-blue-500",
      bgGradient: "from-cyan-100 to-blue-100",
    },
    {
      label: "Assignments Done",
      value: `${data?.completedAssignments || 0}/${data?.totalAssignments || 0}`,
      icon: FileText,
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-100 to-orange-100",
    },
    {
      label: "Certificates Earned",
      value: data?.certificates || 0,
      icon: Trophy,
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-100 to-teal-100",
    },
  ]

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Rocket className="h-12 w-12 text-violet-500" />
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
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-500 via-pink-500 to-rose-500 p-8 text-white shadow-2xl"
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-extrabold">Ready to Learn Something New?</h1>
            <p className="text-white/90">Continue your learning adventure and earn amazing rewards!</p>
          </div>
          <Link href="/dashboard/student/courses">
            <Button size="lg" className="gap-2 bg-white font-bold text-violet-600 hover:bg-white/90">
              <Play className="h-5 w-5" />
              Browse Courses
            </Button>
          </Link>
        </div>

        {/* Floating Stars */}
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute right-20 top-4"
        >
          <Star className="h-6 w-6 fill-amber-300 text-amber-300" />
        </motion.div>
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
          className="absolute right-40 bottom-4"
        >
          <Star className="h-4 w-4 fill-cyan-300 text-cyan-300" />
        </motion.div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-0 bg-white/80 shadow-xl backdrop-blur transition-all hover:scale-105 hover:shadow-2xl">
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
              <BookOpen className="h-5 w-5 text-violet-500" />
              Continue Learning
            </CardTitle>
            <Link href="/dashboard/student/courses">
              <Button variant="ghost" className="text-violet-600 hover:text-violet-700">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {data?.recentCourses && data.recentCourses.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.recentCourses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link href={`/student/courses/${course.id}`}>
                      <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-100 to-pink-100 p-1 transition-all hover:shadow-lg">
                        <div className="rounded-xl bg-white p-4">
                          <div className="mb-4 flex h-24 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/10 to-pink-500/10">
                            <BookOpen className="h-10 w-10 text-violet-500 transition-transform group-hover:scale-110" />
                          </div>
                          <h3 className="mb-2 truncate font-bold text-gray-800">{course.title}</h3>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Progress</span>
                              <span className="font-semibold text-violet-600">{course.progress}%</span>
                            </div>
                            <Progress value={course.progress} className="h-2" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-pink-100">
                  <Rocket className="h-10 w-10 text-violet-500" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-800">No courses yet!</h3>
                <p className="mb-4 text-gray-500">Start your learning journey today</p>
                <Link href="/dashboard/student/courses">
                  <Button className="bg-gradient-to-r from-violet-500 to-pink-500">
                    Browse Courses
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
          <Link href="/dashboard/student/quizzes">
            <Card className="group cursor-pointer border-0 bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                  <CheckSquare className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-bold">Take a Quiz</h3>
                  <p className="text-sm text-white/80">Test your knowledge</p>
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
          <Link href="/dashboard/student/assignments">
            <Card className="group cursor-pointer border-0 bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                  <FileText className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-bold">Assignments</h3>
                  <p className="text-sm text-white/80">Complete your tasks</p>
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
          <Link href="/dashboard/student/certificates">
            <Card className="group cursor-pointer border-0 bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                  <Award className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-bold">My Certificates</h3>
                  <p className="text-sm text-white/80">View your achievements</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
