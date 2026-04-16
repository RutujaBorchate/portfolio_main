"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Loader2, ShieldCheck, User, Settings, Lock, CheckCircle, Save, AlertCircle } from "lucide-react"

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [settingsLoading, setSettingsLoading] = useState(false)
  
  const [profile, setProfile] = useState({ name: "", email: "", password: "" })
  const [platform, setPlatform] = useState({ allow_registration: true, auto_approve_teachers: false })

  useEffect(() => {
    async function fetchData() {
      try {
        const [sessionRes, settingsRes] = await Promise.all([
          fetch("/api/auth/session"),
          fetch("/api/admin/settings")
        ])
        
        if (sessionRes.ok) {
          const session = await sessionRes.json()
          setProfile(p => ({ ...p, name: session?.user?.name || "", email: session?.user?.email || "" }))
        }
        
        if (settingsRes.ok) {
          setPlatform(await settingsRes.json())
        }
      } catch (e) {
        toast.error("Failed to load settings.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault()
    setProfileLoading(true)
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profile.name, password: profile.password })
      })
      if (res.ok) {
        toast.success("Profile updated successfully.")
        setProfile(p => ({ ...p, password: "" }))
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to update profile.")
      }
    } catch (e) {
      toast.error("An error occurred.")
    } finally {
      setProfileLoading(false)
    }
  }

  async function handlePlatformUpdate(key: string, value: boolean) {
    const updatedPlatform = { ...platform, [key]: value }
    setPlatform(updatedPlatform)
    setSettingsLoading(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPlatform)
      })
      if (res.ok) {
        toast.success("Platform settings updated.")
      } else {
        toast.error("Failed to save switches.")
      }
    } catch (e) {
      toast.error("Connection error.")
    } finally {
      setSettingsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl space-y-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[400px] rounded-2xl" />
        <Skeleton className="h-[300px] rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-800">Settings</h1>
        <p className="text-gray-500">Manage your profile and platform preferences</p>
      </div>

      <div className="grid gap-8">
        {/* Profile Settings */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="border-0 bg-white/80 shadow-xl backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-violet-500" />
                Admin Profile
              </CardTitle>
              <CardDescription>Update your personal information and login credentials</CardDescription>
            </CardHeader>
            <form onSubmit={handleProfileUpdate}>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      value={profile.name} 
                      onChange={e => setProfile({...profile, name: e.target.value})}
                      placeholder="Admin Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" value={profile.email} disabled className="bg-gray-50" />
                    <p className="text-xs text-gray-400">Contact system admin to change email.</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-amber-500" />
                    <Label htmlFor="password">Change Password</Label>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    value={profile.password} 
                    onChange={e => setProfile({...profile, password: e.target.value})}
                    placeholder="Leave blank to keep current"
                  />
                  <p className="text-xs text-gray-500">Must be at least 6 characters.</p>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50/50 p-6">
                <Button type="submit" disabled={profileLoading} className="bg-gradient-to-r from-violet-600 to-indigo-600 font-bold">
                  {profileLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Profile Changes
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>

        {/* Platform Settings */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-0 bg-white/80 shadow-xl backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-pink-500" />
                Platform Configuration
              </CardTitle>
              <CardDescription>Control global behaviors and access levels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-xl border border-gray-100 p-4 transition-colors hover:bg-gray-50">
                <div className="space-y-0.5">
                  <Label className="text-base">Allow New User Registration</Label>
                  <p className="text-sm text-gray-500">When OFF, only existing users can log in.</p>
                </div>
                <Switch 
                  checked={platform.allow_registration} 
                  onCheckedChange={v => handlePlatformUpdate("allow_registration", v)}
                  disabled={settingsLoading}
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-gray-100 p-4 transition-colors hover:bg-gray-50">
                <div className="space-y-0.5">
                  <Label className="text-base">Auto-Approve Teachers</Label>
                  <p className="text-sm text-gray-500">When ON, teachers don't require manual approval.</p>
                </div>
                <Switch 
                  checked={platform.auto_approve_teachers} 
                  onCheckedChange={v => handlePlatformUpdate("auto_approve_teachers", v)}
                  disabled={settingsLoading}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Summary */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-0 bg-linear-to-br from-emerald-500 to-teal-600 text-white shadow-xl">
            <CardContent className="flex items-center gap-6 p-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
                <ShieldCheck className="h-10 w-10 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold">System Security</h3>
                <p className="opacity-90 text-sm">All administrative actions are logged and encrypted using standard bcrypt hashing.</p>
              </div>
              <CheckCircle className="h-8 w-8 opacity-50" />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
