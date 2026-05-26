import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "아이랑 — 40주, 우리가 함께 쓰는 일기",
  description: "AI와 가족이 함께하는 임신 다이어리. 40주의 소중한 순간을 함께 기록해요.",
  keywords: ["임신", "다이어리", "임신일기", "태교", "가족공유", "아이랑"],
  openGraph: {
    title: "아이랑 — 40주, 우리가 함께 쓰는 일기",
    description: "AI와 가족이 함께하는 임신 다이어리",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
