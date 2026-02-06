'use client';

import { useRouter } from 'next/navigation';
import { HybridLayout } from '@/components/estimate';

export default function EstimatePage() {
  const router = useRouter();

  const handleSubmit = () => {
    router.push('/estimate/confirm');
  };

  return (
    <div className="h-[100dvh] flex flex-col">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-4 py-3 border-b bg-background">
        <h1 className="text-lg font-semibold">견적 신청</h1>
      </header>

      {/* 하이브리드 레이아웃 (채팅 + 폼) */}
      <div className="flex-1 overflow-hidden">
        <HybridLayout onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
