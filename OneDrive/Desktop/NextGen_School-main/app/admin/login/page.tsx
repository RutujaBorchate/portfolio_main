"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { AlertCircle, Loader2, ShieldAlert, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        loginType: "admin",
        redirect: false,
      })

      if (result?.ok) {
        router.push("/admin/dashboard")
        router.refresh()
      } else {
        setError("Access Denied: Invalid admin credentials or insufficient permissions.")
      }
    } catch (err) {
      setError("An error occurred during sign in. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0f172a] overflow-hidden p-4">
      {/* Premium Dark Background with Glow */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(30,58,138,0.2),rgba(15,23,42,1))]" />
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/20 mb-4"
          >
            <ShieldAlert className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Admin Portal</h1>
          <p className="text-gray-400 mt-2 text-sm uppercase tracking-widest font-medium">Secure Access Point</p>
        </div>

        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white text-center">Authentication Required</CardTitle>
            <CardDescription className="text-gray-400 text-center">Enter your administrative credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300 font-medium">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@nextgenschool.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:ring-blue-500 focus:border-blue-500 h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300 font-medium">Secret Key</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:ring-blue-500 focus:border-blue-500 h-11"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-blue-600/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Authorize Access"
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-800">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group"
              >
                <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
                Return to User Access
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-xs text-gray-600">
          © 2026 NextGen School Management System. Restricted Content.
        </p>
      </motion.div>
    </div>
  )
}
