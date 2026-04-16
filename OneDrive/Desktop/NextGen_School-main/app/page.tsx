"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Award, Users, Sparkles, Play, Star, Rocket, Brain, Trophy, GraduationCap, Zap, Heart } from "lucide-react"

const features = [
  {
    icon: BookOpen,
    title: "Fun Video Lessons",
    description: "Watch colorful, engaging videos that make learning exciting!",
    gradient: "from-pink-500 to-rose-500",
    bgLight: "bg-pink-100",
  },
  {
    icon: Brain,
    title: "Interactive Quizzes",
    description: "Test your knowledge with fun quizzes and earn points!",
    gradient: "from-violet-500 to-purple-500",
    bgLight: "bg-violet-100",
  },
  {
    icon: Trophy,
    title: "Earn Certificates",
    description: "Complete courses and get awesome certificates to show off!",
    gradient: "from-amber-500 to-orange-500",
    bgLight: "bg-amber-100",
  },
  {
    icon: Rocket,
    title: "Track Progress",
    description: "See how far you've come on your learning adventure!",
    gradient: "from-emerald-500 to-teal-500",
    bgLight: "bg-emerald-100",
  },
]

const stats = [
  { value: "1000+", label: "Happy Students", color: "text-pink-300" },
  { value: "50+", label: "Amazing Courses", color: "text-cyan-300" },
  { value: "100+", label: "Video Lessons", color: "text-amber-300" },
  { value: "500+", label: "Certificates Earned", color: "text-emerald-300" },
]

const floatingShapes = [
  { color: "bg-pink-400", size: "h-4 w-4", position: "left-[5%] top-[15%]", delay: 0 },
  { color: "bg-cyan-400", size: "h-6 w-6", position: "right-[10%] top-[20%]", delay: 0.5 },
  { color: "bg-amber-400", size: "h-5 w-5", position: "left-[15%] top-[60%]", delay: 1 },
  { color: "bg-emerald-400", size: "h-4 w-4", position: "right-[20%] top-[70%]", delay: 1.5 },
  { color: "bg-violet-400", size: "h-6 w-6", position: "left-[80%] top-[40%]", delay: 2 },
  { color: "bg-rose-400", size: "h-3 w-3", position: "right-[30%] top-[10%]", delay: 0.8 },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-pink-50 to-cyan-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-violet-200/50 bg-white/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 shadow-lg shadow-violet-500/30">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-xl font-extrabold text-transparent">NextGen School</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="font-semibold text-violet-700 hover:bg-violet-100 hover:text-violet-800">Login</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-violet-500 to-pink-500 font-semibold shadow-lg shadow-violet-500/30 hover:from-violet-600 hover:to-pink-600">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Colorful Background Blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-gradient-to-br from-pink-300 to-rose-300 opacity-60 blur-3xl" />
          <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-gradient-to-br from-cyan-300 to-blue-300 opacity-50 blur-3xl" />
          <div className="absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-gradient-to-br from-violet-300 to-purple-300 opacity-50 blur-3xl" />
          <div className="absolute bottom-20 right-1/4 h-64 w-64 rounded-full bg-gradient-to-br from-amber-300 to-yellow-300 opacity-40 blur-3xl" />
        </div>
        
        {/* Floating Shapes */}
        {floatingShapes.map((shape, i) => (
          <motion.div
            key={i}
            className={`absolute ${shape.position} ${shape.color} ${shape.size} rounded-full opacity-70`}
            animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }}
            transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: shape.delay }}
          />
        ))}
        
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500/10 to-pink-500/10 px-5 py-2.5 text-sm font-bold ring-1 ring-violet-500/20">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <span className="bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">Learning Made Fun for Grades 4-9!</span>
                <Sparkles className="h-5 w-5 text-amber-500" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-6 text-balance text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-7xl"
            >
              <span className="text-gray-800">Your Adventure in</span>{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-violet-600 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
                  Learning
                </span>
                <motion.span 
                  className="absolute -right-8 -top-4"
                  animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Star className="h-8 w-8 fill-amber-400 text-amber-400" />
                </motion.span>
              </span>{" "}
              <span className="bg-gradient-to-r from-cyan-500 via-emerald-500 to-amber-500 bg-clip-text text-transparent">
                Starts Here!
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto mb-8 max-w-2xl text-pretty text-lg font-medium text-gray-600"
            >
              Join thousands of students exploring exciting courses, watching fun videos, 
              taking quizzes, and earning certificates. The most exciting way to learn!
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link href="/register">
                <Button size="lg" className="gap-2 bg-gradient-to-r from-violet-500 via-pink-500 to-rose-500 text-lg font-bold shadow-xl shadow-pink-500/30 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/40">
                  <Rocket className="h-5 w-5" />
                  Start Learning Now
                </Button>
              </Link>
              <Link href="/courses">
                <Button size="lg" variant="outline" className="gap-2 border-2 border-violet-300 bg-white/50 text-lg font-bold text-violet-700 backdrop-blur hover:border-violet-400 hover:bg-violet-50">
                  <Play className="h-5 w-5" />
                  Browse Courses
                </Button>
              </Link>
            </motion.div>

            {/* Decorative Icons */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-[10%] top-[20%]"
              >
                <Star className="h-10 w-10 fill-amber-400 text-amber-400 drop-shadow-lg" />
              </motion.div>
              <motion.div
                animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute right-[12%] top-[25%]"
              >
                <Award className="h-12 w-12 text-pink-500 drop-shadow-lg" />
              </motion.div>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-[25%] left-[18%]"
              >
                <Heart className="h-8 w-8 fill-rose-400 text-rose-400 drop-shadow-lg" />
              </motion.div>
              <motion.div
                animate={{ y: [0, -12, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                className="absolute bottom-[30%] right-[15%]"
              >
                <Zap className="h-9 w-9 fill-amber-400 text-amber-400 drop-shadow-lg" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white/80" />
        <div className="container relative mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 px-4 py-2 text-sm font-bold text-emerald-600 ring-1 ring-emerald-500/20">
              <Sparkles className="h-4 w-4" />
              Amazing Features
            </div>
            <h2 className="mb-4 text-3xl font-extrabold text-gray-800 sm:text-4xl lg:text-5xl">
              Why Students{" "}
              <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">Love</span>{" "}
              Learning Here
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Everything you need for an amazing learning experience
            </p>
          </motion.div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <Card className="h-full overflow-hidden border-0 bg-white/70 shadow-xl shadow-gray-200/50 backdrop-blur transition-all hover:shadow-2xl">
                  <CardContent className="p-8 text-center">
                    <motion.div 
                      className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br ${feature.gradient} shadow-lg`}
                      whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <feature.icon className="h-10 w-10 text-white" />
                    </motion.div>
                    <h3 className="mb-3 text-xl font-bold text-gray-800">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 p-10 shadow-2xl shadow-violet-500/30 sm:p-16"
          >
            {/* Decorative Elements */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-xl" />
            </div>
            
            <div className="relative grid gap-10 text-center sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <motion.div 
                    className={`text-5xl font-black ${stat.color} sm:text-6xl`}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 200, delay: index * 0.1 + 0.2 }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="mt-3 text-lg font-semibold text-white/90">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Bot Teaser */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-cyan-50 via-white to-pink-50 p-8 shadow-2xl ring-1 ring-gray-200/50 sm:p-12"
            >
              {/* Colorful Background Accents */}
              <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-gradient-to-br from-cyan-200 to-blue-200 opacity-60 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-gradient-to-br from-pink-200 to-violet-200 opacity-60 blur-3xl" />
              
              <div className="relative flex flex-col items-center gap-10 lg:flex-row">
                <div className="flex-shrink-0">
                  <motion.div
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="relative"
                  >
                    <div className="flex h-40 w-40 items-center justify-center rounded-[2rem] bg-gradient-to-br from-cyan-400 via-violet-500 to-pink-500 shadow-2xl shadow-violet-500/40">
                      <Sparkles className="h-20 w-20 text-white" />
                    </div>
                    <motion.div 
                      className="absolute -right-2 -top-2 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-400 shadow-lg"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Zap className="h-5 w-5 text-white" />
                    </motion.div>
                  </motion.div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-amber-400/30">
                    <Star className="h-4 w-4 fill-white" />
                    Coming Soon
                    <Star className="h-4 w-4 fill-white" />
                  </div>
                  <h3 className="mb-4 text-3xl font-extrabold text-gray-800 sm:text-4xl">
                    Meet{" "}
                    <span className="bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 bg-clip-text text-transparent">Buddy</span>
                    {" "}- Your AI Learning Friend!
                  </h3>
                  <p className="mb-8 text-lg text-gray-600">
                    {`Soon you'll have a smart AI buddy to help you with homework, 
                    explain tricky concepts, and make learning even more fun!`}
                  </p>
                  <Button disabled className="bg-gradient-to-r from-gray-300 to-gray-400 font-bold text-white">
                    Coming Soon
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-24">
        {/* Colorful Background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-0 top-0 h-full w-full bg-gradient-to-br from-violet-100 via-pink-100 to-amber-100" />
          <div className="absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-cyan-200 opacity-50 blur-3xl" />
          <div className="absolute -right-40 top-0 h-80 w-80 rounded-full bg-pink-200 opacity-50 blur-3xl" />
        </div>
        
        <div className="container relative mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="mx-auto mb-6 inline-block"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 shadow-xl shadow-violet-500/30">
                <Rocket className="h-10 w-10 text-white" />
              </div>
            </motion.div>
            <h2 className="mb-4 text-3xl font-extrabold text-gray-800 sm:text-4xl lg:text-5xl">
              Ready to Start Your{" "}
              <span className="bg-gradient-to-r from-violet-600 via-pink-500 to-amber-500 bg-clip-text text-transparent">
                Learning Journey?
              </span>
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-600">
              Join our community of curious learners and discover the joy of education!
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <Button size="lg" className="gap-2 bg-gradient-to-r from-violet-500 via-pink-500 to-rose-500 text-lg font-bold shadow-xl shadow-pink-500/30 transition-all hover:scale-105">
                  <Users className="h-5 w-5" />
                  Create Free Account
                </Button>
              </Link>
              <Link href="/register?role=teacher">
                <Button size="lg" variant="outline" className="gap-2 border-2 border-emerald-400 bg-white font-bold text-emerald-600 transition-all hover:bg-emerald-50">
                  <GraduationCap className="h-5 w-5" />
                  Join as Teacher
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-violet-200/50 bg-white/80 py-12 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 shadow-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-lg font-extrabold text-transparent">NextGen School</span>
            </div>
            <p className="font-medium text-gray-500">
              Making learning fun for grades 4-9
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
