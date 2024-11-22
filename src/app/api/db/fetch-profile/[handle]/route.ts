import {
  userProfileDto,
  userProfileWithHostnameDto,
} from "@/app/_dto/fetch-profile/Profile.dto";
import { sendApiError } from "@/utils/apiErrorResponse/sendApiError";
import { getIpFromRequest } from "@/utils/getIp/get-ip-from-Request";
import { getIpHash } from "@/utils/getIp/get-ip-hash";
import { GetPrismaClient } from "@/utils/getPrismaClient/get-prisma-client";
import { Logger } from "@/utils/logger/Logger";
import { RateLimiterService } from "@/utils/ratelimiter/rateLimiter";
import { NextRequest, NextResponse } from "next/server";

const logger = new Logger('fetch-profile/handle')
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ handle?: string }> }
) {
  const prisma = GetPrismaClient.getClient();
  const userHandle = (await params).handle;
  try {
    if (!userHandle) {
      return sendApiError(400, "userHandle empty");
    }
    const limiter = RateLimiterService.getLimiter();
    const ipHash = getIpHash(getIpFromRequest(req));
    const limited = await limiter.limit(`fetch-profile-${ipHash}`, {
      bucket_time: 600,
      req_limit: 300,
    });
    if (limited) {
      return sendApiError(429, '요청 제한에 도달했습니다!');
    }
    const profile = await prisma.profile.findUnique({
      where: {
        handle: userHandle,
      },
      select: {
        user: {
          select: {
            hostName: true,
          },
        },
        handle: true,
        name: true,
        stopNewQuestion: true,
        stopAnonQuestion: true,
        avatarUrl: true,
        questionBoxName: true,
        stopNotiNewQuestion: true,
        stopPostAnswer: true,
      },
    });
    if (!profile) {
      return NextResponse.json(
        { message: `profile ${profile} not found` },
        { status: 404 }
      );
    }
    const { instanceType } = await prisma.server.findUniqueOrThrow({where: {instances: profile.user.hostName}});
    const resBody: userProfileWithHostnameDto = {
      handle: profile.handle,
      name: profile.name,
      stopNewQuestion: profile.stopNewQuestion,
      stopAnonQuestion: profile.stopAnonQuestion,
      avatarUrl: profile.avatarUrl,
      questionBoxName: profile.questionBoxName,
      stopNotiNewQuestion: profile.stopNotiNewQuestion,
      stopPostAnswer: profile.stopPostAnswer,
      hostname: profile.user.hostName,
      instanceType: instanceType,
    };

    return NextResponse.json(resBody, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=10",
      },
    });
  } catch (err) {
    logger.error(err);
    return sendApiError(500, "Error");
  }
}
