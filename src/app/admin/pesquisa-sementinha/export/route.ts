import { NextRequest, NextResponse } from "next/server";
import {
  buildSurveyCsv,
  getSurveyAdminData,
} from "@/lib/sementinha-survey-admin";
import { hasSupabaseAdminConfig, isAdminTokenValid } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!isAdminTokenValid(token)) {
    return NextResponse.json(
      { error: "Token administrativo inválido." },
      { status: 401 },
    );
  }

  if (!hasSupabaseAdminConfig()) {
    return NextResponse.json(
      { error: "Configuração administrativa do Supabase ausente." },
      { status: 500 },
    );
  }

  const data = await getSurveyAdminData();
  const csv = buildSurveyCsv(data);
  const fileName = `pesquisa-sementinha-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(`\ufeff${csv}`, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
