import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { CalendarSubscriptionRepository } from "@calcom/features/calendar-cache-sql/CalendarSubscriptionRepository";
import { FeaturesRepository } from "@calcom/features/flags/features.repository";
import { getCredentialForCalendarCache } from "@calcom/lib/delegationCredential/server";
import { HttpError } from "@calcom/lib/http-error";
import logger from "@calcom/lib/logger";
import { safeStringify } from "@calcom/lib/safeStringify";
import prisma from "@calcom/prisma";

import { defaultResponderForAppDir } from "../../../api/defaultResponderForAppDir";

const log = logger.getSubLogger({ prefix: ["GoogleCalendarSqlWebhook"] });

async function postHandler(request: NextRequest, { params }: { params: Promise<any> }) {
  const channelToken = request.headers.get("x-goog-channel-token");
  const channelId = request.headers.get("x-goog-channel-id");

  log.debug("postHandler", safeStringify({ channelToken, channelId }));
  if (channelToken !== process.env.GOOGLE_WEBHOOK_TOKEN) {
    throw new HttpError({ statusCode: 403, message: "Invalid API key" });
  }
  if (typeof channelId !== "string") {
    throw new HttpError({ statusCode: 403, message: "Missing Channel ID" });
  }

  try {
    const featuresRepo = new FeaturesRepository();
    const isSqlWriteEnabled = await featuresRepo.checkIfFeatureIsEnabledGlobally("calendar-cache-sql-write");

    if (!isSqlWriteEnabled) {
      log.debug("SQL cache write not enabled globally");
      return NextResponse.json({ message: "ok" });
    }

    const subscriptionRepo = new CalendarSubscriptionRepository(prisma);

    const subscription = await subscriptionRepo.findByChannelId(channelId);
    if (!subscription) {
      log.info("No subscription found for channelId", { channelId });
      return NextResponse.json({ message: "ok" });
    }

    if (!subscription.selectedCalendar?.credential) {
      log.info("No credential found for subscription", { channelId });
      return NextResponse.json({ message: "ok" });
    }

    const credentialForCalendarCache = await getCredentialForCalendarCache({
      credentialId: subscription.selectedCalendar.credential.id,
    });

    const { CalendarEventRepository } = await import(
      "@calcom/features/calendar-cache-sql/calendar-event.repository"
    );
    const { CalendarCacheSqlService } = await import(
      "@calcom/features/calendar-cache-sql/calendar-cache-sql.service"
    );

    const eventRepo = new CalendarEventRepository(prisma);
    const calendarCacheService = new CalendarCacheSqlService(subscriptionRepo, eventRepo);

    if (!credentialForCalendarCache) {
      return NextResponse.json({ error: "Credential not found" }, { status: 404 });
    }

    await calendarCacheService.processWebhookEvents(channelId, credentialForCalendarCache);

    return NextResponse.json({ message: "ok" });
  } catch (error) {
    log.error("Google Calendar SQL webhook error:", safeStringify({ error }));
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export const POST = defaultResponderForAppDir(postHandler);
