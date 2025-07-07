import type { z } from "zod";

import logger from "@calcom/lib/logger";
import { PrismaWorkspacePlatformRepository } from "@calcom/lib/server/repository/prismaWorkspacePlatform";

import { TRPCError } from "@trpc/server";

import type { workspacePlatformCreateSchema } from "./schema";
import { ensureNoServiceAccountKey } from "./utils";

export default async function addHandler({
  input,
}: {
  input: z.infer<typeof workspacePlatformCreateSchema>;
}) {
  try {
    const workspacePlatform = await PrismaWorkspacePlatformRepository.create(input);
    return ensureNoServiceAccountKey(workspacePlatform);
  } catch (error) {
    logger.error(error);
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to add workspace platform" });
  }
}
