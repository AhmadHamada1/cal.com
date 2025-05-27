import type { CalendarCache, Prisma } from "@prisma/client";

import type { SelectedCalendarEventTypeIds, CalendarSubscription } from "@calcom/types/Calendar";

export type FreeBusyArgs = { timeMin: string; timeMax: string; items: { id: string }[] };

export interface ICalendarCacheRepository {
  watchSelectedCalendar(args: {
    calendarId: string;
    eventTypeIds: SelectedCalendarEventTypeIds;
    calendarSubscription: CalendarSubscription | null;
  }): Promise<any>;
  unwatchSelectedCalendar(args: {
    calendarId: string;
    eventTypeIds: SelectedCalendarEventTypeIds;
    calendarSubscription: CalendarSubscription | null;
  }): Promise<any>;
  upsertCachedAvailability({
    credentialId,
    userId,
    args,
    value,
  }: {
    credentialId: number;
    userId: number | null;
    args: FreeBusyArgs;
    value: Prisma.JsonNullValueInput | Prisma.InputJsonValue;
  }): Promise<void>;
  getCachedAvailability({
    credentialId,
    userId,
    args,
  }: {
    credentialId: number;
    userId: number | null;
    args: FreeBusyArgs;
  }): Promise<CalendarCache | null>;
}
