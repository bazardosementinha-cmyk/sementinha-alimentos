"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  getQuestionInputHint,
  questions,
  roleOptions,
} from "@/lib/sementinha-survey";

type AnswersState = Record<
  string,
  {
    selectedOptions: string[];
    answerText: string;
    comment: string;
  }
>;

type ValidationResult = {
  key: string;
  message: string;
} | null;

function getQuestionSectionId(questionKey: string) {
  return `question-${questionKey}`;
}

function isQuestionAnswered(
  questionKey: string,
  answers: AnswersState,
  questionType: "single" | "multiple" | "text",
) {
  const answer = answers[questionKey];

  if (!answer) return false;

  if (questionType === "text") {
    return answer.answerText.trim().length >= 5;
  }

  return answer.selectedOptions.length > 0;
}

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

  const [wantsIdentification, setWantsIdentification] = useState<boolean | null>(
    null,
  );
  const [respondentName, setRespondentName] = useState("");
  const [respondentContact, setRespondentContact] = useState("");
  const [respondentRole, setRespondentRole] = useState<string[]>([]);
  const [answers, setAnswers] = useState<AnswersState>(initialAnswers);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [invalidKey, setInvalidKey] = useState<string | null>(null);

  function clearInvalidState(key: string) {
    if (invalidKey === key) {
      setInvalidKey(null);
      setErrorMessage("");
    }
  }

  function toggleRole(role: string) {
    setRespondentRole((current) =>
      current.includes(role)
        ? current.filter((item) => item !== role)
        : [...current, role],
    );
    clearInvalidState("respondentRole");
  }

  function updateSingle(questionKey: string, option: string) {
    setAnswers((current) => ({
      ...current,
      [questionKey]: {
        ...current[questionKey],
        selectedOptions: [option],
      },
    }));
    clearInvalidState(questionKey);
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
    clearInvalidState(questionKey);
  }

  function updateText(questionKey: string, value: string) {
    setAnswers((current) => ({
      ...current,
      [questionKey]: {
        ...current[questionKey],
        answerText: value,
      },
    }));
    clearInvalidState(questionKey);
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

  function validateForm(): ValidationResult {
    if (wantsIdentification === null) {
      return {
        key: "wantsIdentification",
        message: "Selecione se deseja se identificar ou responder sem se identificar.",
      };
    }

    if (wantsIdentification && respondentName.trim().length < 2) {
      return {
        key: "respondentName",
        message:
          "Informe seu nome ou marque a opção de responder sem se identificar.",
      };
    }

    if (respondentRole.length === 0) {
      return {
        key: "respondentRole",
        message: "Selecione pelo menos uma forma de participação no Sementinha.",
      };
    }

    for (const question of questions) {
      if (!question.required) continue;

      const isAnswered = isQuestionAnswered(question.key, answers, question.type);

      if (!isAnswered && question.type === "text") {
        return {
          key: question.key,
          message: `Responda a pergunta: ${question.label}`,
        };
      }

      if (!isAnswered) {
        return {
          key: question.key,
          message: `Selecione pelo menos uma opção na pergunta: ${question.label}`,
        };
      }
    }

    return null;
  }

  function scrollToInvalidField(key: string) {
    const elementId =
      key === "wantsIdentification" ||
      key === "respondentName" ||
      key === "respondentRole"
        ? "identificacao-section"
        : getQuestionSectionId(key);

    window.setTimeout(() => {
      document.getElementById(elementId)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 50);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    const validationError = validateForm();

    if (validationError) {
      setInvalidKey(validationError.key);
      setErrorMessage(validationError.message);
      scrollToInvalidField(validationError.key);
      return;
    }

    setInvalidKey(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/pesquisa-sementinha/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wantsIdentification,
          respondentName,
          respondentContact,
          respondentRole,
          answers,
        }),
      });

      const result = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(
          result?.error ??
            "Não foi possível enviar sua resposta agora. Por favor, tente novamente em alguns instantes.",
        );
      }

      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar sua resposta agora. Por favor, tente novamente em alguns instantes.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function getCardClassName(key: string) {
    const isInvalid = invalidKey === key;

    return [
      "rounded-3xl bg-white p-6 shadow-sm ring-1 transition",
      isInvalid ? "ring-red-300 bg-red-50/40" : "ring-zinc-200",
    ].join(" ");
  }

  function getOptionClassName(isSelected: boolean) {
    return [
      "flex items-start gap-3 rounded-xl border p-3 transition",
      isSelected
        ? "border-emerald-300 bg-emerald-50"
        : "border-zinc-200 bg-white",
    ].join(" ");
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
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <section id="identificacao-section" className={getCardClassName("wantsIdentification")}>
        <h2 className="mb-4 text-xl font-bold">Identificação</h2>

        <fieldset>
          <legend className="mb-3 font-medium">
            Você deseja se identificar? <span className="text-red-700">*</span>
          </legend>
          <p className="mb-3 text-sm text-zinc-600">Selecione apenas uma opção.</p>

          <div className="space-y-2">
            <label
              className={getOptionClassName(wantsIdentification === true)}
            >
              <input
                type="radio"
                name="wantsIdentification"
                checked={wantsIdentification === true}
                onChange={() => {
                  setWantsIdentification(true);
                  clearInvalidState("wantsIdentification");
                }}
                className="mt-1"
                required
              />
              <span>Sim, posso me identificar.</span>
            </label>

            <label
              className={getOptionClassName(wantsIdentification === false)}
            >
              <input
                type="radio"
                name="wantsIdentification"
                checked={wantsIdentification === false}
                onChange={() => {
                  setWantsIdentification(false);
                  clearInvalidState("wantsIdentification");
                }}
                className="mt-1"
                required
              />
              <span>Prefiro responder sem me identificar.</span>
            </label>
          </div>
        </fieldset>

        {wantsIdentification && (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block font-medium">
                Nome <span className="text-red-700">*</span>
              </span>
              <input
                value={respondentName}
                onChange={(event) => {
                  setRespondentName(event.target.value);
                  clearInvalidState("respondentName");
                }}
                className={[
                  "w-full rounded-xl border px-3 py-2 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100",
                  invalidKey === "respondentName"
                    ? "border-red-400 bg-red-50"
                    : "border-zinc-300",
                ].join(" ")}
                placeholder="Seu nome"
                required={wantsIdentification === true}
                aria-invalid={invalidKey === "respondentName"}
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
            Qual é sua participação no Sementinha?{" "}
            <span className="text-red-700">*</span>
          </legend>
          <p className="mb-3 text-sm text-zinc-600">
            Pode selecionar mais de uma opção.
          </p>

          <div className="grid gap-2 md:grid-cols-2">
            {roleOptions.map((role) => (
              <label
                key={role}
                className={getOptionClassName(respondentRole.includes(role))}
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

        {(invalidKey === "wantsIdentification" ||
          invalidKey === "respondentName" ||
          invalidKey === "respondentRole") && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
            {errorMessage}
          </p>
        )}
      </section>

      {questions.map((question, index) => {
        const answer = answers[question.key];
        const isInvalid = invalidKey === question.key;

        return (
          <section
            id={getQuestionSectionId(question.key)}
            key={question.key}
            className={getCardClassName(question.key)}
          >
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="mb-2 text-sm font-medium text-emerald-700">
                  Pergunta {index + 1}
                </p>
                <h2 className="text-xl font-bold">
                  {question.label}{" "}
                  {question.required && <span className="text-red-700">*</span>}
                </h2>
              </div>

              <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800 ring-1 ring-emerald-100">
                {getQuestionInputHint(question.type)}
              </span>
            </div>

            {question.type === "text" && (
              <textarea
                value={answer.answerText}
                onChange={(event) =>
                  updateText(question.key, event.target.value)
                }
                className={[
                  "min-h-32 w-full rounded-xl border px-3 py-2 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100",
                  isInvalid ? "border-red-400 bg-red-50" : "border-zinc-300",
                ].join(" ")}
                placeholder="Escreva sua resposta..."
                required={question.required}
                aria-invalid={isInvalid}
              />
            )}

            {question.type === "single" && (
              <div className="space-y-2">
                {question.options?.map((option) => (
                  <label
                    key={option}
                    className={getOptionClassName(
                      answer.selectedOptions.includes(option),
                    )}
                  >
                    <input
                      type="radio"
                      name={question.key}
                      checked={answer.selectedOptions.includes(option)}
                      onChange={() => updateSingle(question.key, option)}
                      className="mt-1"
                      required={question.required}
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
                    className={getOptionClassName(
                      answer.selectedOptions.includes(option),
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={answer.selectedOptions.includes(option)}
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
                  value={answer.comment}
                  onChange={(event) =>
                    updateComment(question.key, event.target.value)
                  }
                  className="min-h-24 w-full rounded-xl border border-zinc-300 px-3 py-2 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                  placeholder="Use este espaço se quiser explicar melhor..."
                />
              </label>
            )}

            {isInvalid && (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
                {errorMessage}
              </p>
            )}
          </section>
        );
      })}

      {errorMessage && !invalidKey && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
          {errorMessage}
        </div>
      )}

      {errorMessage && invalidKey && (
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
