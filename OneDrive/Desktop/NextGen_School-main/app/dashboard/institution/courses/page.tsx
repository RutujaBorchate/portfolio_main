"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, BookOpen, Users, Clock, Search, AlertCircle, Rocket, PlusCircle, MoreVertical, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Course {
  id: string
  title: string
  description: string
  status: string
  thumbnail: string
  class: string
  enrolled_count: number
}

export default function InstitutionCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchCourses()
  }, [])

  async function fetchCourses() {
    try {
      const res = await fetch("/api/institution/courses")
      if (res.ok) {
        setCourses(await res.json())
      }
    } catch (e) {
      console.error("Failed to load courses")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(courseId: string) {
    if (!confirm("Are you sure you want to delete this course?")) return
    
    try {
      const res = await fetch(`/api/course/${courseId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        fetchCourses()
      } else {
        alert("Failed to delete the course.")
      }
    } catch (error) {
      console.error("Failed to delete course:", error)
    }
  }

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800">Institution Courses</h1>
          <p className="text-gray-500">Manage and monitor courses belonging to your institution</p>
        </div>
        
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border-0 bg-white/80 py-2.5 pl-10 pr-4 shadow-sm backdrop-blur transition-all focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <Link href="/dashboard/institution/courses/create">
            <Button className="bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-lg shadow-amber-500/20">
              <PlusCircle className="mr-2 h-4 w-4" /> Create Course
            </Button>
          </Link>
        </div>
      </div>

      {filteredCourses.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course, idx) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="group overflow-hidden border-0 bg-white/80 shadow-xl backdrop-blur transition-all hover:scale-[1.02] hover:shadow-2xl">
                <div className="aspect-video relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br from-amber-500/20 to-rose-500/20 group-hover:opacity-0 transition-opacity`} />
                  <div className="absolute right-3 top-3 z-10 flex gap-2">
                    <Badge className={course.status === 'approved' ? 'bg-emerald-500' : 'bg-amber-500'}>
                      {course.status}
                    </Badge>
                  </div>
                  <div className="absolute left-3 top-3 z-10">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 bg-black/20 text-white hover:bg-black/40">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/institution/courses/${course.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Course
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-rose-600"
                          onClick={() => handleDelete(course.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Course
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100">
                      <BookOpen className="h-12 w-12 text-gray-300" />
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <h3 className="mb-2 text-xl font-bold text-gray-800 line-clamp-1">{course.title}</h3>
                  <p className="mb-4 text-sm text-gray-500 line-clamp-2">{course.description}</p>
                  
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
                      <Users className="h-4 w-4 text-violet-500" />
                      {course.enrolled_count} Students
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
                      <Clock className="h-4 w-4 text-pink-500" />
                      Class {course.class}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white/50 rounded-3xl border border-dashed border-gray-200">
          <BookOpen className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-800">No courses found</h3>
          <p className="text-gray-500">Either there are no courses or they don't match your search</p>
        </div>
      )}
    </div>
  )
}
