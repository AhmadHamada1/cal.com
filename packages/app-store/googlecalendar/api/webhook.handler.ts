import type { NextApiRequest } from "next";
import { z } from "zod";

import { CalendarSyncRepository } from "@calcom/features/calendar-sync/calendarSync.repository";
import { syncDownstream } from "@calcom/features/calendar-sync/lib/syncDownstream";
import { getCredentialForCalendarCache } from "@calcom/lib/delegationCredential/server";
import { HttpError } from "@calcom/lib/http-error";
import logger from "@calcom/lib/logger";
import { safeStringify } from "@calcom/lib/safeStringify";
import { SelectedCalendarRepository } from "@calcom/lib/server/repository/selectedCalendar";
import prisma from "@calcom/prisma";

import { getCalendar } from "../../_utils/getCalendar";

const log = logger.getSubLogger({ prefix: ["GoogleCalendarWebhook"] });
class IgnorableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IgnorableError";
  }
}

const googleHeadersSchema = z.object({
  "x-goog-channel-expiration": z.string(), // Sat, 22 Mar 2025 19:14:43 GMT
  "x-goog-channel-id": z.string(), // xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  "x-goog-channel-token": z.string(), // XXXXXXXXXXXXXXXXXXx/XXXXXXXXXXXX=
  "x-goog-message-number": z.string(), // 398005
  "x-goog-resource-id": z.string(), // XXXXXXXXXXXXXXXXXX_XXX
  /**
   * 'exists' - Resource exists and is changed
   * 'not_found' - Resource has been deleted
   * 'sync' - Initial sync when someone subscribes to the channel
   */
  "x-goog-resource-state": z.string(),
  "x-goog-resource-uri": z.string(), // https://www.googleapis.com/calendar/v3/calendars/user%40example.com/events?alt=json
});

function getActionsToTake({
  channelId,
  resourceId,
  selectedCalendar,
  calendarSync,
  resourceState,
}: {
  channelId: string;
  resourceId: string;
  selectedCalendar: {
    id: string;
    externalId: string;
    credentialId: number | null;
  } | null;
  calendarSync: {
    id: string;
    externalCalendarId: string;
    credentialId: number;
  } | null;
  resourceState: string;
}) {
  const syncActions: ("availability-cache" | "events-sync")[] = [];

  let externalCalendarId: string | null = null;
  let credentialId: number | null = null;

  if (!selectedCalendar && !calendarSync) {
    // The channel isn't registered with us
    throw new IgnorableError("No selectedCalendar or calendarSync found for push notification");
  }

  if (selectedCalendar) {
    syncActions.push("availability-cache");
    externalCalendarId = selectedCalendar.externalId;
    credentialId = selectedCalendar.credentialId;
    log.debug(
      "Found selected calendar record",
      safeStringify({ channelId, resourceId, selectedCalendarId: selectedCalendar.id })
    );
  }

  if (calendarSync) {
    // resourceState is 'sync' when a subscription is created. We don't need to sync events in that case.
    if (resourceState !== "sync") {
      syncActions.push("events-sync");
    }

    if (externalCalendarId && externalCalendarId !== calendarSync.externalCalendarId) {
      log.error(
        "Data inconsistency: Selected calendar externalId and Synced calendar externalId do not match for the same subscription.",
        safeStringify({
          channelId,
          resourceId,
          selectedExternalId: externalCalendarId,
          syncedExternalId: calendarSync.externalCalendarId,
          selectedCalendarId: selectedCalendar?.id,
          calendarSyncId: calendarSync.id,
        })
      );

      throw new Error(
        "Data inconsistency: SelectedCalendar.externalId and CalendarSync.externalCalendarId do not match for the same subscription."
      );
    }

    if (credentialId && credentialId !== calendarSync.credentialId) {
      // It is possible that they were setup with different credential instances but both credentials point to the same external resource
      log.info(
        "Credential mismatch between selected and synced calendar records for the same subscription. This could be okay",
        safeStringify({
          channelId,
          resourceId,
          selectedCredentialId: credentialId,
          syncedCredentialId: calendarSync.credentialId,
        })
      );
    }

    externalCalendarId = calendarSync.externalCalendarId;
    credentialId = calendarSync.credentialId;
    log.debug(
      "Using synced calendar record",
      safeStringify({ channelId, resourceId, calendarSyncId: calendarSync.id })
    );
  }

  if (!syncActions.length || !credentialId || !externalCalendarId) {
    const error =
      "Either no syncActions, or no credentialId or no externalCalendarId found for push notification";

    log.warn(
      error,
      safeStringify({
        channelId,
        resourceId,
        syncActions,
        credentialId,
        externalCalendarId,
      })
    );
    throw new Error(error);
  }

  return { syncActions, calendar: { externalCalendarId, credentialId } };
}

async function getCalendarFromChannelId({
  channelId,
  resourceId,
  subscription,
  resourceState,
}: {
  channelId: string;
  resourceId: string;
  subscription: {
    id: string;
  } | null;
  resourceState: string;
}) {
  const [selectedCalendar, calendarSync] = await Promise.all([
    SelectedCalendarRepository.findFirstByGoogleChannelIdAndResourceId(channelId, resourceId),
    subscription
      ? CalendarSyncRepository.findBySubscriptionId({ subscriptionId: subscription.id })
      : Promise.resolve(null),
  ]);

  const { syncActions, calendar } = getActionsToTake({
    channelId,
    resourceId,
    selectedCalendar,
    calendarSync,
    resourceState,
  });

  // Fetch the credential using the determined credentialId
  const credentialForCalendarCache = await getCredentialForCalendarCache({
    credentialId: calendar.credentialId,
  });

  if (!credentialForCalendarCache) {
    // Could happen if the credential was a delegation User Credential and DelegationCredential is now disabled
    log.error("No credential found for credentialId", safeStringify({ credentialId: calendar.credentialId }));
    throw new Error(`No credential found for credentialId: ${calendar.credentialId} `);
  }

  const calendarService = await getCalendar(credentialForCalendarCache);

  if (!calendarService) {
    throw new Error(`Failed to initialize calendar service for credential: ${calendar.credentialId}`);
  }

  const allRelatedSelectedCalendars = await SelectedCalendarRepository.findFromCredentialId(
    calendar.credentialId
  );

  return {
    calendarService,
    syncActions,
    externalCalendarId: calendar.externalCalendarId,
    calendarSyncId: calendarSync?.id ?? null,
    allRelatedSelectedCalendars,
  };
}

export async function postHandler(req: NextApiRequest) {
  let channelId: string | undefined;
  let resourceId: string | undefined;
  try {
    const parsedHeaders = googleHeadersSchema.safeParse(req.headers);
    if (!parsedHeaders.success) {
      throw new Error("Invalid request headers");
    }
    const headers = parsedHeaders.data;

    channelId = headers["x-goog-channel-id"];
    resourceId = headers["x-goog-resource-id"];
    const channelToken = headers["x-goog-channel-token"];
    /**
     * 'exists' - Resource exists and is changed
     * 'not_found' - Resource has been deleted
     * 'sync' - Initial sync when someone subscribes to the channel
     */
    const resourceState = headers["x-goog-resource-state"];

    if (channelToken !== process.env.GOOGLE_WEBHOOK_TOKEN) {
      throw new HttpError({ statusCode: 403, message: "Invalid API key" });
    }

    const subscription = await prisma.calendarSubscription.findFirst({
      where: {
        providerSubscriptionId: channelId,
        providerResourceId: resourceId,
      },
    });

    const { calendarService, syncActions, externalCalendarId, calendarSyncId, allRelatedSelectedCalendars } =
      await getCalendarFromChannelId({
        channelId,
        resourceId,
        subscription,
        resourceState,
      });

    if (!calendarService?.onWatchedCalendarChange) {
      // Log error with more context
      log.error("Google Calendar service does not have onWatchedCalendarChange");
      throw new Error("Google Calendar service does not have onWatchedCalendarChange");
    }

    // Pass the correct Google Calendar ID, resourceId, resourceState and the relevant syncActions
    const result = await calendarService.onWatchedCalendarChange({
      calendarId: externalCalendarId,
      syncActions,
      selectedCalendars: allRelatedSelectedCalendars,
    });

    if (result.eventsToSync) {
      await syncDownstream({
        calendarEvents: result.eventsToSync,
        app: {
          type: "google_calendar",
          name: "Google Calendar",
        },
      });
    }

    if (subscription?.id) {
      try {
        await Promise.all([
          // Update the CalendarSubscription was used
          prisma.calendarSubscription.update({
            where: { id: subscription.id },
            data: { lastSyncAt: new Date() },
          }),
          // Update that CalendarSync was used
          calendarSyncId &&
            prisma.calendarSync.update({
              where: { id: calendarSyncId },
              data: { lastSyncedDownAt: new Date(), lastSyncDirection: "DOWNSTREAM" },
            }),
        ]);
        log.debug(
          "Updated lastSyncAt for subscription",
          safeStringify({ subscriptionId: subscription.id, resourceId, channelId })
        );
      } catch (error) {
        log.error(
          "Failed to update lastSyncAt for subscription",
          safeStringify(error),
          safeStringify({ subscriptionId: subscription.id, resourceId, channelId })
        );
      }
    } else {
      log.debug(
        "No subscription ID found to update lastSyncAt, likely processing for SelectedCalendar only.",
        safeStringify({ channelId, resourceId, syncActions })
      );
    }

    log.debug(
      `Successfully processed webhook for type(s): ${syncActions.join(", ")}`,
      safeStringify({
        onWatchedCalendarChangeResult: result,
        externalCalendarId,
        resourceId,
        channelId,
        subscriptionId: subscription?.id,
      })
    );
    return { message: "ok" };
  } catch (error) {
    const context = { channelId, resourceId };

    if (error instanceof IgnorableError) {
      log.debug("Ignorable error processing webhook", safeStringify(error));
      return { message: "ok" };
    }

    if (error instanceof HttpError) {
      log.error(
        `Error processing webhook: ${error.message}`,
        safeStringify({ statusCode: error.statusCode, context })
      );
      throw error;
    }
    log.error("Unexpected error processing webhook", safeStringify(error), safeStringify({ context }));
    throw new HttpError({ statusCode: 500, message: "Internal server error" });
  }
}
