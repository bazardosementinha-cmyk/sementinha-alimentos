import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = "https://sementinha-alimentos.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Sementinha · Gestão de Alimentos | Centro Tucxa",
    template: "%s | Sementinha · Centro Tucxa",
  },
  description:
    "Página institucional e pesquisa de diagnóstico para melhorar o processo voluntário de doações de alimentos do Sementinha, grupo ligado ao Centro Tucxa.",
  applicationName: "Sementinha · Gestão de Alimentos",
  keywords: [
    "Sementinha",
    "Centro Tucxa",
    "doações de alimentos",
    "voluntariado",
    "pesquisa de diagnóstico",
    "gestão de alimentos",
  ],
  authors: [{ name: "Centro Tucxa · Sementinha" }],
  creator: "Centro Tucxa · Sementinha",
  publisher: "Centro Tucxa · Sementinha",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "Sementinha · Gestão de Alimentos",
    title: "Sementinha · Gestão de Alimentos | Centro Tucxa",
    description:
      "Iniciativa para ouvir coordenadores e voluntários e organizar melhor o processo de doações de alimentos do Sementinha.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#047857",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
