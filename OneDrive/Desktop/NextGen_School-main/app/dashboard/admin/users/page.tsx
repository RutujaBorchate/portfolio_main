"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink } from "@/components/ui/pagination"
import { Search, Trash2, Loader2, Users, GraduationCap, BookOpen, Building2, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface User {
  id: string; name: string; email: string; role: string; is_approved: boolean; created_at: string
}

const roleColors: Record<string, string> = {
  student: "bg-violet-100 text-violet-700",
  teacher: "bg-cyan-100 text-cyan-700",
  admin: "bg-emerald-100 text-emerald-700",
  institution: "bg-amber-100 text-amber-700",
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Pagination states
  const [page, setPage] = useState(1)
  const itemsPerPage = 8

  useEffect(() => { fetchUsers() }, [])

  async function fetchUsers() {
    try {
      const res = await fetch("/api/admin/users")
      if (res.ok) {
        setUsers(await res.json())
      } else {
        setError("Failed to load users.")
      }
    } catch (e) {
      setError("An error occurred while fetching users.")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(userId: string) {
    if (!confirm("Delete this user? This cannot be undone.")) return
    setActionLoading(userId + "_delete")
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
      if (res.ok) {
        toast.success("User deleted successfully")
        fetchUsers()
      } else {
        toast.error("Failed to delete user")
      }
    } catch (e) {
      toast.error("An error occurred")
    } finally {
      setActionLoading(null)
    }
  }

  async function handleUpdateUser(userId: string, updates: { role?: string, is_approved?: boolean }) {
    setActionLoading(userId + "_update")
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...updates }),
      })
      if (res.ok) {
        toast.success("User updated successfully")
        setUsers(users.map(u => u.id === userId ? { ...u, ...updates } : u))
      } else {
        toast.error("Failed to update user")
      }
    } catch (e) {
      toast.error("An error occurred")
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = users.filter(u => {
    const matchSearch = String(u.name || "").toLowerCase().includes(search.toLowerCase()) || String(u.email || "").toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === "all" || u.role === roleFilter
    return matchSearch && matchRole
  })

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const paginatedUsers = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  const counts = { all: users.length, student: users.filter(u => u.role === "student").length, teacher: users.filter(u => u.role === "teacher").length, institution: users.filter(u => u.role === "institution").length }

  if (loading) return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
    </div>
  )

  if (error) return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
      <AlertCircle className="h-12 w-12 text-rose-500" />
      <h2 className="text-xl font-bold text-gray-800">Something went wrong</h2>
      <p className="text-gray-500">{error}</p>
      <Button onClick={() => window.location.reload()} variant="outline">Try Again</Button>
    </div>
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-800">All Users</h1>
        <p className="text-gray-500">Manage all registered users on the platform</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total", value: counts.all, icon: Users, color: "from-emerald-500 to-teal-500" },
          { label: "Students", value: counts.student, icon: GraduationCap, color: "from-violet-500 to-purple-500" },
          { label: "Teachers", value: counts.teacher, icon: BookOpen, color: "from-cyan-500 to-blue-500" },
          { label: "Institutions", value: counts.institution, icon: Building2, color: "from-amber-500 to-orange-500" },
        ].map(stat => (
          <div key={stat.label} className={`rounded-2xl bg-gradient-to-br ${stat.color} p-5 text-white shadow-lg`}>
            <stat.icon className="mb-2 h-6 w-6 opacity-80" />
            <p className="text-3xl font-extrabold">{stat.value}</p>
            <p className="text-sm opacity-80">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Search by name or email..." value={search} onChange={e => {setSearch(e.target.value); setPage(1)}} className="pl-9" />
        </div>
        <Select value={roleFilter} onValueChange={v => {setRoleFilter(v); setPage(1)}}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="student">Students</SelectItem>
            <SelectItem value="teacher">Teachers</SelectItem>
            <SelectItem value="institution">Institutions</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-0 bg-white/80 shadow-xl backdrop-blur">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50/80">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">User</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Joined</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedUsers.map((user, i) => (
                  <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-800">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.role === "admin" ? (
                        <Badge className="bg-emerald-100 text-emerald-700">Admin</Badge>
                      ) : (
                        <Select value={user.role} onValueChange={(r) => handleUpdateUser(user.id, { role: r })} disabled={actionLoading === user.id + "_update"}>
                          <SelectTrigger className="h-8 w-32 text-xs font-semibold capitalize"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="teacher">Teacher</SelectItem>
                            <SelectItem value="institution">Institution</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Button 
                        variant="ghost" size="sm" 
                        onClick={() => handleUpdateUser(user.id, { is_approved: !user.is_approved })}
                        disabled={actionLoading === user.id + "_update" || user.role === "admin"}
                        className={`h-8 px-2 text-xs font-semibold ${user.is_approved ? 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50' : 'text-amber-600 hover:text-amber-700 hover:bg-amber-50'}`}
                      >
                         {actionLoading === user.id + "_update" ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : user.is_approved ? <CheckCircle className="h-4 w-4 mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
                         {user.is_approved ? "Active" : "Pending"}
                      </Button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.role !== "admin" && (
                        <Button
                          variant="ghost" size="sm"
                          className="text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                          onClick={() => handleDelete(user.id)}
                          disabled={actionLoading === user.id + "_delete"}
                        >
                          {actionLoading === user.id + "_delete" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {paginatedUsers.length === 0 && (
              <div className="py-12 text-center text-gray-500">No users found</div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Pagination Container */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                className="cursor-pointer" 
                onClick={(e) => { e.preventDefault(); setPage(p => Math.max(1, p - 1)) }}
              />
            </PaginationItem>
            
            {[...Array(totalPages)].map((_, idx) => (
              <PaginationItem key={idx}>
                 <PaginationLink href="#" isActive={page === idx + 1} onClick={(e) => { e.preventDefault(); setPage(idx + 1) }}>
                   {idx + 1}
                 </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext 
                className="cursor-pointer" 
                onClick={(e) => { e.preventDefault(); setPage(p => Math.min(totalPages, p + 1)) }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
