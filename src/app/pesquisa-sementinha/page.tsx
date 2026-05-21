import PesquisaSementinhaForm from "./PesquisaSementinhaForm";

export const metadata = {
  title: "Pesquisa Sementinha | Tucxa",
  description:
    "Pesquisa com coordenadores e voluntários do Sementinha para melhorar o processo de doações de alimentos.",
};

export default function PesquisaSementinhaPage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-900">
      <section className="mx-auto max-w-3xl">
        <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
          <p className="mb-2 text-sm font-medium uppercase tracking-wide text-emerald-700">
            Centro Tucxa · Sementinha
          </p>

          <h1 className="mb-4 text-3xl font-bold tracking-tight">
            Pesquisa para melhorar o processo de doações de alimentos
          </h1>

          <div className="space-y-3 text-base leading-7 text-zinc-700">
            <p>
              Esta pesquisa foi criada para ouvir quem vive o processo do
              Sementinha na prática. As respostas vão ajudar a desenhar uma
              primeira versão de sistema simples, útil e respeitosa com o
              trabalho voluntário.
            </p>

            <p>
              O objetivo não é avaliar pessoas, apontar falhas ou aumentar
              burocracia. O objetivo é entender onde há mais dificuldade,
              retrabalho, risco ou sobrecarga, para que a tecnologia ajude no
              que realmente importa.
            </p>

            <p className="font-medium text-zinc-900">
              Tempo estimado: 8 a 12 minutos.
            </p>
          </div>
        </div>

        <PesquisaSementinhaForm />
      </section>
    </main>
  );
}