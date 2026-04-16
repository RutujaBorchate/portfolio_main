"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from "recharts"
import { Users, BookOpen, UserCheck, CheckCircle, TrendingUp, BarChart3, AlertCircle } from "lucide-react"

const COLORS = ["#8b5cf6", "#ec4899", "#06b6d4", "#f59e0b", "#10b981"]

interface AnalyticsData {
  totalUsers: number
  totalStudents: number
  totalTeachers: number
  totalCourses: number
  totalEnrollments: number
  totalCompletions: number
  userGrowth: any[]
  courseTrends: any[]
  roleDistribution: any[]
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/dashboard")
        if (res.ok) {
          setData(await res.json())
        } else {
          setError("Failed to fetch analytics data.")
        }
      } catch (e) {
        setError("An error occurred while loading analytics.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-[400px] rounded-2xl" />
          <Skeleton className="h-[400px] rounded-2xl" />
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
      </div>
    )
  }

  const stats = [
    { label: "Total Users", value: data?.totalUsers, icon: Users, color: "text-violet-500", bg: "bg-violet-100" },
    { label: "Total Courses", value: data?.totalCourses, icon: BookOpen, color: "text-pink-500", bg: "bg-pink-100" },
    { label: "Total Enrollments", value: data?.totalEnrollments, icon: UserCheck, color: "text-cyan-500", bg: "bg-cyan-100" },
    { label: "Completions", value: data?.totalCompletions, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-100" },
  ]

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-800">Analytics Insights</h1>
        <p className="text-gray-500">Overview of platform growth and user engagement</p>
      </div>

      {/* Numerical Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-0 bg-white/80 shadow-xl backdrop-blur">
              <CardContent className="p-6">
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <p className="text-3xl font-black text-gray-800">{stat.value}</p>
                <p className="text-sm font-semibold text-gray-500">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Growth Line Chart */}
        <Card className="border-0 bg-white/80 shadow-xl backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-violet-500" />
              User Growth (Last 6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#8b5cf6" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Course Creation Bar Chart */}
        <Card className="border-0 bg-white/80 shadow-xl backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-pink-500" />
              Course Creation Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.courseTrends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#ec4899" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Roles Pie Chart */}
        <Card className="border-0 bg-white/80 shadow-xl backdrop-blur flex flex-col items-center">
          <CardHeader className="w-full">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-cyan-500" />
              User Roles Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.roleDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data?.roleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Actionable Insights */}
        <Card className="border-0 bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Quick Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-md">
              <p className="text-sm font-medium opacity-80 uppercase tracking-wider">Completion Rate</p>
              <p className="text-3xl font-black">
                {data && data.totalEnrollments > 0 
                  ? Math.round((data.totalCompletions / data.totalEnrollments) * 100) 
                  : 0}%
              </p>
              <p className="mt-1 text-xs opacity-70">Total certificates issued relative to course enrollments.</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-md">
              <p className="text-sm font-medium opacity-80 uppercase tracking-wider">Teacher Ratio</p>
              <p className="text-3xl font-black">
                1:{data && data.totalTeachers > 0 ? Math.round(data.totalStudents / data.totalTeachers) : 0}
              </p>
              <p className="mt-1 text-xs opacity-70">Average number of students per registered teacher.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
