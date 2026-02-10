'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ManchaloFooterBannerProps {
  className?: string;
}

export function ManchaloFooterBanner({ className }: ManchaloFooterBannerProps) {
  return (
    <Link
      href="/"
      className={cn(
        'block w-full bg-gradient-to-r from-primary via-primary/95 to-primary/90',
        'pb-[env(safe-area-inset-bottom)]',
        className
      )}
    >
      <div className="flex items-center justify-center gap-3 px-4 py-3">
        {/* 트럭 아이콘 */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-8 text-white"
        >
          <path
            d="M1 12.5V16.5C1 17.0523 1.44772 17.5 2 17.5H3C3 18.6046 3.89543 19.5 5 19.5C6.10457 19.5 7 18.6046 7 17.5H13C13 18.6046 13.8954 19.5 15 19.5C16.1046 19.5 17 18.6046 17 17.5H18C18.5523 17.5 19 17.0523 19 16.5V12.5L16 6.5H11V12.5H1Z"
            fill="currentColor"
          />
          <rect x="1" y="6.5" width="10" height="6" rx="1" fill="currentColor" opacity="0.8" />
          <path d="M12 8.5H14.5L16.5 12.5H12V8.5Z" fill="white" opacity="0.3" />
          <circle cx="5" cy="17.5" r="1.5" fill="white" />
          <circle cx="15" cy="17.5" r="1.5" fill="white" />
        </svg>

        {/* 텍스트 */}
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-lg">만차로</span>
          <span className="text-white/70 text-sm hidden sm:inline">|</span>
          <span className="text-white/80 text-sm hidden sm:inline">용달이사의 새로운 기준</span>
        </div>

        {/* 화살표 */}
        <svg
          className="w-4 h-4 text-white/60 ml-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </Link>
  );
}
