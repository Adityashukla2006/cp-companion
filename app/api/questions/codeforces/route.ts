import { NextRequest, NextResponse } from "next/server";

import { normalizeCodeforcesDescription } from "@/app/utils/codeforcesDescription";
import { prisma } from "@/app/utils/prisma";

export async function GET() {
  const questions = await prisma.codeforcesQuestion.findMany({
    orderBy: { id: "desc" },
  });

  return NextResponse.json(questions);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const notes = typeof body.notes === "string" ? body.notes : "";
  const contestName = typeof body.contestName === "string" ? body.contestName : "";
  const description = normalizeCodeforcesDescription(typeof body.description === "string" ? body.description : "");

  if (!contestName.trim() || !description.trim() || !notes.trim()) {
    return NextResponse.json({ error: "Contest name, description, and notes are required." }, { status: 400 });
  }

  const maxId = await prisma.codeforcesQuestion.aggregate({
    _max: { id: true },
  });

  const question = await prisma.codeforcesQuestion.create({
    data: {
      id: (maxId._max.id ?? 0) + 1,
      contestName,
      timeLimit: String(body.timeLimit ?? ""),
      memoryLimit: String(body.memoryLimit ?? ""),
      description,
      notes,
      url: String(body.url ?? ""),
    },
  });

  return NextResponse.json(question, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const id = Number(body.id);
  const notes = typeof body.notes === "string" ? body.notes : "";
  const contestName = typeof body.contestName === "string" ? body.contestName : "";
  const description = normalizeCodeforcesDescription(typeof body.description === "string" ? body.description : "");

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "A valid question id is required." }, { status: 400 });
  }

  if (!contestName.trim() || !description.trim() || !notes.trim()) {
    return NextResponse.json({ error: "Contest name, description, and notes are required." }, { status: 400 });
  }

  const question = await prisma.codeforcesQuestion.update({
    where: { id },
    data: {
      contestName,
      timeLimit: String(body.timeLimit ?? ""),
      memoryLimit: String(body.memoryLimit ?? ""),
      description,
      notes,
      url: String(body.url ?? ""),
    },
  });

  return NextResponse.json(question);
}

export async function DELETE(req: NextRequest) {
  const id = Number(req.nextUrl.searchParams.get("id"));

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "A valid question id is required." }, { status: 400 });
  }

  await prisma.codeforcesQuestion.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
