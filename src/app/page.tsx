import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900">
      <section className="mx-auto flex max-w-4xl flex-col gap-6">
        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-zinc-200">
          <p className="mb-2 text-sm font-medium uppercase tracking-wide text-emerald-700">
            Centro Tucxa · Sementinha
          </p>
          <h1 className="text-4xl font-bold tracking-tight">
            Sementinha · Gestão de Alimentos
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-700">
            Primeira etapa do sistema para ouvir coordenadores e voluntários,
            mapear dores reais e desenhar o MVP do processo de doações de
            alimentos.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/pesquisa-sementinha"
              className="rounded-2xl bg-emerald-700 px-5 py-4 text-center font-bold text-white transition hover:bg-emerald-800"
            >
              Responder pesquisa
            </Link>
            <Link
              href="/admin/pesquisa-sementinha"
              className="rounded-2xl border border-zinc-300 px-5 py-4 text-center font-bold text-zinc-800 transition hover:bg-zinc-100"
            >
              Painel administrativo
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-zinc-200">
            <h2 className="font-bold">1. Ouvir</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Coletar respostas de quem vive o processo no dia a dia.
            </p>
          </div>
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-zinc-200">
            <h2 className="font-bold">2. Priorizar</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Identificar dores, etapas críticas e funcionalidades mais votadas.
            </p>
          </div>
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-zinc-200">
            <h2 className="font-bold">3. Construir</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Transformar as respostas em requisitos para o MVP.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
