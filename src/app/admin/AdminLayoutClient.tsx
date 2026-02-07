'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'

interface AdminLayoutClientProps {
  children: React.ReactNode
  adminName: string
}

export function AdminLayoutClient({ children, adminName }: AdminLayoutClientProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin-login')
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminSidebar onLogout={handleLogout} />

      {/* Main Content */}
      <div className="md:pl-64">
        <AdminHeader adminName={adminName} />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
