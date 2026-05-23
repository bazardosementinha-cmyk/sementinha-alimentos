import { redirect } from "next/navigation";

export const metadata = {
  title: "Pesquisa Sementinha",
  description:
    "Atalho de compatibilidade para a pesquisa Sementinha sobre doações de alimentos.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function PesquisaConsulenteCompatPage() {
  redirect("/pesquisa-sementinha");
}
