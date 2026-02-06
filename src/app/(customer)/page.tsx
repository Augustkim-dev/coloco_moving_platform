import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 히어로 섹션 */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            AI가 찾아주는
            <br />
            <span className="text-blue-600">최적의 이사업체</span>
          </h1>

          <p className="text-lg text-gray-600 mb-8">
            복잡한 견적 비교는 이제 그만!
            <br />
            대화로 간편하게 이사 정보를 입력하면
            <br />
            AI가 조건에 맞는 업체를 자동으로 매칭해드려요.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/estimate"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
            >
              무료 견적 신청하기
            </Link>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            회원가입 없이 바로 신청 가능해요
          </p>
        </div>
      </section>

      {/* 특징 섹션 */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
            왜 이사매칭인가요?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="💬"
              title="대화로 간편하게"
              description="복잡한 폼 입력 대신 대화로 이사 정보를 알려주세요. 버튼 선택만으로 완료!"
            />
            <FeatureCard
              icon="🤖"
              title="AI 자동 매칭"
              description="여러 업체 비교할 필요 없어요. AI가 조건에 맞는 최적 업체를 찾아드려요."
            />
            <FeatureCard
              icon="⚡"
              title="3분이면 끝"
              description="평균 3분 이내에 견적 신청 완료. 업체 연락까지 빠르게 진행돼요."
            />
          </div>
        </div>
      </section>

      {/* 이사 종류 섹션 */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
            모든 이사에 대응해요
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MoveTypeCard icon="🏠" label="원룸 이사" />
            <MoveTypeCard icon="🏢" label="아파트 이사" />
            <MoveTypeCard icon="🏛️" label="사무실 이전" />
            <MoveTypeCard icon="📦" label="용달 이사" />
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="py-8 px-4 bg-gray-900 text-gray-400">
        <div className="max-w-4xl mx-auto text-center text-sm">
          <p>© 2026 이사매칭. All rights reserved.</p>
          <p className="mt-2">
            문의: contact@moving-match.kr
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center p-6">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

function MoveTypeCard({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <span className="text-3xl mb-2">{icon}</span>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
  );
}
