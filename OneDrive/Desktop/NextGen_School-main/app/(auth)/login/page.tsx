"use client"

import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GraduationCap, Loader2, AlertCircle, Sparkles, Star, ShieldAlert } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loginType, setLoginType] = useState<"user" | "institution">("user")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password. Please try again!")
        setIsLoading(false)
        return
      }

      if (result?.ok) {
        // Fetch session to determine the exact role using next-auth getSession
        try {
          const sessionData = await getSession()
          console.log("Login sessionData:", sessionData)
          
          if (sessionData?.user?.role) {
            router.push(`/dashboard/${sessionData.user.role}`)
          } else {
            router.push("/")
          }
        } catch (e) {
          console.error("Session fetch error:", e)
          router.push("/")
        }
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Something went wrong. Please try again!")
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden p-4">
      {/* Colorful Background */}
      <div className="absolute inset-0 bg-linear-to-br from-violet-100 via-pink-50 to-cyan-100" />
      
      {/* Decorative Blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-linear-to-br from-pink-300 to-rose-300 opacity-50 blur-3xl" />
        <div className="absolute -right-40 top-1/4 h-96 w-96 rounded-full bg-linear-to-br from-cyan-300 to-blue-300 opacity-40 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-linear-to-br from-violet-300 to-purple-300 opacity-40 blur-3xl" />
      </div>

      {/* Floating Elements */}
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[10%] top-[20%]"
      >
        <Star className="h-8 w-8 fill-amber-400 text-amber-400 opacity-60" />
      </motion.div>
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute right-[15%] top-[30%]"
      >
        <Sparkles className="h-10 w-10 text-pink-400 opacity-60" />
      </motion.div>
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute bottom-[20%] left-[20%]"
      >
        <Star className="h-6 w-6 fill-cyan-400 text-cyan-400 opacity-60" />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <Link href="/" className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-violet-500 to-pink-500 shadow-xl shadow-violet-500/30">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <span className="bg-linear-to-r from-violet-600 to-pink-600 bg-clip-text text-3xl font-extrabold text-transparent">NextGen School</span>
        </Link>

        <Card className="border-0 bg-white/80 shadow-2xl shadow-violet-500/10 backdrop-blur-lg">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-3xl font-extrabold text-gray-800">Welcome Back!</CardTitle>
            <CardDescription className="text-base text-gray-600">Sign in to continue</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {/* Login Type Selector */}
            <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setLoginType("user")}
                className={`flex-1 py-2 px-4 rounded transition-colors ${
                  loginType === "user"
                    ? "bg-violet-500 text-white font-semibold"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Student & Teacher
              </button>
              <button
                type="button"
                onClick={() => setLoginType("institution")}
                className={`flex-1 py-2 px-4 rounded transition-colors ${
                  loginType === "institution"
                    ? "bg-indigo-500 text-white font-semibold"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Institution
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="border-rose-200 bg-rose-50 text-rose-700">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="font-semibold text-gray-700">
                  {loginType === "institution" ? "Institution Email" : "Email"}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={loginType === "institution" ? "institution@example.com" : "you@example.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 border-2 border-violet-200 bg-white/70 text-base focus:border-violet-400 focus:ring-violet-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-semibold text-gray-700">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 border-2 border-violet-200 bg-white/70 text-base focus:border-violet-400 focus:ring-violet-400"
                />
              </div>

              <Button 
                type="submit" 
                className="h-12 w-full bg-linear-to-r from-violet-500 via-pink-500 to-rose-500 text-base font-bold shadow-lg shadow-pink-500/30 transition-all hover:scale-[1.02] hover:shadow-xl" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <span className="text-gray-600">{"Don't have an account? "}</span>
              <Link href="/register" className="font-bold text-violet-600 hover:text-pink-600 hover:underline">
                Create one!
              </Link>
            </div>

            <div className="mt-6 rounded-2xl bg-linear-to-r from-violet-50 to-pink-50 p-5 ring-1 ring-violet-200/50">
              <p className="mb-3 font-bold text-gray-700">Demo Accounts:</p>
              <div className="space-y-1.5 text-sm text-gray-600">
                {loginType === "user" ? (
                  <>
                    <p><span className="font-semibold text-pink-600">Teacher:</span> teacher@nextgenschool.com</p>
                    <p><span className="font-semibold text-cyan-600">Student:</span> student@nextgenschool.com</p>
                  </>
                ) : (
                  <>
                    <p><span className="font-semibold text-indigo-600">Institution:</span> harvard@institution.com</p>
                    <p><span className="font-semibold text-indigo-600">Institution:</span> stanford@institution.com</p>
                  </>
                )}
                <p className="mt-3 text-xs text-gray-500">Password for all: <span className="font-mono font-semibold">demo123</span></p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-3">Are you an administrator?</p>
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-semibold transition-colors hover:text-red-800"
          >
            <ShieldAlert className="h-4 w-4" />
            Admin Login
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
