import authedProcedure from "../../../procedures/authedProcedure";
import publicProcedure from "../../../procedures/publicProcedure";
import { router } from "../../../trpc";
import { ZAddGuestsInputSchema } from "./addGuests.schema";
import { ZFindInputSchema } from "./find.schema";
import { ZGetInputSchema } from "./get.schema";
import { ZGetBookingAttendeesInputSchema } from "./getBookingAttendees.schema";
import { ZInstantBookingInputSchema } from "./getInstantBookingLocation.schema";

export const bookingsRouter = router({
  get: authedProcedure.input(ZGetInputSchema).query(async ({ input, ctx }) => {
    const { getHandler } = await import("./get.handler");

    return getHandler({
      ctx,
      input,
    });
  }),

  addGuests: authedProcedure.input(ZAddGuestsInputSchema).mutation(async ({ input, ctx }) => {
    const { addGuestsHandler } = await import("./addGuests.handler");

    return addGuestsHandler({
      ctx,
      input,
    });
  }),

  getBookingAttendees: authedProcedure
    .input(ZGetBookingAttendeesInputSchema)
    .query(async ({ input, ctx }) => {
      const { getBookingAttendeesHandler } = await import("./getBookingAttendees.handler");

      return getBookingAttendeesHandler({
        ctx,
        input,
      });
    }),

  find: publicProcedure.input(ZFindInputSchema).query(async ({ input, ctx }) => {
    const { getHandler } = await import("./find.handler");

    return getHandler({
      ctx,
      input,
    });
  }),

  getInstantBookingLocation: publicProcedure
    .input(ZInstantBookingInputSchema)
    .query(async ({ input, ctx }) => {
      const { getHandler } = await import("./getInstantBookingLocation.handler");

      return getHandler({
        ctx,
        input,
      });
    }),
});
