import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  // 1. Protection logic: Ensure the user is logged in as an admin
  if (!session || session.user.role !== "admin") {
    redirect("/admin/login")
  }

  // 2. Dashboard UI: Wrap children in the common dashboard shell
  return (
    <DashboardLayout role="admin">
      {children}
    </DashboardLayout>
  )
}
