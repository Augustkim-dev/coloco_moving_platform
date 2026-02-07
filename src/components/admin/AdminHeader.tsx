'use client'

import { usePathname } from 'next/navigation'
import { Bell, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

const pageTitles: Record<string, string> = {
  '/admin': '대시보드',
  '/admin/dashboard': '대시보드',
  '/admin/estimates': '견적 관리',
  '/admin/companies': '업체 관리',
  '/admin/companies/new': '업체 등록',
  '/admin/customers': '고객 관리',
  '/admin/settings': '설정',
}

interface AdminHeaderProps {
  adminName?: string
}

export function AdminHeader({ adminName = '관리자' }: AdminHeaderProps) {
  const pathname = usePathname()

  // 동적 라우트 처리 (예: /admin/estimates/123)
  const getPageTitle = () => {
    // 정확한 매칭 먼저 시도
    if (pageTitles[pathname]) {
      return pageTitles[pathname]
    }

    // 동적 라우트 패턴 처리
    if (pathname.startsWith('/admin/estimates/')) {
      return '견적 상세'
    }
    if (pathname.startsWith('/admin/companies/') && pathname !== '/admin/companies/new') {
      return '업체 상세'
    }
    if (pathname.startsWith('/admin/customers/')) {
      return '고객 상세'
    }

    return '관리자'
  }

  return (
    <header className="sticky top-0 z-30 bg-background border-b">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Page Title - 모바일에서는 왼쪽 여백 추가 (햄버거 메뉴 공간) */}
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold md:text-xl pl-12 md:pl-0">
            {getPageTitle()}
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            {/* 알림 배지 - 알림이 있을 때만 표시 */}
            {/* <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" /> */}
          </Button>

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-2 border-l">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="hidden sm:inline text-sm font-medium">
              {adminName}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
