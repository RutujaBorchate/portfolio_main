"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, BookOpen, GraduationCap, Shield, AlertCircle, BarChart3, TrendingUp, UserCheck } from "lucide-react"
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
      <div className="space-y-8 p-8">
        <Skeleton className="h-32 w-full rounded-3xl" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 text-white shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full -mr-20 -mt-20" />
        
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/20">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Admin Command Center</h1>
              <p className="text-slate-400">Strategic overview of the NextGen platform</p>
            </div>
          </div>
          <div className="flex gap-3">
             <Link href="/dashboard/admin/users">
               <Button className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold">
                 Manage Users
               </Button>
             </Link>
             <Link href="/dashboard/admin/approvals">
               <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20">
                 System Approvals
               </Button>
             </Link>
          </div>
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
            <Card className="border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} shadow-sm`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Growth Chart */}
        <Card className="lg:col-span-2 border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <TrendingUp className="h-5 w-5 text-blue-500" /> Platform Growth
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.userGrowth || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip />
                <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Actions & Pending */}
        <div className="space-y-6">
          <Card className="border-slate-200 bg-white">
            <CardHeader>
               <CardTitle className="text-slate-800 text-lg">System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <div className="flex items-center gap-3">
                     <UserCheck className="h-5 w-5 text-amber-600" />
                     <span className="text-sm font-semibold text-amber-900">Pending Teachers</span>
                  </div>
                  <span className="bg-amber-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                     {data?.pendingTeachers || 0}
                  </span>
               </div>
               <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-3">
                     <BookOpen className="h-5 w-5 text-blue-600" />
                     <span className="text-sm font-semibold text-blue-900">Pending Courses</span>
                  </div>
                  <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                     {data?.pendingCourses || 0}
                  </span>
               </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
             <CardHeader>
                <CardTitle className="text-slate-800 text-lg font-bold">Recent Activity</CardTitle>
             </CardHeader>
             <CardContent>
                <div className="space-y-4">
                   {data?.recentUsers?.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center gap-3">
                         <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs uppercase">
                            {user.name[0]}
                         </div>
                         <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                            <p className="text-[10px] text-slate-500 uppercase font-medium">{user.role}</p>
                         </div>
                      </div>
                   ))}
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
