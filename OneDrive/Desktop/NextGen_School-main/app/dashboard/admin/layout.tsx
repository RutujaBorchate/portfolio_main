import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  if (session.user.role !== "admin") {
    redirect(`/dashboard/${session.user.role}`)
  }

  return <DashboardLayout role={session.user.role}>{children}</DashboardLayout>
}
