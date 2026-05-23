import Link from "next/link";

export const metadata = {
  title: "Início",
  description:
    "Página institucional do Sementinha · Gestão de Alimentos, iniciativa do Centro Tucxa para ouvir voluntários e melhorar o processo de doações de alimentos.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900">
      <section className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-zinc-200">
          <p className="mb-2 text-sm font-medium uppercase tracking-wide text-emerald-700">
            Centro Tucxa · Sementinha
          </p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight">
            Sementinha · Gestão de Alimentos
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-zinc-700">
            Esta é a página institucional da primeira etapa do projeto para
            ouvir coordenadores e voluntários do Sementinha, mapear as dores
            reais do processo de doações de alimentos e desenhar um sistema de
            apoio simples, seguro e útil.
          </p>

          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-950">
            <strong>Importante:</strong> esta iniciativa não solicita senha,
            cartão, pagamento, Pix, dados bancários ou qualquer informação
            financeira. A pesquisa é apenas um diagnóstico interno do processo
            de alimentos do Sementinha.
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/pesquisa-sementinha"
              className="rounded-2xl bg-emerald-700 px-5 py-4 text-center font-bold text-white transition hover:bg-emerald-800"
            >
              Responder pesquisa
            </Link>
            <Link
              href="/privacidade"
              className="rounded-2xl border border-zinc-300 px-5 py-4 text-center font-bold text-zinc-800 transition hover:bg-zinc-100"
            >
              Ver aviso de privacidade
            </Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-zinc-200">
            <h2 className="font-bold">1. Ouvir</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Coletar respostas de quem vive o processo de alimentos no dia a
              dia, com respeito ao trabalho voluntário.
            </p>
          </div>
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-zinc-200">
            <h2 className="font-bold">2. Priorizar</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Identificar dores, etapas críticas e funcionalidades que realmente
              precisam entrar primeiro.
            </p>
          </div>
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-zinc-200">
            <h2 className="font-bold">3. Construir</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Transformar as respostas em requisitos para o MVP do sistema de
              gestão de alimentos.
            </p>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
          <h2 className="text-2xl font-bold">O que esta página é</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-zinc-50 p-4">
              <h3 className="font-semibold">Uma escuta organizada</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                A pesquisa ajuda a registrar, em sistema, o que originou o
                desenho do MVP.
              </p>
            </div>
            <div className="rounded-2xl bg-zinc-50 p-4">
              <h3 className="font-semibold">Um apoio ao voluntariado</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                O objetivo é reduzir retrabalho, insegurança e informações
                espalhadas, não criar cobrança ou burocracia.
              </p>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
