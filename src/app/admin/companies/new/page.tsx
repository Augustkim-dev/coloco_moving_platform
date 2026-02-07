import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CompanyForm } from '@/components/admin/CompanyForm'
import { ArrowLeft } from 'lucide-react'

export default function NewCompanyPage() {
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
          <h1 className="text-xl font-semibold">업체 등록</h1>
          <p className="text-sm text-muted-foreground">
            새로운 이사업체를 등록합니다
          </p>
        </div>
      </div>

      {/* 폼 */}
      <CompanyForm />
    </div>
  )
}
