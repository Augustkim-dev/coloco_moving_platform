'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/stores/chatStore';
import { useEstimateStore } from '@/stores/estimateStore';
import { getStepById } from '@/lib/guided-flow/steps';
import { ChatBubble } from './ChatBubble';
import { ChatInputBar } from './ChatInputBar';
import { GuidedStepRenderer } from './GuidedStepRenderer';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface ChatWindowProps {
  className?: string;
}

export function ChatWindow({ className }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const stepInputRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(0);
  const [hasMounted, setHasMounted] = useState(false);

  const {
    messages,
    inputMode,
    isLoading,
    currentStepId,
    initializeChat,
    handleGuidedAnswer,
    revertToStep,
  } = useChatStore();

  const { schema, canSubmit } = useEstimateStore();
  const completionRate = schema.status?.completionRate ?? 0;

  // Hydration 완료 체크
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // 초기화
  useEffect(() => {
    initializeChat();
  }, [initializeChat]);

  // 스크롤 처리 (새 메시지 추가 시에만 스크롤)
  const scrollToBottom = useCallback(() => {
    // 스크롤 컨테이너 내에서 하단으로 스크롤
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, []);

  // 새 메시지 추가 시에만 스크롤
  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      // 짧은 딜레이 후 스크롤 (DOM 업데이트 대기)
      setTimeout(scrollToBottom, 100);
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages.length, scrollToBottom]);

  // 현재 Step
  const currentStep = currentStepId ? getStepById(currentStepId) : null;

  // 메시지가 Step 입력을 포함하는지 확인
  const lastMessage = messages[messages.length - 1];
  const showStepInput =
    inputMode === 'guided' &&
    lastMessage?.role === 'system' &&
    lastMessage?.stepId &&
    lastMessage?.inputComponent;

  const handleAnswer = (value: unknown, displayText: string) => {
    if (currentStep) {
      handleGuidedAnswer(currentStep.id, value, displayText);
    }
  };

  const handleEditMessage = (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (message?.stepId) {
      revertToStep(message.stepId);
    }
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* 진행률 바 */}
      <div className="px-4 py-3 border-b bg-orange-50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-orange-700">입력 진행률</span>
          <span className="text-sm font-medium text-orange-600">
            {Math.round(completionRate * 100)}%
          </span>
        </div>
        <Progress value={completionRate * 100} className="h-2" />
      </div>

      {/* 메시지 영역 */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.map((message) => (
          <ChatBubble
            key={message.id}
            message={message}
            onEdit={message.editable ? handleEditMessage : undefined}
          />
        ))}

        {/* Step 입력 UI */}
        {showStepInput && currentStep && (
          <div ref={stepInputRef} className="mt-4 mb-2">
            <GuidedStepRenderer step={currentStep} onAnswer={handleAnswer} />
          </div>
        )}

        {/* 로딩 표시 */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                <span
                  className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                />
                <span
                  className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* 제출 가능 시 버튼 표시 (hydration 완료 후에만 렌더링) */}
        {hasMounted && canSubmit() && (
          <div className="py-4">
            <Button className="w-full h-12 text-base" size="lg">
              견적 요청하기
            </Button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 입력창 */}
      <ChatInputBar />
    </div>
  );
}
