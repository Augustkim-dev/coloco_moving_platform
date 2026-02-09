'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HybridLayout } from '@/components/estimate';
import { ManchaloIcon } from '@/components/brand/ManchaloLogo';

export default function EstimatePage() {
  const router = useRouter();

  const handleSubmit = () => {
    router.push('/estimate/confirm');
  };

  return (
    <div className="h-[100dvh] flex flex-col">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100">
        <Link href="/" className="flex items-center gap-2">
          <ManchaloIcon size="sm" />
          <span className="text-lg font-semibold text-gray-900">만차로</span>
        </Link>
        <span className="text-sm text-orange-600 font-medium">견적 신청</span>
      </header>

      {/* 하이브리드 레이아웃 (채팅 + 폼) */}
      <div className="flex-1 overflow-hidden">
        <HybridLayout onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
