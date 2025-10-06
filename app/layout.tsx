// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next"

export const metadata: Metadata = {
  title: "你老板 - 老板水平检测平台",
  description: "通过5个问题快速检测你的老板水平，AI智能评价，五维能力雷达图分析",
  keywords: "老板检测,老板评价,职场,AI评价,五维能力",
  openGraph: {
    title: "你老板 - 老板水平检测平台",
    description: "通过5个问题快速检测你的老板水平，AI智能评价，五维能力雷达图分析",
    type: "website",
    locale: "zh_CN",
    siteName: "我的老板",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '你老板 - 老板水平检测平台',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "你老板 - 老板水平检测平台",
    description: "通过5个问题快速检测你的老板水平，AI智能评价，五维能力雷达图分析",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}