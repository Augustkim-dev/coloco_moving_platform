import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminLayoutClient } from './AdminLayoutClient'

interface Profile {
  role: 'customer' | 'company' | 'admin'
  name: string | null
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // 현재 로그인 사용자 확인
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 로그인하지 않은 경우
  if (!user) {
    redirect('/admin-login')
  }

  // 사용자 프로필에서 역할 확인
  const { data: profileData } = await supabase
    .from('profiles')
    .select('role, name')
    .eq('id', user.id)
    .single()

  const profile = profileData as Profile | null

  // 관리자가 아닌 경우
  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  return (
    <AdminLayoutClient adminName={profile.name || '관리자'}>
      {children}
    </AdminLayoutClient>
  )
}
