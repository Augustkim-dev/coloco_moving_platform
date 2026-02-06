'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChatWindow } from '@/components/chat';
import { FormSyncWrapper, EstimateForm } from '@/components/form';
import { Progress } from '@/components/ui/progress';
import { useEstimateStore } from '@/stores/estimateStore';
import { MessageSquare, ClipboardList } from 'lucide-react';

// 미디어 쿼리 훅
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

interface HybridLayoutProps {
  onSubmit?: () => void;
}

export function HybridLayout({ onSubmit }: HybridLayoutProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [activeTab, setActiveTab] = useState<'chat' | 'form'>('chat');
  const engine = useEstimateStore((state) => state.engine);
  const completionRate = engine.getCompletionRate();

  if (isMobile) {
    return (
      <FormSyncWrapper>
        <div className="h-full flex flex-col">
          {/* 진행률 바 (모바일 상단) */}
          <div className="px-4 py-2 border-b bg-background">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>입력 진행률</span>
              <span>{Math.round(completionRate)}%</span>
            </div>
            <Progress value={completionRate} className="h-1.5" />
          </div>

          {/* 탭 컨텐츠 */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as 'chat' | 'form')}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <TabsContent
              value="chat"
              className="flex-1 m-0 overflow-hidden data-[state=inactive]:hidden"
            >
              <ChatWindow />
            </TabsContent>

            <TabsContent
              value="form"
              className="flex-1 m-0 overflow-auto data-[state=inactive]:hidden"
            >
              <div className="p-4">
                <EstimateForm onSubmit={onSubmit} />
              </div>
            </TabsContent>

            {/* 하단 탭 네비게이션 */}
            <TabsList className="grid grid-cols-2 h-14 rounded-none border-t bg-background">
              <TabsTrigger
                value="chat"
                className="flex flex-col gap-0.5 h-full rounded-none data-[state=active]:bg-muted"
              >
                <MessageSquare className="h-5 w-5" />
                <span className="text-xs">대화</span>
              </TabsTrigger>
              <TabsTrigger
                value="form"
                className="flex flex-col gap-0.5 h-full rounded-none data-[state=active]:bg-muted"
              >
                <ClipboardList className="h-5 w-5" />
                <span className="text-xs">폼 입력</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </FormSyncWrapper>
    );
  }

  // 데스크톱: 좌우 분할 레이아웃
  return (
    <FormSyncWrapper>
      <div className="h-full flex">
        {/* 좌측: 채팅 */}
        <div className="w-1/2 border-r flex flex-col">
          <div className="px-4 py-2 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm font-medium">가이드 대화</span>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatWindow />
          </div>
        </div>

        {/* 우측: 폼 */}
        <div className="w-1/2 flex flex-col">
          <div className="px-4 py-2 border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                <span className="text-sm font-medium">견적 정보</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{Math.round(completionRate)}%</span>
                <Progress value={completionRate} className="w-20 h-1.5" />
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <EstimateForm onSubmit={onSubmit} />
          </div>
        </div>
      </div>
    </FormSyncWrapper>
  );
}
