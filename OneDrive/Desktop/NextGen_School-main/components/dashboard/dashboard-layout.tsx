"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { signOut, useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  GraduationCap,
  BookOpen,
  Trophy,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  FileText,
  Award,
  CheckSquare,
  PlusCircle,
  ClipboardList,
  Building2,
  UserCheck,
  Sparkles,
} from "lucide-react"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  color: string
}

const roleNavItems: Record<string, NavItem[]> = {
  student: [
    { label: "Dashboard", href: "/dashboard/student", icon: Home, color: "text-violet-500" },
    { label: "My Courses", href: "/dashboard/student/courses", icon: BookOpen, color: "text-pink-500" },
    { label: "Quizzes", href: "/dashboard/student/quizzes", icon: CheckSquare, color: "text-cyan-500" },
    { label: "Assignments", href: "/dashboard/student/assignments", icon: FileText, color: "text-amber-500" },
    { label: "Certificates", href: "/dashboard/student/certificates", icon: Award, color: "text-emerald-500" },
  ],
  teacher: [
    { label: "Dashboard", href: "/dashboard/teacher", icon: Home, color: "text-violet-500" },
    { label: "My Courses", href: "/dashboard/teacher/courses", icon: BookOpen, color: "text-pink-500" },
    { label: "Create Course", href: "/dashboard/teacher/courses/new", icon: PlusCircle, color: "text-cyan-500" },
    { label: "Quizzes", href: "/dashboard/teacher/quizzes", icon: ClipboardList, color: "text-amber-500" },
    { label: "Assignments", href: "/dashboard/teacher/assignments", icon: FileText, color: "text-emerald-500" },
    { label: "Enrollments", href: "/dashboard/teacher/enrollments", icon: Users, color: "text-rose-500" },
  ],
  admin: [
    { label: "Dashboard", href: "/dashboard/admin", icon: Home, color: "text-violet-500" },
    { label: "Users", href: "/dashboard/admin/users", icon: Users, color: "text-pink-500" },
    { label: "Approvals", href: "/dashboard/admin/approvals", icon: UserCheck, color: "text-cyan-500" },
    { label: "Courses", href: "/dashboard/admin/courses", icon: BookOpen, color: "text-amber-500" },
    { label: "Analytics", href: "/dashboard/admin/analytics", icon: BarChart3, color: "text-emerald-500" },
    { label: "Settings", href: "/dashboard/admin/settings", icon: Settings, color: "text-rose-500" },
  ],
  institution: [
    { label: "Dashboard", href: "/dashboard/institution", icon: Home, color: "text-violet-500" },
    { label: "Students", href: "/dashboard/institution/students", icon: Users, color: "text-pink-500" },
    { label: "Performance", href: "/dashboard/institution/performance", icon: BarChart3, color: "text-cyan-500" },
    { label: "Courses", href: "/dashboard/institution/courses", icon: BookOpen, color: "text-amber-500" },
    { label: "Reports", href: "/dashboard/institution/reports", icon: FileText, color: "text-emerald-500" },
  ],
}

const roleGradients: Record<string, string> = {
  student: "from-violet-500 via-pink-500 to-rose-500",
  teacher: "from-cyan-500 via-blue-500 to-violet-500",
  admin: "from-emerald-500 via-teal-500 to-cyan-500",
  institution: "from-amber-500 via-orange-500 to-rose-500",
}

const roleBgGradients: Record<string, string> = {
  student: "from-violet-50 via-pink-50 to-rose-50",
  teacher: "from-cyan-50 via-blue-50 to-violet-50",
  admin: "from-emerald-50 via-teal-50 to-cyan-50",
  institution: "from-amber-50 via-orange-50 to-rose-50",
}

export function DashboardLayout({ children, role }: { children: React.ReactNode, role?: string }) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const activeRole = role || (session?.user?.role as string) || "student"
  const navItems = roleNavItems[activeRole] || roleNavItems.student
  const gradient = roleGradients[activeRole] || roleGradients.student
  const bgGradient = roleBgGradients[activeRole] || roleBgGradients.student

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U"

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient}`}>
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform bg-white/90 backdrop-blur-xl shadow-2xl transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center justify-between px-6">
            <Link href="/" className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}>
                <GraduationCap className="h-7 w-7 text-white" />
              </div>
              <span className={`bg-gradient-to-r ${gradient} bg-clip-text text-xl font-extrabold text-transparent`}>
                NextGen
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 px-4 py-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all",
                    isActive
                      ? `bg-gradient-to-r ${gradient} text-white shadow-lg`
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive ? "text-white" : item.color)} />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* User Section */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 p-3">
              <Avatar className="h-10 w-10 ring-2 ring-white shadow-md">
                <AvatarFallback className={`bg-gradient-to-br ${gradient} font-bold text-white`}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold text-gray-800">{session?.user?.name}</p>
                <p className="truncate text-xs text-gray-500 capitalize">{activeRole}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Navigation */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-white/50 bg-white/70 px-4 backdrop-blur-xl lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Sparkles className="h-5 w-5 text-amber-500" />
            </motion.div>
            <span className="text-sm font-medium text-gray-600">
              Welcome back, <span className="font-bold text-gray-800">{session?.user?.name?.split(" ")[0]}</span>!
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10 ring-2 ring-violet-200">
                  <AvatarFallback className={`bg-gradient-to-br ${gradient} font-bold text-white`}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{session?.user?.name}</p>
                  <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/${activeRole}/settings`} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/" })}
                className="cursor-pointer text-rose-600 focus:text-rose-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
