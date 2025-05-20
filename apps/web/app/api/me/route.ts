import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";

import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { performance } from "@calcom/lib/server/perfObserver";
import type { PrismaClient } from "@calcom/prisma";
import { withPrismaRoute } from "@calcom/prisma/store/withPrismaRoute";

import { buildLegacyRequest } from "@lib/buildLegacyCtx";

async function getHandler(req: Request, prisma: PrismaClient) {
  const prePrismaDate = performance.now();

  const preSessionDate = performance.now();

  // Create a legacy request object for compatibility
  const legacyReq = buildLegacyRequest(await headers(), await cookies());

  const session = await getServerSession({ req: legacyReq });
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 409 });
  }

  const preUserDate = performance.now();
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ message: "No user found" }, { status: 404 });
  }

  const lastUpdate = performance.now();

  const response = NextResponse.json({
    message: `Hello ${user.name}`,
    prePrismaDate,
    prismaDuration: `Prisma took ${preSessionDate - prePrismaDate}ms`,
    preSessionDate,
    sessionDuration: `Session took ${preUserDate - preSessionDate}ms`,
    preUserDate,
    userDuration: `User took ${lastUpdate - preUserDate}ms`,
    lastUpdate,
  });

  return response;
}

export const GET = withPrismaRoute(getHandler);
