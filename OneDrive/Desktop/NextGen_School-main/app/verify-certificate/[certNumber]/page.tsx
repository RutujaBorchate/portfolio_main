"use client"

import { useEffect, useState, use } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { 
  Award, ShieldCheck, CheckCircle, ExternalLink, 
  MapPin, Clock, GraduationCap, XCircle, Loader2, Sparkles, Star
} from "lucide-react"
import Link from "next/link"

interface VerificationData {
  certificate_number: string
  issued_at: string
  student_name: string
  course_title: string
  course_description: string
  teacher_name: string
}

export default function PublicVerifyCertificatePage({ params }: { params: Promise<{ certNumber: string }> }) {
  const { certNumber } = use(params)
  const [data, setData] = useState<VerificationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function verify() {
      try {
        const res = await fetch(`/api/certificates/verify/${certNumber}`)
        if (res.ok) {
           setData(await res.json())
        } else {
           setError("Invalid Certificate ID")
        }
      } catch (e) {
        setError("Verification Service Unavailable")
      } finally {
        setLoading(false)
      }
    }
    verify()
  }, [])

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50"><Loader2 className="h-10 w-10 animate-spin text-violet-600" /></div>

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[40px] bg-rose-100 text-rose-500 shadow-2xl">
           <XCircle className="h-12 w-12" />
        </div>
        <h1 className="text-3xl font-black text-gray-800">Verification Failed</h1>
        <p className="mt-2 text-gray-500">The certificate ID you provided is invalid or has been revoked.</p>
        <Button asChild className="mt-10 bg-violet-600 px-8 rounded-full">
           <Link href="/">Return to NextGen School</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-violet-50 via-white to-pink-50 py-20 px-4">
       <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-2xl"
       >
          <div className="mb-12 flex items-center justify-center gap-4">
             <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-xl">
                <GraduationCap className="h-7 w-7" />
             </div>
             <span className="text-2xl font-black bg-clip-text text-transparent bg-linear-to-r from-violet-600 to-indigo-600">NextGen School</span>
          </div>

          <Card className="border-0 bg-white/90 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] backdrop-blur-3xl overflow-hidden rounded-[48px]">
             <div className="h-4 bg-linear-to-r from-emerald-400 via-teal-500 to-cyan-500" />
             <CardContent className="p-12 text-center">
                <div className="mb-8 flex justify-center">
                   <div className="relative">
                      <div className="h-28 w-28 flex items-center justify-center rounded-[32px] bg-emerald-50 shadow-inner">
                         <ShieldCheck className="h-16 w-16 text-emerald-500" />
                      </div>
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute -right-2 -top-2">
                         <Badge className="bg-emerald-500 hover:bg-emerald-500 border-0 shadow-lg px-3 py-1 text-[10px] font-black tracking-widest uppercase">Verified</Badge>
                      </motion.div>
                   </div>
                </div>

                <h1 className="text-4xl font-black text-gray-800 tracking-tight leading-tight mb-4">Official Verification of Achievement</h1>
                <p className="text-gray-500 font-medium mb-12 italic leading-relaxed">
                   This confirms that the following student has successfully met all academic requirements and criteria for course completion verified by NextGen School.
                </p>

                <div className="mb-12 space-y-2">
                   <p className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Authorized For</p>
                   <h2 className="text-5xl font-black text-transparent bg-clip-text bg-linear-to-r from-violet-600 to-indigo-700">{data?.student_name}</h2>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 mb-12">
                   <div className="p-6 rounded-[32px] bg-gray-50/80 border border-gray-100 text-left">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Authenticated Course</p>
                      <p className="text-lg font-black text-gray-800">{data?.course_title}</p>
                   </div>
                   <div className="p-6 rounded-[32px] bg-gray-50/80 border border-gray-100 text-left">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Verified Date</p>
                      <p className="text-lg font-black text-gray-800">{new Date(data?.issued_at!).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                   </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-12 text-gray-400">
                    <div className="text-center">
                       <p className="text-[10px] font-black uppercase mb-4 tracking-widest">Instructor Verification</p>
                       <p className="text-xl font-black text-gray-800 italic underline decoration-violet-500 decoration-4 underline-offset-8">Prof. {data?.teacher_name}</p>
                    </div>
                    <div className="h-20 w-[1px] bg-gray-100 hidden sm:block" />
                    <div className="text-center">
                       <p className="text-[10px] font-black uppercase mb-4 tracking-widest">Blockchain Hash ID</p>
                       <p className="text-sm font-black text-violet-600 font-mono">{data?.certificate_number}</p>
                    </div>
                </div>
             </CardContent>
          </Card>

          <p className="mt-12 text-center text-sm font-black text-gray-400 uppercase tracking-[0.3em]">
             &copy; 2026 NextGen School Certification Authority
          </p>
       </motion.div>
    </div>
  )
}
