import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sementinha · Gestão de Alimentos",
  description:
    "Sistema inicial para pesquisa, diagnóstico e evolução do processo de doações de alimentos do Sementinha.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
