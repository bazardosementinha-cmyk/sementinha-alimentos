import Link from "next/link";
import {
  getSurveyAdminData,
  type OptionCount,
  type CommentItem,
} from "@/lib/sementinha-survey-admin";
import { hasSupabaseAdminConfig, isAdminTokenValid } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Pesquisa Sementinha | Tucxa",
  description:
    "Painel inicial para acompanhar respostas da pesquisa do Sementinha.",
};

type PageProps = {
  searchParams?: Promise<{
    token?: string;
  }>;
};

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}

function RankingCard({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: OptionCount[];
}) {
  const maxCount = Math.max(...items.map((item) => item.count), 1);

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-zinc-950">{title}</h2>
        <p className="mt-1 text-sm text-zinc-600">{description}</p>
      </div>

      {items.length === 0 ? (
        <p className="rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-600">
          Ainda não há respostas suficientes para este indicador.
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.option}>
              <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-zinc-800">{item.option}</span>
                <span className="shrink-0 text-zinc-600">
                  {item.count} · {item.percentage}%
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="h-full rounded-full bg-emerald-700"
                  style={{ width: `${Math.max((item.count / maxCount) * 100, 8)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function CommentCard({ comment }: { comment: CommentItem }) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
      <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-medium text-zinc-900">{comment.respondentName}</p>
        <p className="text-sm text-zinc-500">{formatDate(comment.createdAt)}</p>
      </div>
      <p className="mb-2 text-sm font-medium text-emerald-800">
        {comment.questionLabel}
      </p>
      <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-700">
        {comment.text}
      </p>
    </article>
  );
}

function AccessDenied() {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900">
      <section className="mx-auto max-w-2xl rounded-3xl bg-white p-6 shadow-sm ring-1 ring-red-200">
        <p className="mb-2 text-sm font-medium uppercase tracking-wide text-red-700">
          Acesso restrito
        </p>
        <h1 className="mb-3 text-2xl font-bold">Token administrativo inválido</h1>
        <p className="leading-7 text-zinc-700">
          Acesse usando o link administrativo com o parâmetro de segurança:
        </p>
        <pre className="mt-4 overflow-x-auto rounded-2xl bg-zinc-950 p-4 text-sm text-zinc-50">
          /admin/pesquisa-sementinha?token=SEU_TOKEN
        </pre>
      </section>
    </main>
  );
}

function MissingConfig() {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900">
      <section className="mx-auto max-w-2xl rounded-3xl bg-white p-6 shadow-sm ring-1 ring-amber-200">
        <p className="mb-2 text-sm font-medium uppercase tracking-wide text-amber-700">
          Configuração pendente
        </p>
        <h1 className="mb-3 text-2xl font-bold">
          Configure a chave administrativa do Supabase
        </h1>
        <p className="leading-7 text-zinc-700">
          Para ler as respostas no servidor sem liberar leitura pública no
          Supabase, configure as variáveis abaixo no arquivo local e na Vercel.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-2xl bg-zinc-950 p-4 text-sm text-zinc-50">
          {`NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_ACCESS_TOKEN=crie-um-token-forte`}
        </pre>
      </section>
    </main>
  );
}

export default async function AdminPesquisaSementinhaPage({
  searchParams,
}: PageProps) {
  const resolvedSearchParams = await searchParams;
  const token = resolvedSearchParams?.token;

  if (!isAdminTokenValid(token)) {
    return <AccessDenied />;
  }

  if (!hasSupabaseAdminConfig()) {
    return <MissingConfig />;
  }

  const data = await getSurveyAdminData();
  const exportHref = token
    ? `/admin/pesquisa-sementinha/export?token=${encodeURIComponent(token)}`
    : "/admin/pesquisa-sementinha/export";

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-900">
      <section className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="mb-2 text-sm font-medium uppercase tracking-wide text-emerald-700">
                Centro Tucxa · Sementinha
              </p>
              <h1 className="text-3xl font-bold tracking-tight">
                Painel da pesquisa sobre doações de alimentos
              </h1>
              <p className="mt-3 max-w-3xl leading-7 text-zinc-700">
                Visão inicial para a diretoria e coordenação acompanharem o que
                foi respondido, priorizarem dores e prepararem a reunião de
                definição do MVP.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row md:flex-col lg:flex-row">
              <Link
                href="/pesquisa-sementinha"
                className="rounded-2xl border border-zinc-300 px-4 py-3 text-center font-medium text-zinc-800 transition hover:bg-zinc-50"
              >
                Abrir pesquisa
              </Link>
              <a
                href={exportHref}
                className="rounded-2xl bg-emerald-700 px-4 py-3 text-center font-bold text-white transition hover:bg-emerald-800"
              >
                Exportar CSV
              </a>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
            <p className="text-sm font-medium text-zinc-600">Total de respostas</p>
            <p className="mt-2 text-4xl font-bold text-emerald-800">
              {data.totalResponses}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
            <p className="text-sm font-medium text-zinc-600">Primeira resposta</p>
            <p className="mt-2 text-2xl font-bold text-zinc-950">
              {formatDate(data.startedAt)}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
            <p className="text-sm font-medium text-zinc-600">Última resposta</p>
            <p className="mt-2 text-2xl font-bold text-zinc-950">
              {formatDate(data.lastResponseAt)}
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <RankingCard
            title="Principais dores marcadas"
            description="Respostas da pergunta sobre preocupação ou desconforto."
            items={data.mainPains}
          />
          <RankingCard
            title="Funcionalidades mais votadas"
            description="Prioridades sugeridas para a primeira versão do sistema."
            items={data.mostVotedFeatures}
          />
          <RankingCard
            title="Etapas mais críticas"
            description="Ponto único escolhido como etapa mais sensível do processo."
            items={data.criticalSteps}
          />
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
          <h2 className="text-xl font-bold text-zinc-950">
            Resumo para reunião da presidência/coordenadores
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Texto inicial para orientar a conversa e transformar respostas em
            requisitos do MVP (minimum value product - produto mínimo viável).
          </p>

          <div className="mt-5 space-y-3">
            {data.meetingSummary.map((item) => (
              <p
                key={item}
                className="rounded-2xl bg-emerald-50 p-4 leading-7 text-emerald-950 ring-1 ring-emerald-100"
              >
                {item}
              </p>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-zinc-950">
                Comentários abertos
              </h2>
              <p className="mt-1 text-sm text-zinc-600">
                Inclui comentários opcionais e a resposta sobre o que não pode
                faltar no sistema.
              </p>
            </div>
            <span className="w-fit rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-700">
              {data.openComments.length} comentário
              {data.openComments.length === 1 ? "" : "s"}
            </span>
          </div>

          {data.openComments.length === 0 ? (
            <p className="rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-600">
              Ainda não há comentários abertos.
            </p>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {data.openComments.map((comment) => (
                <CommentCard key={comment.id} comment={comment} />
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
