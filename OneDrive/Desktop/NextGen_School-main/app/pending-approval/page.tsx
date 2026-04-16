"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, GraduationCap, ArrowLeft, Sparkles } from "lucide-react"

export default function PendingApprovalPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden p-4">
      {/* Colorful Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-orange-50 to-rose-100" />
      
      {/* Decorative Blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-gradient-to-br from-amber-300 to-orange-300 opacity-50 blur-3xl" />
        <div className="absolute -right-40 top-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-rose-300 to-pink-300 opacity-40 blur-3xl" />
      </div>

      {/* Floating Elements */}
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[15%] top-[25%]"
      >
        <Sparkles className="h-8 w-8 text-amber-400 opacity-60" />
      </motion.div>
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute right-[20%] top-[30%]"
      >
        <Clock className="h-10 w-10 text-orange-400 opacity-60" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-lg"
      >
        <Card className="border-0 bg-white/80 shadow-2xl backdrop-blur-lg">
          <CardContent className="p-8 text-center">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl shadow-amber-500/30"
            >
              <Clock className="h-12 w-12 text-white" />
            </motion.div>

            <h1 className="mb-2 text-3xl font-extrabold text-gray-800">Pending Approval</h1>
            <p className="mb-6 text-lg text-gray-600">
              Your account is being reviewed by our admin team. You will receive access once approved.
            </p>

            <div className="mb-8 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 p-6 ring-1 ring-amber-200/50">
              <h3 className="mb-2 font-bold text-gray-800">What happens next?</h3>
              <ul className="space-y-2 text-left text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
                  Our team will review your application
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
                  You will be notified once approved
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
                  This usually takes 1-2 business days
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <Link href="/">
                <Button variant="outline" className="w-full gap-2 border-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
              <Link href="/login">
                <Button className="w-full gap-2 bg-gradient-to-r from-amber-500 to-orange-500">
                  <GraduationCap className="h-4 w-4" />
                  Try Logging In Again
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
