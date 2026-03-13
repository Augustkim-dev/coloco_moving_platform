'use client';

import { LandingWizard } from '@/components/landing/LandingWizard';
import { ManchaloLogo } from '@/components/brand/ManchaloLogo';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingWizard />

      {/* 푸터 */}
      <footer className="py-8 px-4 bg-gray-900 text-gray-400 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center text-sm">
          <div className="flex justify-center mb-4">
            <ManchaloLogo size="sm" showText={true} className="[&_span]:text-gray-300 [&_span:last-child]:text-primary" />
          </div>
          <div className="space-y-1 text-gray-500">
            <p>업체명: (주)중기콜 | 대표: 임재득</p>
            <p>사업자등록번호: 139-81-67365</p>
            <p>주소: 경기도 광주시 장지 1길 90, 3층(역동)</p>
            <p>대표전화: 1660-0404 | 통신판매업신고증: 제2024-경기광주-0996호</p>
            <p>메일: wndrl67365@naver.com</p>
          </div>
          <p className="mt-4 text-gray-600">Copyright ⓒ Joongkical all rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
