import { questions } from "@/lib/sementinha-survey";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

type SurveyResponseRow = {
  id: string;
  wants_identification: boolean;
  respondent_name: string | null;
  respondent_contact: string | null;
  respondent_role: string[] | null;
  created_at: string;
};

type SurveyAnswerRow = {
  id: string;
  response_id: string;
  question_key: string;
  question_label: string;
  answer_type: "single" | "multiple" | "text";
  selected_options: string[] | null;
  answer_text: string | null;
  comment: string | null;
  created_at: string;
};

export type OptionCount = {
  option: string;
  count: number;
  percentage: number;
};

export type CommentItem = {
  id: string;
  createdAt: string;
  respondentName: string;
  questionLabel: string;
  text: string;
};

export type SurveyAdminData = {
  responses: SurveyResponseRow[];
  answers: SurveyAnswerRow[];
  totalResponses: number;
  startedAt: string | null;
  lastResponseAt: string | null;
  mainPains: OptionCount[];
  mostVotedFeatures: OptionCount[];
  criticalSteps: OptionCount[];
  openComments: CommentItem[];
  meetingSummary: string[];
};

const questionMap = new Map(questions.map((question) => [question.key, question]));

function getRespondentName(
  responsesById: Map<string, SurveyResponseRow>,
  responseId: string,
) {
  const response = responsesById.get(responseId);

  if (!response?.wants_identification || !response.respondent_name) {
    return "Resposta sem identificação";
  }

  return response.respondent_name;
}

function countSelectedOptions(
  answers: SurveyAnswerRow[],
  questionKey: string,
  totalResponses: number,
): OptionCount[] {
  const counts = new Map<string, number>();
  const question = questionMap.get(questionKey);

  question?.options?.forEach((option) => counts.set(option, 0));

  answers
    .filter((answer) => answer.question_key === questionKey)
    .forEach((answer) => {
      answer.selected_options?.forEach((option) => {
        counts.set(option, (counts.get(option) ?? 0) + 1);
      });
    });

  return Array.from(counts.entries())
    .map(([option, count]) => ({
      option,
      count,
      percentage: totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0,
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count || a.option.localeCompare(b.option, "pt-BR"));
}

function getOpenComments(
  responsesById: Map<string, SurveyResponseRow>,
  answers: SurveyAnswerRow[],
): CommentItem[] {
  const items: CommentItem[] = [];

  answers.forEach((answer) => {
    const comment = answer.comment?.trim();
    const answerText = answer.answer_text?.trim();

    if (comment) {
      items.push({
        id: `${answer.id}-comment`,
        createdAt: answer.created_at,
        respondentName: getRespondentName(responsesById, answer.response_id),
        questionLabel: answer.question_label,
        text: comment,
      });
    }

    if (answer.question_key === "nao_pode_faltar" && answerText) {
      items.push({
        id: `${answer.id}-text`,
        createdAt: answer.created_at,
        respondentName: getRespondentName(responsesById, answer.response_id),
        questionLabel: answer.question_label,
        text: answerText,
      });
    }
  });

  return items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function firstOptionText(items: OptionCount[], fallback: string) {
  return items[0]
    ? `${items[0].option} (${items[0].count} marcações, ${items[0].percentage}%)`
    : fallback;
}

function buildMeetingSummary(data: {
  totalResponses: number;
  mainPains: OptionCount[];
  mostVotedFeatures: OptionCount[];
  criticalSteps: OptionCount[];
  openComments: CommentItem[];
}) {
  const summary: string[] = [];

  summary.push(
    `A pesquisa recebeu ${data.totalResponses} resposta${data.totalResponses === 1 ? "" : "s"} até o momento.`,
  );

  if (data.totalResponses === 0) {
    summary.push(
      "Ainda não há volume suficiente para priorizar o MVP. O próximo passo é reforçar o envio do link aos coordenadores e voluntários.",
    );
    return summary;
  }

  summary.push(
    `A principal dor marcada foi: ${firstOptionText(data.mainPains, "ainda sem dor predominante")}.`,
  );
  summary.push(
    `A funcionalidade mais votada para a primeira versão foi: ${firstOptionText(data.mostVotedFeatures, "ainda sem funcionalidade predominante")}.`,
  );
  summary.push(
    `A etapa considerada mais crítica foi: ${firstOptionText(data.criticalSteps, "ainda sem etapa predominante")}.`,
  );

  if (data.openComments.length > 0) {
    summary.push(
      `Há ${data.openComments.length} comentário${data.openComments.length === 1 ? " aberto" : "s abertos"} que devem ser lidos antes da definição final do MVP.`,
    );
  }

  summary.push(
    "Recomendação: usar estes dados para validar quais telas entram primeiro: cadastro de doações, controle de estoque, validade, distribuição e relatório inicial.",
  );

  return summary;
}

export async function getSurveyAdminData(): Promise<SurveyAdminData> {
  const supabase = createSupabaseAdminClient();

  const { data: responsesData, error: responsesError } = await supabase
    .from("sementinha_survey_responses")
    .select("id,wants_identification,respondent_name,respondent_contact,respondent_role,created_at")
    .order("created_at", { ascending: false });

  if (responsesError) {
    throw responsesError;
  }

  const { data: answersData, error: answersError } = await supabase
    .from("sementinha_survey_answers")
    .select("id,response_id,question_key,question_label,answer_type,selected_options,answer_text,comment,created_at")
    .order("created_at", { ascending: false });

  if (answersError) {
    throw answersError;
  }

  const responses = (responsesData ?? []) as SurveyResponseRow[];
  const answers = (answersData ?? []) as SurveyAnswerRow[];
  const responsesById = new Map(responses.map((response) => [response.id, response]));
  const totalResponses = responses.length;
  const mainPains = countSelectedOptions(answers, "preocupacoes", totalResponses);
  const mostVotedFeatures = countSelectedOptions(answers, "funcionalidades_mvp", totalResponses);
  const criticalSteps = countSelectedOptions(answers, "etapa_mais_critica", totalResponses);
  const openComments = getOpenComments(responsesById, answers);

  return {
    responses,
    answers,
    totalResponses,
    startedAt: responses.length > 0 ? responses[responses.length - 1].created_at : null,
    lastResponseAt: responses[0]?.created_at ?? null,
    mainPains,
    mostVotedFeatures,
    criticalSteps,
    openComments,
    meetingSummary: buildMeetingSummary({
      totalResponses,
      mainPains,
      mostVotedFeatures,
      criticalSteps,
      openComments,
    }),
  };
}

function escapeCsvValue(value: unknown) {
  const stringValue = Array.isArray(value)
    ? value.join(" | ")
    : value === null || value === undefined
      ? ""
      : String(value);

  return `"${stringValue.replaceAll('"', '""')}"`;
}

export function buildSurveyCsv(data: SurveyAdminData) {
  const responsesById = new Map(data.responses.map((response) => [response.id, response]));
  const header = [
    "response_id",
    "data_resposta",
    "identificado",
    "nome",
    "contato",
    "participacao",
    "pergunta_chave",
    "pergunta",
    "tipo_resposta",
    "opcoes_selecionadas",
    "resposta_texto",
    "comentario",
  ];

  const rows = data.answers.map((answer) => {
    const response = responsesById.get(answer.response_id);

    return [
      answer.response_id,
      response?.created_at ?? answer.created_at,
      response?.wants_identification ? "sim" : "não",
      response?.wants_identification ? response?.respondent_name : "",
      response?.wants_identification ? response?.respondent_contact : "",
      response?.respondent_role ?? [],
      answer.question_key,
      answer.question_label,
      answer.answer_type,
      answer.selected_options ?? [],
      answer.answer_text ?? "",
      answer.comment ?? "",
    ];
  });

  return [header, ...rows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n");
}
