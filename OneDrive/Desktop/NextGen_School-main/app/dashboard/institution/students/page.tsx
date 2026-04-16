"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Users, Search, Trophy, BookOpen, Loader2, GraduationCap, TrendingUp } from "lucide-react"

interface Student {
  id: string; name: string; email: string; created_at: string
  courses_enrolled: number; certificates: number; avg_progress: number
}

export default function InstitutionStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetch("/api/institution/students")
      .then(r => r.ok ? r.json() : [])
      .then(setStudents)
      .finally(() => setLoading(false))
  }, [])

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
    </div>
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800">Students</h1>
          <p className="text-gray-500">All students registered under your institution</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-64" />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Students", value: students.length, icon: Users, color: "from-amber-500 to-orange-500" },
          { label: "Avg Progress", value: `${Math.round(students.reduce((s, u) => s + Number(u.avg_progress), 0) / (students.length || 1))}%`, icon: TrendingUp, color: "from-violet-500 to-purple-500" },
          { label: "Certificates", value: students.reduce((s, u) => s + Number(u.certificates), 0), icon: Trophy, color: "from-emerald-500 to-teal-500" },
        ].map(stat => (
          <div key={stat.label} className={`rounded-2xl bg-gradient-to-br ${stat.color} p-5 text-white shadow-lg`}>
            <stat.icon className="mb-2 h-6 w-6 opacity-80" />
            <p className="text-3xl font-extrabold">{stat.value}</p>
            <p className="text-sm opacity-80">{stat.label}</p>
          </div>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((student, index) => (
            <motion.div key={student.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <Card className="border-0 bg-white/80 shadow-xl backdrop-blur">
                <CardContent className="p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 font-bold text-lg text-white shadow-md">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-gray-800">{student.name}</p>
                      <p className="truncate text-sm text-gray-500">{student.email}</p>
                    </div>
                  </div>

                  <div className="mb-3 flex gap-3">
                    <div className="flex-1 rounded-xl bg-violet-50 p-3 text-center">
                      <p className="text-xl font-extrabold text-violet-600">{student.courses_enrolled}</p>
                      <p className="text-xs text-gray-500">Courses</p>
                    </div>
                    <div className="flex-1 rounded-xl bg-emerald-50 p-3 text-center">
                      <p className="text-xl font-extrabold text-emerald-600">{student.certificates}</p>
                      <p className="text-xs text-gray-500">Certs</p>
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-gray-500">Avg Progress</span>
                      <span className="font-semibold text-amber-600">{Math.round(Number(student.avg_progress))}%</span>
                    </div>
                    <Progress value={Math.round(Number(student.avg_progress))} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-100">
            <GraduationCap className="h-12 w-12 text-amber-500" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-gray-800">No students yet</h3>
          <p className="text-gray-500">Students linked to your institution will appear here</p>
        </div>
      )}
    </div>
  )
}
