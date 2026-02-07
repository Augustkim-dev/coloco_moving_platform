import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { CompanyForm } from '@/components/admin/CompanyForm'
import { ArrowLeft } from 'lucide-react'
import type { Database } from '@/types/database'

type Company = Database['public']['Tables']['companies']['Row']

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CompanyDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: companyData } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single()

  if (!companyData) {
    notFound()
  }

  const company = companyData as Company

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Link href="/admin/companies">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold">{company.business_name}</h1>
          <p className="text-sm text-muted-foreground">업체 정보 수정</p>
        </div>
      </div>

      {/* 폼 */}
      <CompanyForm company={company} isEdit />
    </div>
  )
}
