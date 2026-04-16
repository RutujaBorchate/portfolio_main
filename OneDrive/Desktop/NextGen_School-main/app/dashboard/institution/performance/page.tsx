"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { TrendingUp, Trophy, BookOpen, Users, Loader2 } from "lucide-react"

interface ReportRow {
  student_name: string; student_email: string; course_title: string
  progress: number; enrollment_status: string; enrolled_at: string; certificate_earned: string
}

export default function InstitutionPerformancePage() {
  const [data, setData] = useState<ReportRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/institution/reports")
      .then(r => r.ok ? r.json() : [])
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  // Aggregate by student
  const studentMap = new Map<string, { name: string; email: string; courses: number; avgProgress: number; certs: number }>()
  for (const row of data) {
    const key = row.student_email
    const existing = studentMap.get(key)
    if (existing) {
      existing.courses++
      existing.avgProgress = (existing.avgProgress * (existing.courses - 1) + row.progress) / existing.courses
      if (row.certificate_earned === "Yes") existing.certs++
    } else {
      studentMap.set(key, {
        name: row.student_name, email: row.student_email,
        courses: 1, avgProgress: row.progress,
        certs: row.certificate_earned === "Yes" ? 1 : 0,
      })
    }
  }
  const students = Array.from(studentMap.values())

  // Course progress chart data
  const courseMap = new Map<string, number[]>()
  for (const row of data) {
    const arr = courseMap.get(row.course_title) || []
    arr.push(row.progress)
    courseMap.set(row.course_title, arr)
  }
  const chartData = Array.from(courseMap.entries()).map(([name, progresses]) => ({
    name: name.length > 20 ? name.slice(0, 20) + "…" : name,
    avgProgress: Math.round(progresses.reduce((a, b) => a + b, 0) / progresses.length),
    students: progresses.length,
  }))

  const overallAvg = students.length
    ? Math.round(students.reduce((s, u) => s + u.avgProgress, 0) / students.length)
    : 0

  const COLORS = ["#8b5cf6", "#06b6d4", "#f59e0b", "#10b981", "#f43f5e"]

  if (loading) return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-cyan-500" />
    </div>
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-800">Performance Analytics</h1>
        <p className="text-gray-500">Track your institution's overall learning performance</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Students", value: students.length, icon: Users, color: "from-amber-500 to-orange-500" },
          { label: "Enrollments", value: data.length, icon: BookOpen, color: "from-violet-500 to-purple-500" },
          { label: "Avg Progress", value: `${overallAvg}%`, icon: TrendingUp, color: "from-cyan-500 to-blue-500" },
          { label: "Certificates", value: data.filter(d => d.certificate_earned === "Yes").length, icon: Trophy, color: "from-emerald-500 to-teal-500" },
        ].map(stat => (
          <div key={stat.label} className={`rounded-2xl bg-gradient-to-br ${stat.color} p-5 text-white shadow-lg`}>
            <stat.icon className="mb-2 h-6 w-6 opacity-80" />
            <p className="text-3xl font-extrabold">{stat.value}</p>
            <p className="text-sm opacity-80">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-0 bg-white/80 shadow-xl backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-800">Average Progress by Course</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
                  <Tooltip formatter={(v: number) => [`${v}%`, "Avg Progress"]} />
                  <Bar dataKey="avgProgress" radius={[6, 6, 0, 0]}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Student Progress Table */}
      {students.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-0 bg-white/80 shadow-xl backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-800">Student Progress</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50/80">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Student</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Courses</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Avg Progress</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Certificates</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {students.sort((a, b) => b.avgProgress - a.avgProgress).map((s, i) => (
                      <tr key={s.email} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-800">{s.name}</p>
                          <p className="text-sm text-gray-500">{s.email}</p>
                        </td>
                        <td className="px-6 py-4 font-medium text-violet-600">{s.courses}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Progress value={s.avgProgress} className="h-2 w-24" />
                            <span className="text-sm font-semibold text-gray-700">{Math.round(s.avgProgress)}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {s.certs > 0
                            ? <span className="flex items-center gap-1 text-emerald-600 font-semibold"><Trophy className="h-4 w-4" />{s.certs}</span>
                            : <span className="text-gray-400">—</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-cyan-100 to-blue-100">
            <TrendingUp className="h-12 w-12 text-cyan-500" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-gray-800">No data yet</h3>
          <p className="text-gray-500">Performance data will appear once students enroll in courses</p>
        </div>
      )}
    </div>
  )
}
