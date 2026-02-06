import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "이사매칭 - AI 이사 견적 서비스",
  description: "AI가 최적의 이사업체를 매칭해드립니다. 가이드 대화로 간편하게 견적을 신청하세요.",
  keywords: ["이사", "견적", "이사업체", "포장이사", "원룸이사", "AI 매칭"],
  authors: [{ name: "이사매칭" }],
  openGraph: {
    title: "이사매칭 - AI 이사 견적 서비스",
    description: "AI가 최적의 이사업체를 매칭해드립니다.",
    type: "website",
    locale: "ko_KR",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2563EB",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${notoSansKR.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
