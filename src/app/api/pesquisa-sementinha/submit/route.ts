import { NextRequest, NextResponse } from "next/server";
import { questions, roleOptions, type QuestionType } from "@/lib/sementinha-survey";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type SubmittedAnswer = {
  selectedOptions?: unknown;
  answerText?: unknown;
  comment?: unknown;
};

type SubmitSurveyPayload = {
  wantsIdentification?: unknown;
  respondentName?: unknown;
  respondentContact?: unknown;
  respondentRole?: unknown;
  answers?: unknown;
};

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getAnswerByQuestion(
  answers: unknown,
  questionKey: string,
): SubmittedAnswer {
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
    return {};
  }

  const answer = (answers as Record<string, unknown>)[questionKey];

  if (!answer || typeof answer !== "object" || Array.isArray(answer)) {
    return {};
  }

  return answer as SubmittedAnswer;
}

function validateOptions(
  type: QuestionType,
  selectedOptions: string[],
  allowedOptions?: string[],
) {
  if (type === "text") return true;
  if (!allowedOptions || allowedOptions.length === 0) return false;
  if (type === "single" && selectedOptions.length !== 1) return false;
  if (type === "multiple" && selectedOptions.length < 1) return false;

  return selectedOptions.every((option) => allowedOptions.includes(option));
}

function validatePayload(payload: SubmitSurveyPayload) {
  const wantsIdentification = payload.wantsIdentification === true;
  const respondentName = normalizeText(payload.respondentName);
  const respondentContact = normalizeText(payload.respondentContact);
  const respondentRole = normalizeStringArray(payload.respondentRole);

  if (wantsIdentification && respondentName.length < 2) {
    return {
      ok: false as const,
      message: "Informe seu nome ou responda sem se identificar.",
    };
  }

  if (respondentRole.length === 0) {
    return {
      ok: false as const,
      message: "Selecione pelo menos uma forma de participação no Sementinha.",
    };
  }

  const invalidRole = respondentRole.find((role) => !roleOptions.includes(role));

  if (invalidRole) {
    return {
      ok: false as const,
      message: `Participação inválida: ${invalidRole}`,
    };
  }

  const normalizedAnswers = questions.map((question) => {
    const answer = getAnswerByQuestion(payload.answers, question.key);
    const selectedOptions = normalizeStringArray(answer.selectedOptions);
    const answerText = normalizeText(answer.answerText);
    const comment = normalizeText(answer.comment);

    if (question.required) {
      if (question.type === "text" && answerText.length < 5) {
        return {
          ok: false as const,
          message: `Responda a pergunta: ${question.label}`,
        };
      }

      if (
        (question.type === "single" || question.type === "multiple") &&
        selectedOptions.length === 0
      ) {
        return {
          ok: false as const,
          message: `Selecione pelo menos uma opção na pergunta: ${question.label}`,
        };
      }
    }

    if (!validateOptions(question.type, selectedOptions, question.options)) {
      return {
        ok: false as const,
        message: `Há uma opção inválida na pergunta: ${question.label}`,
      };
    }

    return {
      ok: true as const,
      row: {
        question_key: question.key,
        question_label: question.label,
        answer_type: question.type,
        selected_options: selectedOptions,
        answer_text: answerText || null,
        comment: comment || null,
      },
    };
  });

  const invalidAnswer = normalizedAnswers.find((answer) => !answer.ok);

  if (invalidAnswer && !invalidAnswer.ok) {
    return {
      ok: false as const,
      message: invalidAnswer.message,
    };
  }

  return {
    ok: true as const,
    data: {
      wantsIdentification,
      respondentName,
      respondentContact,
      respondentRole,
      answerRows: normalizedAnswers.map((answer) => {
        if (!answer.ok) throw new Error("Resposta inválida inesperada.");
        return answer.row;
      }),
    },
  };
}

export async function POST(request: NextRequest) {
  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json(
      {
        error:
          "Configuração do servidor ausente. Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY na Vercel.",
      },
      { status: 500 },
    );
  }

  let payload: SubmitSurveyPayload;

  try {
    payload = (await request.json()) as SubmitSurveyPayload;
  } catch {
    return NextResponse.json(
      { error: "Não foi possível ler os dados enviados pelo formulário." },
      { status: 400 },
    );
  }

  const validation = validatePayload(payload);

  if (!validation.ok) {
    return NextResponse.json({ error: validation.message }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  const { data: responseData, error: responseError } = await supabase
    .from("sementinha_survey_responses")
    .insert({
      wants_identification: validation.data.wantsIdentification,
      respondent_name: validation.data.wantsIdentification
        ? validation.data.respondentName
        : null,
      respondent_contact: validation.data.wantsIdentification
        ? validation.data.respondentContact || null
        : null,
      respondent_role: validation.data.respondentRole,
    })
    .select("id")
    .single();

  if (responseError || !responseData) {
    console.error("Erro ao salvar cabeçalho da pesquisa Sementinha", responseError);

    return NextResponse.json(
      {
        error:
          "Não foi possível salvar a resposta principal. Confira as tabelas e a chave SUPABASE_SERVICE_ROLE_KEY.",
      },
      { status: 500 },
    );
  }

  const answerRows = validation.data.answerRows.map((row) => ({
    ...row,
    response_id: responseData.id,
  }));

  const { error: answersError } = await supabase
    .from("sementinha_survey_answers")
    .insert(answerRows);

  if (answersError) {
    console.error("Erro ao salvar respostas detalhadas da pesquisa Sementinha", answersError);

    await supabase
      .from("sementinha_survey_responses")
      .delete()
      .eq("id", responseData.id);

    return NextResponse.json(
      {
        error:
          "Não foi possível salvar as respostas detalhadas. A resposta principal foi desfeita para evitar registro incompleto.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, responseId: responseData.id }, { status: 201 });
}
