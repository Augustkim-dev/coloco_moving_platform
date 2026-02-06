export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* 헤더는 Phase 2에서 추가 */}
      <main>{children}</main>
    </div>
  );
}
