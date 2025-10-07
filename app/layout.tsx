import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { Suspense } from "react"
import Script from "next/script"

const geistSans = GeistSans
const geistMono = GeistMono

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://cetobot.com"),
  title: {
    default: "WhatsApp Bot Yöneticisi - Akıllı Mesajlaşma Platformu | CetoBot",
    template: "%s | CetoBot",
  },
  description:
    "Akıllı mesajlaşma ve akıllı iş akışları ile eksiksiz WhatsApp AI otomasyon platformu. Yapay zeka destekli WhatsApp botu ile müşterilerinize 7/24 anında yanıt verin.",
  keywords: [
    "whatsapp bot",
    "whatsapp otomasyon",
    "yapay zeka bot",
    "ai chatbot",
    "whatsapp business",
    "otomatik mesaj",
    "müşteri hizmetleri botu",
    "whatsapp api",
    "toplu mesaj gönderimi",
    "whatsapp pazarlama",
    "chatbot türkiye",
    "whatsapp ai",
    "mesajlaşma otomasyonu",
    "cetobot",
  ],
  authors: [{ name: "CetoBot" }],
  creator: "CetoBot",
  publisher: "CetoBot",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://cetobot.com",
    siteName: "CetoBot - WhatsApp AI Otomasyon",
    title: "WhatsApp Bot Yöneticisi - Akıllı Mesajlaşma Platformu",
    description:
      "Yapay zeka destekli WhatsApp otomasyon platformu ile müşterilerinize 7/24 anında yanıt verin. Sınırsız bot, akıllı mesajlaşma ve toplu gönderim.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CetoBot WhatsApp AI Otomasyon",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WhatsApp Bot Yöneticisi - Akıllı Mesajlaşma Platformu",
    description: "Yapay zeka destekli WhatsApp otomasyon platformu ile müşterilerinize 7/24 anında yanıt verin.",
    images: ["/og-image.jpg"],
    creator: "@cetobot",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || "https://cetobot.com",
  },
  verification: {
    google: "92sI-_cQ2XG6YPqKecR2rzW8DF2HFzVoto56jD3gy-k", // Updated with actual Google verification code
    yandex: "yandex-verification-code",
  },
  category: "technology",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${process.env.NEXT_PUBLIC_SITE_URL || "https://cetobot.com"}/#organization`,
        name: "CetoBot",
        url: process.env.NEXT_PUBLIC_SITE_URL || "https://cetobot.com",
        logo: {
          "@type": "ImageObject",
          url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://cetobot.com"}/logo.png`,
        },
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+90-543-113-5672",
          contactType: "customer service",
          areaServed: "TR",
          availableLanguage: "Turkish",
        },
        sameAs: ["https://twitter.com/cetobot", "https://facebook.com/cetobot", "https://linkedin.com/company/cetobot"],
      },
      {
        "@type": "WebSite",
        "@id": `${process.env.NEXT_PUBLIC_SITE_URL || "https://cetobot.com"}/#website`,
        url: process.env.NEXT_PUBLIC_SITE_URL || "https://cetobot.com",
        name: "CetoBot - WhatsApp AI Otomasyon",
        description: "Yapay zeka destekli WhatsApp otomasyon platformu",
        publisher: {
          "@id": `${process.env.NEXT_PUBLIC_SITE_URL || "https://cetobot.com"}/#organization`,
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${process.env.NEXT_PUBLIC_SITE_URL || "https://cetobot.com"}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "SoftwareApplication",
        name: "CetoBot WhatsApp AI Otomasyon",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "TRY",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          ratingCount: "150",
        },
      },
    ],
  }

  return (
    <html lang="tr" data-bs-theme="light" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className={GeistSans.className}>
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
        <Suspense fallback={null}>{children}</Suspense>
      </body>
    </html>
  )
}
