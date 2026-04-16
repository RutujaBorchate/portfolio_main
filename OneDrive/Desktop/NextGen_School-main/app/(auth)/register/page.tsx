"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GraduationCap, Loader2, AlertCircle, CheckCircle, Sparkles, Star, Rocket, Building2, BookOpen } from "lucide-react"

interface Institute {
  id: string
  name: string
}

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get("role") || "student"
  
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState(defaultRole)
  const [instituteId, setInstituteId] = useState("")
  const [userClass, setUserClass] = useState("")
  const [institutes, setInstitutes] = useState<Institute[]>([])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function fetchInstitutes() {
      try {
        const res = await fetch("/api/institutes")
        if (res.ok) {
          const data = await res.json()
          setInstitutes(data)
        }
      } catch (err) {
        console.error("Failed to fetch institutes:", err)
      }
    }
    fetchInstitutes()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (role === 'student') {
      if (!instituteId) {
        setError("Please select your institute!")
        setIsLoading(false)
        return
      }
      if (!userClass) {
        setError("Please select your class!")
        setIsLoading(false)
        return
      }
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match!")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long!")
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          role,
          instituteId: role === 'student' ? instituteId : undefined,
          userClass: role === 'student' ? userClass : undefined
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Registration failed. Please try again!")
        setIsLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch {
      setError("Something went wrong. Please try again!")
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden p-4">
        {/* Colorful Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 via-cyan-50 to-violet-100" />
        
        {/* Decorative Blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-gradient-to-br from-emerald-300 to-teal-300 opacity-50 blur-3xl" />
          <div className="absolute -right-40 top-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-cyan-300 to-blue-300 opacity-40 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative text-center"
        >
          <motion.div 
            className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-2xl shadow-emerald-500/40"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <CheckCircle className="h-14 w-14 text-white" />
          </motion.div>
          <h2 className="mb-3 text-3xl font-extrabold text-gray-800">Account Created!</h2>
          <p className="text-lg text-gray-600">
            {role === "student" 
              ? "Welcome aboard! Redirecting to login..."
              : "Your account is pending approval. We'll notify you once approved!"}
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden p-4 py-8">
      {/* Colorful Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-100 via-violet-50 to-pink-100" />
      
      {/* Decorative Blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-gradient-to-br from-cyan-300 to-blue-300 opacity-50 blur-3xl" />
        <div className="absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-gradient-to-br from-violet-300 to-purple-300 opacity-40 blur-3xl" />
        <div className="absolute -bottom-40 left-1/4 h-80 w-80 rounded-full bg-gradient-to-br from-pink-300 to-rose-300 opacity-40 blur-3xl" />
      </div>

      {/* Floating Elements */}
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[8%] top-[15%]"
      >
        <Rocket className="h-10 w-10 text-violet-400 opacity-60" />
      </motion.div>
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute right-[12%] top-[25%]"
      >
        <Star className="h-8 w-8 fill-amber-400 text-amber-400 opacity-60" />
      </motion.div>
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute bottom-[15%] right-[20%]"
      >
        <Sparkles className="h-9 w-9 text-pink-400 opacity-60" />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <Link href="/" className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-500 shadow-xl shadow-violet-500/30">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <span className="bg-gradient-to-r from-cyan-600 to-violet-600 bg-clip-text text-3xl font-extrabold text-transparent">NextGen School</span>
        </Link>

        <Card className="border-0 bg-white/80 shadow-2xl shadow-violet-500/10 backdrop-blur-lg">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-3xl font-extrabold text-gray-800">Join the Adventure!</CardTitle>
            <CardDescription className="text-base text-gray-600">Create your account to start learning</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="border-rose-200 bg-rose-50 text-rose-700">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="font-semibold text-gray-700">Your Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 border-2 border-cyan-200 bg-white/70 text-base focus:border-cyan-400 focus:ring-cyan-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="font-semibold text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 border-2 border-violet-200 bg-white/70 text-base focus:border-violet-400 focus:ring-violet-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="font-semibold text-gray-700">I am a...</Label>
                <Select value={role} onValueChange={setRole} disabled={isLoading}>
                  <SelectTrigger className="h-12 border-2 border-pink-200 bg-white/70 text-base focus:border-pink-400 focus:ring-pink-400">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student" className="text-base">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-cyan-500" />
                        Student
                      </span>
                    </SelectItem>
                    <SelectItem value="teacher" className="text-base">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-violet-500" />
                        Teacher
                      </span>
                    </SelectItem>
                    <SelectItem value="institution" className="text-base">
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-pink-500" />
                        Institution
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {role !== "student" && (
                  <p className="text-xs text-amber-600 font-medium">
                    Note: Teacher and Institution accounts require admin approval.
                  </p>
                )}
              </div>

              {role === "student" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-4 pt-2"
                >
                  <div className="space-y-2">
                    <Label htmlFor="institute" className="font-semibold text-gray-700">My Institute</Label>
                    <Select value={instituteId} onValueChange={setInstituteId} disabled={isLoading}>
                      <SelectTrigger className="h-12 border-2 border-cyan-200 bg-white/70 text-base focus:border-cyan-400 focus:ring-cyan-400">
                        <SelectValue placeholder="Select your institute" />
                      </SelectTrigger>
                      <SelectContent>
                        {institutes.length > 0 ? (
                          institutes.map((inst) => (
                            <SelectItem key={inst.id} value={String(inst.id)}>
                              <span className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-cyan-500" />
                                {inst.name}
                              </span>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>No approved institutes found</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="class" className="font-semibold text-gray-700">My Class</Label>
                    <Select value={userClass} onValueChange={setUserClass} disabled={isLoading}>
                      <SelectTrigger className="h-12 border-2 border-violet-200 bg-white/70 text-base focus:border-violet-400 focus:ring-violet-400">
                        <SelectValue placeholder="Select your class" />
                      </SelectTrigger>
                      <SelectContent>
                        {[4, 5, 6, 7, 8, 9].map((num) => (
                          <SelectItem key={num} value={String(num)}>
                            <span className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-violet-500" />
                              Class {num}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="font-semibold text-gray-700">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 border-2 border-emerald-200 bg-white/70 text-base focus:border-emerald-400 focus:ring-emerald-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="font-semibold text-gray-700">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 border-2 border-amber-200 bg-white/70 text-base focus:border-amber-400 focus:ring-amber-400"
                />
              </div>

              <Button 
                type="submit" 
                className="h-12 w-full bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 text-base font-bold shadow-lg shadow-violet-500/30 transition-all hover:scale-[1.02] hover:shadow-xl" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <Rocket className="mr-2 h-5 w-5" />
                    Create Account
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <span className="text-gray-600">Already have an account? </span>
              <Link href="/login" className="font-bold text-violet-600 hover:text-pink-600 hover:underline">
                Sign in!
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
