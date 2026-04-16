"use client"

import { useEffect, useState, use } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import confetti from "canvas-confetti"
import { 
  Play, CheckCircle, ChevronRight, Lock, BookOpen, Clock, 
  ArrowLeft, FileText, Download, Award, Star, Rocket, Info, AlertCircle
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

interface Module {
  id: string
  title: string
  description: string
  video_url: string
  order_number: number
  duration_minutes: number
  completed: boolean
}

interface CourseDetails {
  id: string
  title: string
  description: string
  modules: Module[]
  enrollment: {
    status: string
    progress: number
  }
}

export default function StudentCourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params)
  const [course, setCourse] = useState<CourseDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeModule, setActiveModule] = useState<Module | null>(null)
  const [markingId, setMarkingId] = useState<string | null>(null)

  useEffect(() => {
    fetchCourseDetails()
  }, [])

  async function fetchCourseDetails() {
    try {
      const res = await fetch(`/api/student/courses/${courseId}`)
      if (res.ok) {
        const data = await res.json()
        setCourse(data)
        if (data.modules && data.modules.length > 0) {
          setActiveModule(data.modules[0])
        }
      } else {
        const err = await res.json()
        setError(err.message || err.error || "Failed to load course contents.")
      }
    } catch (e) {
      setError("An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  async function toggleComplete(moduleId: string, currentStatus: boolean) {
    setMarkingId(moduleId)
    try {
      const res = await fetch("/api/student/courses/progress", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId, courseId, completed: !currentStatus })
      })
      if (res.ok) {
        const data = await res.json()
        if (data.isNewlyCompleted) {
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#8b5cf6", "#ec4899", "#06b6d4"]
          })
          toast.success("Congratulations! You've completed the course! 🎉", {
            description: "Go to your dashboard to claim your certificate."
          })
        }
        fetchCourseDetails() // Refresh progress
      }
    } catch (e) {
      toast.error("Failed to update progress.")
    } finally {
      setMarkingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen py-8 px-4 lg:px-8 bg-gray-50/50">
        <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-[1fr_350px] gap-8">
          <div className="space-y-6">
            <Skeleton className="h-[450px] rounded-2xl" />
            <Skeleton className="h-20 rounded-2xl" />
          </div>
          <Skeleton className="h-screen rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-4 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-100 text-rose-500 shadow-xl shadow-rose-200/50">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">{error === "Pending Approval" ? "Access Locked" : "Something went wrong"}</h2>
        <p className="mt-2 max-w-md text-gray-500">{error === "Pending Approval" ? "Your teacher is currently reviewing your enrollment. We will notify you once you're approved!" : error}</p>
        <Button asChild className="mt-8 bg-violet-600">
          <Link href="/dashboard/student/courses">Back to My Courses</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {/* Top Header */}
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <Link href="/dashboard/student/courses" className="flex items-center gap-2 text-sm font-semibold text-violet-600 hover:text-violet-700">
              <ArrowLeft className="h-4 w-4" /> Back to My Courses
            </Link>
            <h1 className="text-3xl font-black text-gray-800">{course?.title}</h1>
          </div>
          <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-xl">
             <div className="text-right">
                <p className="text-sm font-bold text-gray-800">{course?.enrollment.progress}% Complete</p>
                <div className="mt-2 w-32">
                   <Progress value={course?.enrollment.progress} className="h-2" />
                </div>
             </div>
             {course?.enrollment.progress === 100 && (
               <Button asChild size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-500 font-bold shadow-lg shadow-emerald-200">
                 <Link href={`/dashboard/student/certificates`}><Award className="mr-2 h-4 w-4" /> Get Certificate</Link>
               </Button>
             )}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
          {/* Main Learning Content */}
          <div className="space-y-6">
            <motion.div 
              key={activeModule?.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-video overflow-hidden rounded-3xl bg-black shadow-2xl ring-1 ring-white/10"
            >
              <iframe
                src={activeModule?.video_url.replace("watch?v=", "embed/")}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>

            <Card className="border-0 bg-white/80 shadow-xl backdrop-blur">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-violet-50 text-violet-600 border-violet-100">
                         Lesson {activeModule?.order_number}
                      </Badge>
                      <CardTitle className="text-2xl font-black text-gray-800">{activeModule?.title}</CardTitle>
                   </div>
                   <Button 
                    variant={activeModule?.completed ? "outline" : "default"}
                    onClick={() => activeModule && toggleComplete(activeModule.id, !!activeModule.completed)}
                    className={activeModule?.completed ? "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-emerald-500 hover:bg-emerald-600"}
                    disabled={markingId === activeModule?.id}
                   >
                     {activeModule?.completed ? (
                       <><CheckCircle className="mr-2 h-5 w-5" /> Completed</>
                     ) : (
                       <><CheckCircle className="mr-2 h-5 w-5" /> Mark as Complete</>
                     )}
                   </Button>
                </div>
              </CardHeader>
              <CardContent>
                 <p className="text-gray-600 leading-relaxed">{activeModule?.description || "In this module, you will learn the fundamental concepts of the topic. Reach out to your teacher if you have any questions!"}</p>
                 
                 <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/80 border border-gray-100">
                       <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                          <Clock className="h-5 w-5" />
                       </div>
                       <div>
                          <p className="text-xs font-bold text-gray-400 uppercase">Duration</p>
                          <p className="text-sm font-black text-gray-700">{activeModule?.duration_minutes || "15"} Minutes</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/80 border border-gray-100 cursor-pointer hover:bg-violet-50 transition-colors">
                       <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-pink-100 text-pink-600">
                          <FileText className="h-5 w-5" />
                       </div>
                       <div>
                          <p className="text-xs font-bold text-gray-400 uppercase">Resources</p>
                          <p className="text-sm font-black text-gray-700">Download Lesson Notes</p>
                       </div>
                    </div>
                 </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Navigation */}
          <div className="space-y-6">
             <Card className="h-full border-0 bg-white/80 shadow-xl backdrop-blur">
                <CardHeader>
                   <CardTitle className="text-xl font-black text-gray-800 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-violet-500" />
                      Course Content
                   </CardTitle>
                   <CardDescription>{course?.modules.length} Lessons • {course?.modules.filter(m => m.completed).length} Completed</CardDescription>
                </CardHeader>
                <CardContent className="p-2">
                   <div className="space-y-1">
                      {course?.modules.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setActiveModule(m)}
                          className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all text-left group ${
                            activeModule?.id === m.id 
                            ? "bg-violet-600 text-white shadow-xl shadow-violet-200" 
                            : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                           <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                              activeModule?.id === m.id ? "bg-white/20" : "bg-gray-100"
                           }`}>
                              {m.completed ? (
                                <CheckCircle className={`h-4 w-4 ${activeModule?.id === m.id ? "text-white" : "text-emerald-500"}`} />
                              ) : (
                                <p className={`text-xs font-bold ${activeModule?.id === m.id ? "text-white" : "text-gray-400"}`}>{m.order_number}</p>
                              )}
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold truncate">{m.title}</p>
                              <p className={`text-[10px] font-bold uppercase opacity-60 ${activeModule?.id === m.id ? "text-white" : "text-gray-400"}`}>
                                {m.duration_minutes || 15} MIN
                              </p>
                           </div>
                           <ChevronRight className={`h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity ${activeModule?.id === m.id ? "text-white" : "text-gray-400"}`} />
                        </button>
                      ))}
                   </div>
                   
                   <Separator className="my-6" />
                   
                   <div className="p-4 rounded-3xl bg-linear-to-br from-violet-600 to-indigo-700 text-white shadow-xl">
                      <h4 className="font-black flex items-center gap-2 mb-2">
                         <Rocket className="h-5 w-5" /> Next Steps
                      </h4>
                      <p className="text-xs opacity-80 leading-relaxed mb-4">Complete all lessons to unlock the course certification and assignments.</p>
                      <Button asChild size="sm" variant="secondary" className="w-full font-black">
                         <Link href={`/dashboard/student/quizzes`}>Take Quiz</Link>
                      </Button>
                   </div>
                </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
