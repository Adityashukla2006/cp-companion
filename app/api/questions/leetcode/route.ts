import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/app/utils/prisma";

export async function GET() {
  const questions = await prisma.leetcodeQuestion.findMany({
    orderBy: { id: "desc" },
  });

  return NextResponse.json(questions);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = Number(body.id);
  const notes = typeof body.notes === "string" ? body.notes : "";

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "A valid LeetCode question id is required." }, { status: 400 });
  }

  if (!notes.trim()) {
    return NextResponse.json({ error: "Notes are required before saving." }, { status: 400 });
  }

  const question = await prisma.leetcodeQuestion.upsert({
    where: { id },
    create: {
      id,
      title: String(body.title ?? ""),
      description: String(body.description ?? ""),
      difficulty: String(body.difficulty ?? ""),
      hints: Array.isArray(body.hints) ? body.hints.filter((hint: unknown) => typeof hint === "string").join("\n") : String(body.hints ?? ""),
      notes,
      url: String(body.url ?? ""),
    },
    update: {
      title: String(body.title ?? ""),
      description: String(body.description ?? ""),
      difficulty: String(body.difficulty ?? ""),
      hints: Array.isArray(body.hints) ? body.hints.filter((hint: unknown) => typeof hint === "string").join("\n") : String(body.hints ?? ""),
      notes,
      url: String(body.url ?? ""),
    },
  });

  return NextResponse.json(question);
}

export async function DELETE(req: NextRequest) {
  const id = Number(req.nextUrl.searchParams.get("id"));

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "A valid LeetCode question id is required." }, { status: 400 });
  }

  await prisma.leetcodeQuestion.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
