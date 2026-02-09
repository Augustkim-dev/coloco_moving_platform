import Link from "next/link";
import { ManchaloLogo } from "@/components/brand/ManchaloLogo";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 히어로 섹션 */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 bg-gradient-to-b from-orange-50 to-white">
        <div className="max-w-2xl mx-auto text-center">
          {/* 만차로 로고 */}
          <div className="flex justify-center mb-8">
            <ManchaloLogo size="xl" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            용달이사,
            <br />
            <span className="text-orange-600">이제 쉽고 빠르게!</span>
          </h1>

          <p className="text-lg text-gray-600 mb-4">
            복잡한 견적 비교는 이제 그만!
            <br />
            <span className="font-semibold text-orange-600">1톤~5톤 트럭</span>, 조건에 맞는 업체를 바로 연결해드려요.
          </p>

          {/* 핵심 가치 제안 */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <span className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
              <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              용달이사 특화
            </span>
            <span className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
              <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              3분 만에 견적
            </span>
            <span className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
              <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              검증된 업체만
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/estimate"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-orange-600 rounded-xl hover:bg-orange-700 transition-colors shadow-lg shadow-orange-600/30"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              무료 견적 신청하기
            </Link>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            회원가입 없이 바로 신청 가능해요
          </p>
        </div>
      </section>

      {/* 용달이사 강조 섹션 */}
      <section className="py-12 px-4 bg-orange-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">
            왜 만차로인가요?
          </h2>
          <p className="text-lg text-orange-100 mb-6">
            용달이사에 가장 최적화된 서비스
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-xl p-5 backdrop-blur-sm">
              <div className="text-3xl mb-3">🚛</div>
              <div className="font-semibold mb-1">용달 전문 업체만</div>
              <div className="text-sm text-orange-100">소형~대형 화물 전문 업체 네트워크</div>
            </div>
            <div className="bg-white/10 rounded-xl p-5 backdrop-blur-sm">
              <div className="text-3xl mb-3">💰</div>
              <div className="font-semibold mb-1">합리적인 가격</div>
              <div className="text-sm text-orange-100">거품 없는 정직한 용달 요금</div>
            </div>
            <div className="bg-white/10 rounded-xl p-5 backdrop-blur-sm">
              <div className="text-3xl mb-3">⚡</div>
              <div className="font-semibold mb-1">빠른 배차</div>
              <div className="text-sm text-orange-100">당일 배차도 가능한 신속함</div>
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
              icon="💬"
              title="대화로 간편하게"
              description="복잡한 폼 입력 대신 대화로 이사 정보를 알려주세요. 버튼 선택만으로 완료!"
            />
            <FeatureCard
              step={2}
              icon="🔍"
              title="조건 맞는 업체 매칭"
              description="트럭 크기, 이사 날짜, 지역에 맞는 최적의 업체를 연결해드려요."
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

      {/* CTA 섹션 */}
      <section className="py-12 px-4 bg-gray-900 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">
            지금 바로 견적 받아보세요
          </h2>
          <p className="text-gray-400 mb-6">
            3분이면 끝, 부담 없이 상담받으세요
          </p>
          <Link
            href="/estimate"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-900 bg-orange-400 rounded-xl hover:bg-orange-300 transition-colors"
          >
            무료 견적 시작하기
          </Link>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="py-8 px-4 bg-gray-900 text-gray-400 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center text-sm">
          <div className="flex justify-center mb-4">
            <ManchaloLogo size="sm" showText={true} className="[&_span]:text-gray-300 [&_span:last-child]:text-orange-400" />
          </div>
          <p>© 2026 만차로. All rights reserved.</p>
          <p className="mt-2">
            문의: contact@manchalo.kr
          </p>
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
      <div className="absolute top-4 left-4 w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-sm font-bold flex items-center justify-center">
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
        ? 'bg-orange-50 border-2 border-orange-200'
        : 'bg-white'
    }`}>
      <span className="text-3xl mb-2">{icon}</span>
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {active && (
        <span className="mt-1 text-xs text-orange-600 font-medium">추천</span>
      )}
    </div>
  );
}
