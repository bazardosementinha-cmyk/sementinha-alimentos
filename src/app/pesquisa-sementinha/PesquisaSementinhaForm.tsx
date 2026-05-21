"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  getQuestionInputHint,
  questions,
  roleOptions,
} from "@/lib/sementinha-survey";
import { supabaseBrowser } from "@/lib/supabase-browser";

type AnswersState = Record<
  string,
  {
    selectedOptions: string[];
    answerText: string;
    comment: string;
  }
>;

export default function PesquisaSementinhaForm() {
  const initialAnswers = useMemo(() => {
    return questions.reduce<AnswersState>((acc, question) => {
      acc[question.key] = {
        selectedOptions: [],
        answerText: "",
        comment: "",
      };
      return acc;
    }, {});
  }, []);

  const [wantsIdentification, setWantsIdentification] = useState(false);
  const [respondentName, setRespondentName] = useState("");
  const [respondentContact, setRespondentContact] = useState("");
  const [respondentRole, setRespondentRole] = useState<string[]>([]);
  const [answers, setAnswers] = useState<AnswersState>(initialAnswers);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function toggleRole(role: string) {
    setRespondentRole((current) =>
      current.includes(role)
        ? current.filter((item) => item !== role)
        : [...current, role],
    );
  }

  function updateSingle(questionKey: string, option: string) {
    setAnswers((current) => ({
      ...current,
      [questionKey]: {
        ...current[questionKey],
        selectedOptions: [option],
      },
    }));
  }

  function toggleMultiple(questionKey: string, option: string) {
    setAnswers((current) => {
      const existing = current[questionKey].selectedOptions;
      const next = existing.includes(option)
        ? existing.filter((item) => item !== option)
        : [...existing, option];

      return {
        ...current,
        [questionKey]: {
          ...current[questionKey],
          selectedOptions: next,
        },
      };
    });
  }

  function updateText(questionKey: string, value: string) {
    setAnswers((current) => ({
      ...current,
      [questionKey]: {
        ...current[questionKey],
        answerText: value,
      },
    }));
  }

  function updateComment(questionKey: string, value: string) {
    setAnswers((current) => ({
      ...current,
      [questionKey]: {
        ...current[questionKey],
        comment: value,
      },
    }));
  }

  function validateForm() {
    if (wantsIdentification && respondentName.trim().length < 2) {
      return "Informe seu nome ou marque que prefere responder sem se identificar.";
    }

    if (respondentRole.length === 0) {
      return "Selecione pelo menos uma forma de participação no Sementinha.";
    }

    for (const question of questions) {
      if (!question.required) continue;

      const answer = answers[question.key];

      if (question.type === "text" && answer.answerText.trim().length < 5) {
        return `Responda a pergunta: ${question.label}`;
      }

      if (
        (question.type === "single" || question.type === "multiple") &&
        answer.selectedOptions.length === 0
      ) {
        return `Selecione pelo menos uma opção na pergunta: ${question.label}`;
      }
    }

    return "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: responseData, error: responseError } = await supabaseBrowser
        .from("sementinha_survey_responses")
        .insert({
          wants_identification: wantsIdentification,
          respondent_name: wantsIdentification ? respondentName.trim() : null,
          respondent_contact: wantsIdentification
            ? respondentContact.trim() || null
            : null,
          respondent_role: respondentRole,
        })
        .select("id")
        .single();

      if (responseError || !responseData) {
        throw responseError ?? new Error("Não foi possível salvar a resposta.");
      }

      const rows = questions.map((question) => ({
        response_id: responseData.id,
        question_key: question.key,
        question_label: question.label,
        answer_type: question.type,
        selected_options: answers[question.key].selectedOptions,
        answer_text: answers[question.key].answerText.trim() || null,
        comment: answers[question.key].comment.trim() || null,
      }));

      const { error: answersError } = await supabaseBrowser
        .from("sementinha_survey_answers")
        .insert(rows);

      if (answersError) {
        throw answersError;
      }

      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error(error);
      setErrorMessage(
        "Não foi possível enviar sua resposta agora. Por favor, tente novamente em alguns instantes.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-emerald-200">
        <h2 className="mb-3 text-2xl font-bold text-emerald-800">
          Resposta enviada com sucesso
        </h2>
        <p className="text-zinc-700">
          Muito obrigado por contribuir. Suas respostas vão ajudar a construir
          um processo mais organizado, leve e seguro para o Sementinha.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
        <h2 className="mb-4 text-xl font-bold">Identificação</h2>

        <fieldset>
          <legend className="mb-3 font-medium">Você deseja se identificar?</legend>
          <p className="mb-3 text-sm text-zinc-600">Selecione apenas uma opção.</p>

          <div className="space-y-2">
            <label className="flex items-start gap-3 rounded-xl border border-zinc-200 p-3">
              <input
                type="radio"
                name="wantsIdentification"
                checked={wantsIdentification}
                onChange={() => setWantsIdentification(true)}
                className="mt-1"
              />
              <span>Sim, posso me identificar.</span>
            </label>

            <label className="flex items-start gap-3 rounded-xl border border-zinc-200 p-3">
              <input
                type="radio"
                name="wantsIdentification"
                checked={!wantsIdentification}
                onChange={() => setWantsIdentification(false)}
                className="mt-1"
              />
              <span>Prefiro responder sem me identificar.</span>
            </label>
          </div>
        </fieldset>

        {wantsIdentification && (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block font-medium">Nome</span>
              <input
                value={respondentName}
                onChange={(event) => setRespondentName(event.target.value)}
                className="w-full rounded-xl border border-zinc-300 px-3 py-2 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                placeholder="Seu nome"
              />
            </label>

            <label className="block">
              <span className="mb-1 block font-medium">Contato opcional</span>
              <input
                value={respondentContact}
                onChange={(event) => setRespondentContact(event.target.value)}
                className="w-full rounded-xl border border-zinc-300 px-3 py-2 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                placeholder="WhatsApp ou e-mail"
              />
            </label>
          </div>
        )}

        <fieldset className="mt-5">
          <legend className="mb-2 font-medium">
            Qual é sua participação no Sementinha?
          </legend>
          <p className="mb-3 text-sm text-zinc-600">
            Pode selecionar mais de uma opção.
          </p>

          <div className="grid gap-2 md:grid-cols-2">
            {roleOptions.map((role) => (
              <label
                key={role}
                className="flex items-start gap-3 rounded-xl border border-zinc-200 p-3"
              >
                <input
                  type="checkbox"
                  checked={respondentRole.includes(role)}
                  onChange={() => toggleRole(role)}
                  className="mt-1"
                />
                <span>{role}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {questions.map((question, index) => (
        <section
          key={question.key}
          className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200"
        >
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="mb-2 text-sm font-medium text-emerald-700">
                Pergunta {index + 1}
              </p>
              <h2 className="text-xl font-bold">{question.label}</h2>
            </div>

            <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800 ring-1 ring-emerald-100">
              {getQuestionInputHint(question.type)}
            </span>
          </div>

          {question.type === "text" && (
            <textarea
              value={answers[question.key].answerText}
              onChange={(event) => updateText(question.key, event.target.value)}
              className="min-h-32 w-full rounded-xl border border-zinc-300 px-3 py-2 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              placeholder="Escreva sua resposta..."
            />
          )}

          {question.type === "single" && (
            <div className="space-y-2">
              {question.options?.map((option) => (
                <label
                  key={option}
                  className="flex items-start gap-3 rounded-xl border border-zinc-200 p-3"
                >
                  <input
                    type="radio"
                    name={question.key}
                    checked={answers[question.key].selectedOptions.includes(
                      option,
                    )}
                    onChange={() => updateSingle(question.key, option)}
                    className="mt-1"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          )}

          {question.type === "multiple" && (
            <div className="grid gap-2 md:grid-cols-2">
              {question.options?.map((option) => (
                <label
                  key={option}
                  className="flex items-start gap-3 rounded-xl border border-zinc-200 p-3"
                >
                  <input
                    type="checkbox"
                    checked={answers[question.key].selectedOptions.includes(
                      option,
                    )}
                    onChange={() => toggleMultiple(question.key, option)}
                    className="mt-1"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          )}

          {question.allowComment && (
            <label className="mt-4 block">
              <span className="mb-1 block font-medium">
                Comentário opcional
              </span>
              <textarea
                value={answers[question.key].comment}
                onChange={(event) =>
                  updateComment(question.key, event.target.value)
                }
                className="min-h-24 w-full rounded-xl border border-zinc-300 px-3 py-2 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                placeholder="Use este espaço se quiser explicar melhor..."
              />
            </label>
          )}
        </section>
      ))}

      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-2xl bg-emerald-700 px-5 py-4 text-lg font-bold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Enviando..." : "Enviar respostas"}
      </button>
    </form>
  );
}
