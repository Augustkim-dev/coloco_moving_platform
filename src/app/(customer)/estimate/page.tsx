'use client';

import { ChatWindow } from '@/components/chat';

export default function EstimatePage() {
  return (
    <div className="h-[100dvh] flex flex-col">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-4 py-3 border-b bg-background">
        <h1 className="text-lg font-semibold">견적 신청</h1>
      </header>

      {/* 채팅 영역 */}
      <div className="flex-1 overflow-hidden">
        <ChatWindow />
      </div>
    </div>
  );
}
