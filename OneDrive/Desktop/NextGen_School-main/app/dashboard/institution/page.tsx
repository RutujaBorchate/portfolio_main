"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, BookOpen, Trophy, BarChart3, Building2, TrendingUp, Rocket, Star, GraduationCap } from "lucide-react"

interface DashboardData {
  totalStudents: number
  totalEnrollments: number
  averageProgress: number
  certificatesEarned: number
  topStudents: Array<{
    id: string
    name: string
    email: string
    courses_enrolled: number
    certificates: number
  }>
}

export default function InstitutionDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/institution/dashboard")
        if (res.ok) {
          const json = await res.json()
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
      label: "Total Students",
      value: data?.totalStudents || 0,
      icon: Users,
      gradient: "from-amber-500 to-orange-500",
    },
    {
      label: "Course Enrollments",
      value: data?.totalEnrollments || 0,
      icon: BookOpen,
      gradient: "from-violet-500 to-purple-500",
    },
    {
      label: "Avg. Progress",
      value: `${data?.averageProgress || 0}%`,
      icon: TrendingUp,
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      label: "Certificates",
      value: data?.certificatesEarned || 0,
      icon: Trophy,
      gradient: "from-emerald-500 to-teal-500",
    },
  ]

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

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-8 text-white shadow-2xl"
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
              <Building2 className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold">Institution Dashboard</h1>
              <p className="text-white/90">Monitor your students progress and achievements</p>
            </div>
          </div>
          <Link href="/dashboard/institution/students">
            <Button size="lg" className="gap-2 bg-white font-bold text-amber-600 hover:bg-white/90">
              <Users className="h-5 w-5" />
              Manage Students
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

      {/* Top Students */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-0 bg-white/80 shadow-xl backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-800">
              <Trophy className="h-5 w-5 text-amber-500" />
              Top Performing Students
            </CardTitle>
            <Link href="/dashboard/institution/students">
              <Button variant="ghost" className="text-amber-600 hover:text-amber-700">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {data?.topStudents && data.topStudents.length > 0 ? (
              <div className="space-y-3">
                {data.topStudents.map((student, index) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-white ${
                        index === 0 ? "bg-gradient-to-br from-amber-400 to-yellow-500" :
                        index === 1 ? "bg-gradient-to-br from-gray-400 to-gray-500" :
                        index === 2 ? "bg-gradient-to-br from-amber-600 to-amber-700" :
                        "bg-gradient-to-br from-violet-500 to-purple-500"
                      }`}>
                        {index < 3 ? (
                          <Trophy className="h-5 w-5" />
                        ) : (
                          student.name?.[0]?.toUpperCase() || "S"
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <p className="font-bold text-violet-600">{student.courses_enrolled}</p>
                        <p className="text-xs text-gray-500">Courses</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-amber-600">{student.certificates}</p>
                        <p className="text-xs text-gray-500">Certificates</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-100">
                  <GraduationCap className="h-10 w-10 text-amber-500" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-800">No students yet</h3>
                <p className="text-gray-500">Students will appear here once they register</p>
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
          <Link href="/dashboard/institution/students">
            <Card className="group cursor-pointer border-0 bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                  <Users className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-bold">Student Management</h3>
                  <p className="text-sm text-white/80">View and manage students</p>
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
          <Link href="/dashboard/institution/performance">
            <Card className="group cursor-pointer border-0 bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                  <BarChart3 className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-bold">Performance Analytics</h3>
                  <p className="text-sm text-white/80">Track student progress</p>
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
          <Link href="/dashboard/institution/reports">
            <Card className="group cursor-pointer border-0 bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                  <Trophy className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-bold">Reports & Exports</h3>
                  <p className="text-sm text-white/80">Download CSV/Excel reports</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
