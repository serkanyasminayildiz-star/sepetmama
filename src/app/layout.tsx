import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import JsonLd from "@/components/JsonLd";
import WhatsAppButton from "@/components/WhatsAppButton";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
const siteName = "SepetMama";
const defaultTitle = "SepetMama — Kedi & Köpek Mama ve Aksesuar Mağazası";
const defaultDescription =
  "SepetMama'da kedi ve köpek mamaları, ödüller, aksesuarlar uygun fiyatla. Hızlı kargo, güvenli ödeme, 14 gün kolay iade.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: "%s | SepetMama",
  },
  description: defaultDescription,
  keywords: [
    "kedi maması",
    "köpek maması",
    "kedi konservesi",
    "köpek ödülü",
    "evcil hayvan",
    "pet shop online",
    "kedi aksesuar",
    "köpek aksesuar",
  ],
  applicationName: siteName,
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "/",
    siteName,
    title: defaultTitle,
    description: defaultDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: {
    telephone: false,
  },
  verification: {
    google: [
      process.env.GOOGLE_SITE_VERIFICATION,
      process.env.GOOGLE_SITE_VERIFICATION_MERCHANT,
    ].filter((v): v is string => Boolean(v)),
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f97316",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: siteName,
            url: siteUrl,
            logo: `${siteUrl}/api/logo`,
            contactPoint: {
              "@type": "ContactPoint",
              telephone: "+90-532-489-7846",
              contactType: "customer service",
              areaServed: "TR",
              availableLanguage: ["Turkish"],
            },
          }}
        />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: siteName,
            url: siteUrl,
            inLanguage: "tr-TR",
          }}
        />
        {children}
        <WhatsAppButton />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
