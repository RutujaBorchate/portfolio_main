"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, BookOpen, GraduationCap, Building2, UserCheck, TrendingUp, AlertCircle, Rocket, Shield, BarChart3 } from "lucide-react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts"

interface DashboardData {
  totalUsers: number
  totalStudents: number
  totalTeachers: number
  totalInstitutions: number
  totalCourses: number
  pendingApprovals: number
  pendingTeachers: number
  pendingCourses: number
  recentUsers: Array<{
    id: string
    name: string
    email: string
    role: string
    is_approved: boolean
    created_at: string
  }>
  userGrowth: Array<{ date: string; count: number }>
  courseTrends: Array<{ date: string; count: number }>
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/dashboard")
        if (res.ok) {
          const json = await res.json()
          setData(json)
        } else {
          setError("Failed to load dashboard data.")
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
        setError("Error connecting to server.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const stats = [
    {
      label: "Total Users",
      value: data?.totalUsers || 0,
      icon: Users,
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      label: "Students",
      value: data?.totalStudents || 0,
      icon: GraduationCap,
      gradient: "from-violet-500 to-purple-500",
    },
    {
      label: "Teachers",
      value: data?.totalTeachers || 0,
      icon: BookOpen,
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      label: "Courses",
      value: data?.totalCourses || 0,
      icon: BookOpen,
      gradient: "from-amber-500 to-orange-500",
    },
  ]

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-32 w-full rounded-3xl" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
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
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-8 text-white shadow-2xl"
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
              <Shield className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold">Admin Dashboard</h1>
              <p className="text-white/90">Manage your platform and users</p>
            </div>
          </div>
          {(data?.pendingApprovals || 0) > 0 && (
            <Link href="/dashboard/admin/approvals">
              <Button size="lg" className="gap-2 bg-white font-bold text-emerald-600 hover:bg-white/90">
                <AlertCircle className="h-5 w-5" />
                {data?.pendingApprovals} Pending Approvals
              </Button>
            </Link>
          )}
        </div>
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

      {/* Analytics Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-0 bg-white/80 shadow-xl backdrop-blur h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-500" /> User Growth
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.userGrowth || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={3} dot={{ strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-0 bg-white/80 shadow-xl backdrop-blur h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-cyan-500" /> Course Creation Trends
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.courseTrends || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }} />
                  <Bar dataKey="count" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Pending Approvals Alert */}
      {((data?.pendingTeachers || 0) > 0 || (data?.pendingCourses || 0) > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50 to-orange-50 shadow-xl">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20">
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Pending Approvals</h3>
                  <p className="text-sm text-gray-600">
                    {data?.pendingTeachers || 0} teachers and {data?.pendingCourses || 0} courses waiting for approval
                  </p>
                </div>
              </div>
              <Link href="/dashboard/admin/approvals">
                <Button className="bg-amber-500 hover:bg-amber-600">
                  <UserCheck className="mr-2 h-4 w-4" />
                  Review Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recent Users & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="h-full border-0 bg-white/80 shadow-xl backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-800">
                <Users className="h-5 w-5 text-emerald-500" />
                Recent Users
              </CardTitle>
              <Link href="/dashboard/admin/users">
                <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {data?.recentUsers && data.recentUsers.length > 0 ? (
                <div className="space-y-3">
                  {data.recentUsers.map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between rounded-xl bg-gradient-to-r from-gray-50 to-emerald-50 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 font-bold text-white">
                          {user.name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold capitalize ${
                          user.role === "admin" ? "bg-emerald-100 text-emerald-600" :
                          user.role === "teacher" ? "bg-cyan-100 text-cyan-600" :
                          user.role === "institution" ? "bg-amber-100 text-amber-600" :
                          "bg-violet-100 text-violet-600"
                        }`}>
                          {user.role}
                        </span>
                        {!user.is_approved && (
                          <span className="rounded-full bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-600">
                            Pending
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">No users yet</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <h3 className="text-xl font-bold text-gray-800">Quick Actions</h3>
          <div className="grid gap-4">
            <Link href="/dashboard/admin/users">
              <Card className="group cursor-pointer border-0 bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold">Manage Users</h3>
                    <p className="text-sm text-white/80">View and manage all users</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard/admin/approvals">
              <Card className="group cursor-pointer border-0 bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                    <UserCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold">Pending Approvals</h3>
                    <p className="text-sm text-white/80">Review teachers and courses</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard/admin/analytics">
              <Card className="group cursor-pointer border-0 bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold">Analytics</h3>
                    <p className="text-sm text-white/80">View platform statistics</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard/admin/courses">
              <Card className="group cursor-pointer border-0 bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-xl transition-all hover:scale-[1.02] hover:shadow-2xl">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold">Manage Courses</h3>
                    <p className="text-sm text-white/80">View all platform courses</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
