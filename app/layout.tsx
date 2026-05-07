import type { Metadata, Viewport } from "next";
import "katex/dist/katex.min.css";
import "./globals.css";

const SITE_URL = "https://mathlens-one.vercel.app";
const TITLE = "MathLens - 数学の問題を撮って学ぼう";
const DESCRIPTION =
  "数学の問題の写真を撮るだけで、AIが考え方から答えまで丁寧に解説してくれるWebアプリ。図解・追加質問・履歴対応。";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s | MathLens",
  },
  description: DESCRIPTION,
  applicationName: "MathLens",
  keywords: ["数学", "学習", "AI", "解説", "Gemini", "教育"],
  authors: [{ name: "MathLens" }],
  openGraph: {
    type: "website",
    siteName: "MathLens",
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#4f46e5",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
