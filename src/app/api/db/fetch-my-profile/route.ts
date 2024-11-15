import { userProfileDto } from "@/app/_dto/fetch-profile/Profile.dto";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../functions/web/verify-jwt";

export async function GET(req: NextRequest) {
  const prisma = new PrismaClient();
  const token = req.cookies.get("jwtToken")?.value;

  try {
    if (!token) {
      throw new Error("No token");
    }
    const { handle } = await verifyToken(token);
    const userProfile = await prisma.profile.findUnique({
      where: {
        handle: handle,
      },
    });
    if (!userProfile) {
      return NextResponse.json({ message: `User not found` }, { status: 404 });
    }
    const res: userProfileDto = {
      handle: userProfile.handle,
      name: userProfile.name,
      stopNewQuestion: userProfile.stopNewQuestion,
      stopAnonQuestion: userProfile.stopAnonQuestion,
      avatarUrl: userProfile.avatarUrl,
      questionBoxName: userProfile.questionBoxName,
      stopNotiNewQuestion: userProfile.stopNotiNewQuestion,
      stopPostAnswer: userProfile.stopPostAnswer,
    };

    return NextResponse.json(res);
  } catch (err) {
    return NextResponse.json(
      { message: `Bad Request: ${err}` },
      { status: 400 }
    );
  }
}
