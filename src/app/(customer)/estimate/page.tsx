'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HybridLayout } from '@/components/estimate';
import { ManchaloIcon } from '@/components/brand/ManchaloLogo';
import { useEstimateStore } from '@/stores/estimateStore';
import { useChatStore } from '@/stores/chatStore';

export default function EstimatePage() {
  const router = useRouter();
  const estimateId = useEstimateStore((state) => state.estimateId);
  const resetSchema = useEstimateStore((state) => state.resetSchema);
  const clearChat = useChatStore((state) => state.clearChat);

  // 이전 견적이 DB에 저장된 상태(estimateId 존재)로 진입하면 초기화
  // → 제출 완료 후 다시 돌아왔을 때 깨끗한 폼으로 시작
  // → 작성 중(미저장) 상태에서는 데이터 유지
  useEffect(() => {
    if (estimateId) {
      resetSchema();
      clearChat();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = () => {
    router.push('/estimate/confirm');
  };

  return (
    <div className="h-[100dvh] flex flex-col">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <Link href="/" className="flex items-center gap-2">
          <ManchaloIcon size="sm" />
          <span className="text-lg font-semibold text-gray-900">만차로</span>
        </Link>
        <span className="text-sm text-primary font-medium">견적 신청</span>
      </header>

      {/* 하이브리드 레이아웃 (채팅 + 폼) */}
      <HybridLayout onSubmit={handleSubmit} />
    </div>
  );
}
