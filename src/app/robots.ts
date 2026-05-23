import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://sementinha-alimentos.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/privacidade", "/pesquisa-sementinha"],
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
