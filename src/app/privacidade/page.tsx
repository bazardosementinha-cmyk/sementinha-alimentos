import Link from "next/link";

export const metadata = {
  title: "Privacidade",
  description:
    "Aviso de privacidade da pesquisa Sementinha sobre o processo de doações de alimentos.",
  alternates: {
    canonical: "/privacidade",
  },
};

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900">
      <section className="mx-auto max-w-4xl space-y-6">
        <header className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-zinc-200">
          <p className="mb-2 text-sm font-medium uppercase tracking-wide text-emerald-700">
            Centro Tucxa · Sementinha
          </p>
          <h1 className="text-4xl font-bold tracking-tight">
            Aviso de privacidade
          </h1>
          <p className="mt-4 text-lg leading-8 text-zinc-700">
            Esta página explica, de forma simples, como serão tratadas as
            respostas da pesquisa sobre o processo de doações de alimentos do
            Sementinha.
          </p>
        </header>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
          <h2 className="text-2xl font-bold">Finalidade da pesquisa</h2>
          <p className="mt-3 leading-7 text-zinc-700">
            As respostas serão usadas para entender as principais dificuldades
            do processo de recebimento, estoque, validade, montagem de cestas,
            distribuição e prestação de contas. O objetivo é desenhar uma
            primeira versão de sistema que ajude coordenadores e voluntários.
          </p>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
          <h2 className="text-2xl font-bold">Quais dados são solicitados</h2>
          <div className="mt-3 space-y-3 leading-7 text-zinc-700">
            <p>
              A identificação é opcional. A pessoa pode responder sem informar
              o nome. Caso escolha se identificar, serão solicitados nome e,
              opcionalmente, um contato.
            </p>
            <p>
              A pesquisa também coleta respostas sobre a participação no
              Sementinha, dificuldades percebidas, etapas críticas,
              funcionalidades desejadas e comentários livres.
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-950">
          <h2 className="text-2xl font-bold">O que não é solicitado</h2>
          <p className="mt-3 leading-7">
            Esta pesquisa não solicita senha, cartão, pagamento, Pix, dados
            bancários, código de autenticação, documento financeiro ou qualquer
            tipo de transferência de valor.
          </p>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
          <h2 className="text-2xl font-bold">Quem poderá ver as respostas</h2>
          <p className="mt-3 leading-7 text-zinc-700">
            As respostas serão acessadas apenas por pessoas autorizadas pela
            diretoria/coordenação do projeto, com a finalidade de analisar as
            necessidades do Sementinha e planejar os próximos passos do sistema.
          </p>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
          <h2 className="text-2xl font-bold">Uso responsável das informações</h2>
          <p className="mt-3 leading-7 text-zinc-700">
            Os dados não devem ser usados para avaliar, expor ou cobrar
            voluntários. A proposta é apoiar o trabalho coletivo, reduzir
            retrabalho e melhorar a organização do processo de alimentos.
          </p>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="rounded-2xl border border-zinc-300 px-5 py-4 text-center font-bold text-zinc-800 transition hover:bg-zinc-100"
          >
            Voltar para o início
          </Link>
          <Link
            href="/pesquisa-sementinha"
            className="rounded-2xl bg-emerald-700 px-5 py-4 text-center font-bold text-white transition hover:bg-emerald-800"
          >
            Abrir pesquisa
          </Link>
        </div>
      </section>
    </main>
  );
}
