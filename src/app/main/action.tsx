"use server";

import { PrismaClient } from "@prisma/client";
import type { answers, postQuestion } from "..";
import { cookies } from "next/headers";

export async function fetchCookies(cookie: string) {
  const cookieStore = await cookies();
  const jwtToken = cookieStore.get(cookie);

  if (jwtToken) {
    return jwtToken;
  } else {
    return undefined;
  }
}

export async function fetchMainAnswers() {
  const prisma = new PrismaClient();

  const answers: answers[] = await prisma.answer.findMany({});

  return answers;
}

export async function postAnswers(payload: postQuestion) {
  const res = await fetch("/api/db/post-answers", {
    method: "POST",
    body: JSON.stringify(payload),
  }).then((r) => r.json());

  return res;
}
