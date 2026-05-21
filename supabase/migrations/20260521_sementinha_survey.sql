create extension if not exists "pgcrypto";

create table if not exists public.sementinha_survey_responses (
  id uuid primary key default gen_random_uuid(),
  wants_identification boolean not null default false,
  respondent_name text,
  respondent_contact text,
  respondent_role text[] default '{}',
  general_comment text,
  created_at timestamptz not null default now()
);

create table if not exists public.sementinha_survey_answers (
  id uuid primary key default gen_random_uuid(),
  response_id uuid not null references public.sementinha_survey_responses(id) on delete cascade,
  question_key text not null,
  question_label text not null,
  answer_type text not null check (answer_type in ('single', 'multiple', 'text')),
  selected_options text[] default '{}',
  answer_text text,
  comment text,
  created_at timestamptz not null default now()
);

create index if not exists sementinha_survey_answers_response_id_idx
  on public.sementinha_survey_answers(response_id);

create index if not exists sementinha_survey_answers_question_key_idx
  on public.sementinha_survey_answers(question_key);

alter table public.sementinha_survey_responses enable row level security;
alter table public.sementinha_survey_answers enable row level security;

drop policy if exists "Permitir envio publico de respostas Sementinha" on public.sementinha_survey_responses;
drop policy if exists "Permitir envio publico de respostas Sementinha itens" on public.sementinha_survey_answers;

create policy "Permitir envio publico de respostas Sementinha"
on public.sementinha_survey_responses
for insert
to anon
with check (true);

create policy "Permitir envio publico de respostas Sementinha itens"
on public.sementinha_survey_answers
for insert
to anon
with check (true);
