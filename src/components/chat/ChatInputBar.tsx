'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Toggle } from '@/components/ui/toggle';
import { useChatStore } from '@/stores/chatStore';
import { Send, MessageSquare, Keyboard, Loader2 } from 'lucide-react';

interface ChatInputBarProps {
  className?: string;
}

export function ChatInputBar({ className }: ChatInputBarProps) {
  const [inputText, setInputText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    inputMode,
    isLoading,
    setInputMode,
    handleFreeTextInput,
  } = useChatStore();

  // 자동 높이 조절
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [inputText]);

  const handleSubmit = async () => {
    if (!inputText.trim() || isLoading) return;

    const text = inputText.trim();
    setInputText('');

    await handleFreeTextInput(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className={cn(
        'sticky top-0 z-10 bg-background border-b px-4 py-3',
        className
      )}
    >
      {/* 입력 모드 토글 */}
      <div className="flex items-center gap-2 mb-2">
        <Toggle
          pressed={inputMode === 'free_text'}
          onPressedChange={() => setInputMode('free_text')}
          size="sm"
          className="h-7 data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
        >
          <Keyboard className="w-3.5 h-3.5 mr-1" />
          자유 입력
        </Toggle>
        <Toggle
          pressed={inputMode === 'guided'}
          onPressedChange={() => setInputMode('guided')}
          size="sm"
          className="h-7 data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
        >
          <MessageSquare className="w-3.5 h-3.5 mr-1" />
          가이드
        </Toggle>
        <span className="text-xs text-muted-foreground ml-auto">
          {inputMode === 'guided'
            ? '버튼으로 답변해주세요'
            : '자유롭게 입력해주세요'}
        </span>
      </div>

      {/* 자유 입력 모드일 때만 입력창 표시 */}
      {inputMode === 'free_text' && (
        <div className="flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="예: 원룸이고 3월 말에 강남에서 마포로 포장이사 해요"
            className="min-h-[44px] max-h-[120px] resize-none flex-1"
            disabled={isLoading}
          />
          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={!inputText.trim() || isLoading}
            className="h-11 w-11 flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      )}

      {/* 가이드 모드 안내 */}
      {inputMode === 'guided' && (
        <div className="text-center text-sm text-muted-foreground py-2">
          위의 선택지에서 답변해주세요
        </div>
      )}
    </div>
  );
}
