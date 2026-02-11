'use client';

import { QRCodeSVG } from 'qrcode.react';
import { ManchaloLogo } from "@/components/brand/ManchaloLogo";

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.manchalo.app";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 히어로 섹션 */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 bg-gradient-to-b from-primary/5 to-white">
        <div className="max-w-2xl mx-auto text-center">
          {/* 만차로 로고 */}
          <div className="flex justify-center mb-8">
            <ManchaloLogo size="xl" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            용달이사,
            <br />
            <span className="text-primary">이제 쉽고 빠르게!</span>
          </h1>

          <p className="text-lg text-gray-600 mb-4">
            복잡한 견적 비교는 이제 그만!
            <br />
            <span className="font-semibold text-primary">1톤~5톤 트럭</span>, 조건에 맞는 업체를 바로 연결해드려요.
          </p>

          {/* 핵심 가치 제안 */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <span className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
              <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              용달이사 특화
            </span>
            <span className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
              <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              3분 만에 견적
            </span>
            <span className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
              <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              검증된 업체만
            </span>
          </div>

          {/* 앱 다운로드 CTA */}
          <div className="flex flex-col items-center gap-5">
            <button
              onClick={() => window.open(PLAY_STORE_URL, '_blank')}
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30 gap-3"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302-2.302 2.302-2.593-2.302 2.593-2.302zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z" />
              </svg>
              Google Play에서 다운로드
            </button>

            <div className="bg-white p-4 rounded-2xl shadow-md border border-gray-100">
              <QRCodeSVG
                value={PLAY_STORE_URL}
                size={140}
                level="M"
                includeMargin={false}
              />
            </div>
            <p className="text-sm text-gray-500">
              QR 코드를 스캔하여 앱을 다운로드하세요
            </p>
          </div>
        </div>
      </section>

      {/* 용달이사 강조 섹션 */}
      <section className="py-12 px-4 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">
            왜 만차로인가요?
          </h2>
          <p className="text-lg text-white/80 mb-6">
            용달이사에 가장 최적화된 서비스
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-xl p-5 backdrop-blur-sm">
              <div className="text-3xl mb-3">🚛</div>
              <div className="font-semibold mb-1">용달 전문 업체만</div>
              <div className="text-sm text-white/80">소형~대형 화물 전문 업체 네트워크</div>
            </div>
            <div className="bg-white/10 rounded-xl p-5 backdrop-blur-sm">
              <div className="text-3xl mb-3">💰</div>
              <div className="font-semibold mb-1">합리적인 가격</div>
              <div className="text-sm text-white/80">거품 없는 정직한 용달 요금</div>
            </div>
            <div className="bg-white/10 rounded-xl p-5 backdrop-blur-sm">
              <div className="text-3xl mb-3">⚡</div>
              <div className="font-semibold mb-1">빠른 배차</div>
              <div className="text-sm text-white/80">당일 배차도 가능한 신속함</div>
            </div>
          </div>
        </div>
      </section>

      {/* 특징 섹션 */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
            이렇게 이용하세요
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              step={1}
              icon="📲"
              title="앱 다운로드"
              description="Google Play에서 만차로 앱을 다운로드하세요. 간편하게 시작할 수 있어요!"
            />
            <FeatureCard
              step={2}
              icon="💬"
              title="대화로 간편하게"
              description="복잡한 폼 입력 대신 대화로 이사 정보를 알려주세요. 버튼 선택만으로 완료!"
            />
            <FeatureCard
              step={3}
              icon="📞"
              title="업체에서 연락"
              description="매칭된 업체에서 직접 연락드려요. 상담 후 결정하세요!"
            />
          </div>
        </div>
      </section>

      {/* 이사 종류 섹션 */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
            다양한 용달이사 지원
          </h2>
          <p className="text-center text-gray-600 mb-12">
            가정, 사무실, 소규모 화물까지
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MoveTypeCard icon="🏠" label="원룸·투룸 이사" active />
            <MoveTypeCard icon="🏢" label="오피스텔 이사" active />
            <MoveTypeCard icon="🏛️" label="사무실 이전" />
            <MoveTypeCard icon="📦" label="소형 화물 운송" active />
          </div>
        </div>
      </section>

      {/* 앱 다운로드 CTA 섹션 */}
      <section className="py-12 px-4 bg-gray-900 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">
            만차로 앱을 다운로드하세요
          </h2>
          <p className="text-gray-400 mb-6">
            앱에서 더 편리하게 용달이사 견적을 받아보세요
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button
              onClick={() => window.open(PLAY_STORE_URL, '_blank')}
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-900 bg-white rounded-xl hover:bg-gray-100 transition-colors gap-3"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302-2.302 2.302-2.593-2.302 2.593-2.302zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z" />
              </svg>
              Google Play
            </button>
            <div className="bg-white p-3 rounded-xl">
              <QRCodeSVG
                value={PLAY_STORE_URL}
                size={100}
                level="M"
                includeMargin={false}
              />
            </div>
          </div>
        </div>
      </section>

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

function FeatureCard({
  step,
  icon,
  title,
  description,
}: {
  step: number;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center p-6 relative">
      <div className="absolute top-4 left-4 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">
        {step}
      </div>
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

function MoveTypeCard({ icon, label, active }: { icon: string; label: string; active?: boolean }) {
  return (
    <div className={`flex flex-col items-center p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
      active
        ? 'bg-primary/5 border-2 border-primary/20'
        : 'bg-white'
    }`}>
      <span className="text-3xl mb-2">{icon}</span>
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {active && (
        <span className="mt-1 text-xs text-primary font-medium">추천</span>
      )}
    </div>
  );
}
