"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Loader2, Table2 } from "lucide-react"

interface ReportRow {
  student_name: string; student_email: string; course_title: string
  progress: number; enrollment_status: string; enrolled_at: string; certificate_earned: string
}

export default function InstitutionReportsPage() {
  const [data, setData] = useState<ReportRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/institution/reports")
      .then(r => r.ok ? r.json() : [])
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  function downloadCSV() {
    const headers = ["Student Name", "Email", "Course", "Progress (%)", "Status", "Enrolled At", "Certificate Earned"]
    const rows = data.map(r => [
      r.student_name, r.student_email, r.course_title,
      r.progress, r.enrollment_status,
      new Date(r.enrolled_at).toLocaleDateString(), r.certificate_earned
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url
    a.download = `institution-report-${new Date().toISOString().split("T")[0]}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  if (loading) return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
    </div>
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800">Reports & Exports</h1>
          <p className="text-gray-500">Download detailed reports for your institution</p>
        </div>
        <Button
          onClick={downloadCSV}
          disabled={data.length === 0}
          className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-500"
        >
          <Download className="h-5 w-5" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Records", value: data.length },
          { label: "Unique Students", value: new Set(data.map(d => d.student_email)).size },
          { label: "Certificates Earned", value: data.filter(d => d.certificate_earned === "Yes").length },
        ].map(stat => (
          <div key={stat.label} className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-5 ring-1 ring-emerald-200">
            <p className="text-3xl font-extrabold text-emerald-600">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {data.length > 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-0 bg-white/80 shadow-xl backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800">
                <Table2 className="h-5 w-5 text-emerald-500" />
                Enrollment Data Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50/95 backdrop-blur">
                    <tr className="border-b">
                      {["Student", "Email", "Course", "Progress", "Status", "Enrolled", "Certificate"].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{row.student_name}</td>
                        <td className="px-4 py-3 text-gray-500">{row.student_email}</td>
                        <td className="px-4 py-3 text-violet-600 font-medium">{row.course_title}</td>
                        <td className="px-4 py-3">
                          <span className={`font-semibold ${row.progress === 100 ? "text-emerald-600" : "text-gray-700"}`}>
                            {row.progress}%
                          </span>
                        </td>
                        <td className="px-4 py-3 capitalize text-gray-600">{row.enrollment_status}</td>
                        <td className="px-4 py-3 text-gray-500">{new Date(row.enrolled_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          {row.certificate_earned === "Yes"
                            ? <span className="font-semibold text-emerald-600">✅ Yes</span>
                            : <span className="text-gray-400">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-teal-100">
            <FileText className="h-12 w-12 text-emerald-500" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-gray-800">No data to export</h3>
          <p className="text-gray-500">Reports will be available once students enroll in courses</p>
        </div>
      )}
    </div>
  )
}
