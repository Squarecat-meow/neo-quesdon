"use server";

import { PrismaClient } from "@prisma/client";

export async function fetchAnswer(id: string) {
  const prisma = new PrismaClient();

  const answer = await prisma.answer.findUnique({
    where: {
      id: id,
    },
  });

  if (answer) {
    return answer;
  }
}
