import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  // ── Básico ──────────────────────────────────────────────
  title: "Gas.ly — Precios de Gasolineras en España",
  description:
    "Consulta y compara en tiempo real los precios de combustible de todas las gasolineras de España. Encuentra la gasolinera más barata de tu municipio, calcula cuánto te costará repostar y guarda tus favoritas.",

  // ── Keywords ────────────────────────────────────────────
  keywords: [
    "gasolineras", "precios gasolina", "gasolina barata", "gasóleo",
    "combustible", "gasolineras baratas", "precio gasolina hoy",
    "gasolineras España", "comparar precios gasolina", "gasolina 95",
    "gasóleo A", "GLP", "repostar barato", "Gas.ly"
  ],

  // ── Autoría ─────────────────────────────────────────────
  authors: [{ name: "Iván Ordóñez Álvarez", url: "https://github.com/ivanOrdAlv" }],
  creator: "Iván Ordóñez Álvarez",
  generator: "Next.js",

  // ── Canonical ───────────────────────────────────────────
  metadataBase: new URL("https://gaso-precios-plus.vercel.app"),
  alternates: {
    canonical: "/",
  },

  // ── Open Graph (WhatsApp, Facebook, LinkedIn...) ────────
  openGraph: {
    title: "Gas.ly — Precios de Gasolineras en España",
    description:
      "Consulta y compara en tiempo real los precios de combustible de todas las gasolineras de España. Encuentra la más barata de tu municipio al instante.",
    url: "https://gaso-precios-plus.vercel.app",
    siteName: "Gas.ly",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "https://raw.githubusercontent.com/ivanOrdAlv/GasoPreciosPlus/main/img/gaslylogo.png",
        width: 1200,
        height: 630,
        alt: "Gas.ly — Precios de Gasolineras en España",
      },
    ],
  },

  // ── Twitter / X ─────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    title: "Gas.ly — Precios de Gasolineras en España",
    description:
      "Consulta y compara en tiempo real los precios de combustible de todas las gasolineras de España.",
    images: ["https://raw.githubusercontent.com/ivanOrdAlv/GasoPreciosPlus/main/img/gaslylogo.png"],
    creator: "@IvanordalG",
  },

  // ── Robots ──────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
  },

  // ── Iconos (los mantienes igual) ────────────────────────
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
