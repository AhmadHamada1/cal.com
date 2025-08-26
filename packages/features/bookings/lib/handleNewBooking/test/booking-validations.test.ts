/**
 * Booking Validation Specifications
 * These specifications verify the business rules and validation behavior for booking creation
 */
import prismaMock from "../../../../../../tests/libs/__mocks__/prisma";

import {
  createBookingScenario,
  TestData,
  getOrganizer,
  getBooker,
  getScenarioData,
  getGoogleCalendarCredential,
  mockCalendarToHaveNoBusySlots,
} from "@calcom/web/test/utils/bookingScenario/bookingScenario";
import { getMockRequestDataForBooking } from "@calcom/web/test/utils/bookingScenario/getMockRequestDataForBooking";
import { setupAndTeardown } from "@calcom/web/test/utils/bookingScenario/setupAndTeardown";

import { afterEach } from "vitest";
import { describe, expect } from "vitest";

import { BookingStatus } from "@calcom/prisma/enums";
import { test } from "@calcom/web/test/fixtures/fixtures";

import { getNewBookingHandler } from "./getNewBookingHandler";

afterEach(() => {
  delete process.env.BLACKLISTED_GUEST_EMAILS;
});
describe("Booking Validation Specifications", () => {
  setupAndTeardown();

  describe("Email Blacklist Validation", () => {
    test("when email is in BLACKLISTED_GUEST_EMAILS, allow the user to book only if they are logged in with that email", async () => {
      const handleNewBooking = getNewBookingHandler();
      const blockedEmail = "organizer@example.com"; // Use organizer's email as the blocked one

      const booker = getBooker({
        email: blockedEmail,
        name: "Organizer",
      });

      const organizer = getOrganizer({
        name: "Organizer",
        email: "organizer@example.com",
        id: 101,
        schedules: [TestData.schedules.IstWorkHours],
        credentials: [getGoogleCalendarCredential()],
        selectedCalendars: [TestData.selectedCalendars.google],
      });

      // Mock environment variable for blacklisted emails
      process.env.BLACKLISTED_GUEST_EMAILS = "organizer@example.com,spam@test.com";

      await createBookingScenario(
        getScenarioData({
          eventTypes: [
            {
              id: 1,
              slotInterval: 30,
              length: 30,
              users: [
                {
                  id: 101,
                },
              ],
            },
          ],
          organizer,
          apps: [TestData.apps["google-calendar"]],
        })
      );

      // Update the organizer to have verified email (which happens in createBookingScenario)
      await prismaMock.user.update({
        where: { id: 101 },
        data: {
          emailVerified: new Date(),
        },
      });

      mockCalendarToHaveNoBusySlots("googlecalendar", {});

      const mockBookingData = getMockRequestDataForBooking({
        data: {
          eventTypeId: 1,
          responses: {
            email: booker.email,
            name: booker.name,
            location: { optionValue: "", value: "New York" },
          },
        },
      });

      // Non logged in user should not be able to book
      await expect(
        async () =>
          await handleNewBooking({
            bookingData: mockBookingData,
          })
      ).rejects.toThrow(
        "Attendee email has been blocked. Make sure to login as organizer@example.com to use this email for creating a booking."
      );

      // Should allow booking when the user who owns the blacklisted email is logged in
      const createdBooking = await handleNewBooking({
        bookingData: mockBookingData,
        userId: 101, // Same as organizer who owns the blacklisted email
      });

      expect(createdBooking).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          uid: expect.any(String),
          status: BookingStatus.ACCEPTED,
        })
      );
    });

    test("prevents booking when blacklisted email is not verified in the system", async () => {
      const handleNewBooking = getNewBookingHandler();
      const blockedEmail = "blocked@example.com";

      const booker = getBooker({
        email: blockedEmail,
        name: "Unverified User",
      });

      const organizer = getOrganizer({
        name: "Organizer",
        email: "organizer@example.com",
        id: 101,
        schedules: [TestData.schedules.IstWorkHours],
        credentials: [getGoogleCalendarCredential()],
        selectedCalendars: [TestData.selectedCalendars.google],
      });

      // Mock environment variable for blacklisted emails
      process.env.BLACKLISTED_GUEST_EMAILS = "blocked@example.com";

      await createBookingScenario(
        getScenarioData({
          eventTypes: [
            {
              id: 1,
              slotInterval: 30,
              length: 30,
              users: [
                {
                  id: 101,
                },
              ],
            },
          ],
          organizer,
          apps: [TestData.apps["google-calendar"]],
        })
      );

      mockCalendarToHaveNoBusySlots("googlecalendar", {});

      const mockBookingData = getMockRequestDataForBooking({
        data: {
          eventTypeId: 1,
          responses: {
            email: booker.email,
            name: booker.name,
            location: { optionValue: "", value: "New York" },
          },
        },
      });

      // Should prevent booking when blacklisted email has no verified user in database
      await expect(
        async () =>
          await handleNewBooking({
            bookingData: mockBookingData,
          })
      ).rejects.toThrow("Cannot use this email to create the booking.");
    });
  });

  describe("Active Bookings Limit Validation", () => {
    test("allows booking when user is under their active booking limit", async () => {
      const handleNewBooking = getNewBookingHandler();

      const booker = getBooker({
        email: "booker@example.com",
        name: "Booker",
      });

      const organizer = getOrganizer({
        name: "Organizer",
        email: "organizer@example.com",
        id: 101,
        schedules: [TestData.schedules.IstWorkHours],
        credentials: [getGoogleCalendarCredential()],
        selectedCalendars: [TestData.selectedCalendars.google],
      });

      // Create test scenario with event type that has maxActiveBookingsPerBooker limit
      await createBookingScenario(
        getScenarioData({
          eventTypes: [
            {
              id: 1,
              slotInterval: 30,
              length: 30,
              maxActiveBookingsPerBooker: 2,
              users: [
                {
                  id: 101,
                },
              ],
            },
          ],
          organizer,
          apps: [TestData.apps["google-calendar"]],
        })
      );

      mockCalendarToHaveNoBusySlots("googlecalendar", {});

      // Create one existing booking to test the count logic (future booking at different time)
      const existingBookingDate = new Date();
      existingBookingDate.setDate(existingBookingDate.getDate() + 2); // 2 days from now to avoid conflict
      existingBookingDate.setHours(10, 0, 0, 0); // Set to 10 AM to avoid conflict with test booking

      await prismaMock.booking.create({
        data: {
          uid: "existing-booking-1",
          eventTypeId: 1,
          userId: organizer.id,
          startTime: existingBookingDate,
          endTime: new Date(existingBookingDate.getTime() + 30 * 60 * 1000), // 30 minutes later
          title: "Existing Booking",
          status: BookingStatus.ACCEPTED,
          attendees: {
            create: {
              email: booker.email,
              name: booker.name,
              timeZone: "America/New_York",
            },
          },
        },
      });

      const mockBookingData = getMockRequestDataForBooking({
        data: {
          eventTypeId: 1,
          responses: {
            email: booker.email,
            name: booker.name,
            location: { optionValue: "", value: "New York" },
          },
        },
      });

      // Should allow booking when user has not reached their limit (1 booking < 2 limit)
      const createdBooking = await handleNewBooking({
        bookingData: mockBookingData,
      });

      expect(createdBooking).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          uid: expect.any(String),
          status: BookingStatus.ACCEPTED,
        })
      );

      // Second booking should be rejected
      await expect(
        async () =>
          await handleNewBooking({
            bookingData: mockBookingData,
          })
      ).rejects.toThrow("booker_limit_exceeded_error");
    });

    test("enforces booking limits with reschedule option when enabled", async () => {
      const handleNewBooking = getNewBookingHandler();

      const booker = getBooker({
        email: "booker@example.com",
        name: "Booker",
      });

      const organizer = getOrganizer({
        name: "Organizer",
        email: "organizer@example.com",
        id: 101,
        schedules: [TestData.schedules.IstWorkHours],
        credentials: [getGoogleCalendarCredential()],
        selectedCalendars: [TestData.selectedCalendars.google],
      });

      // Create test scenario with event type that has reschedule option enabled
      await createBookingScenario(
        getScenarioData({
          eventTypes: [
            {
              id: 1,
              slotInterval: 30,
              length: 30,
              maxActiveBookingsPerBooker: 2,
              maxActiveBookingPerBookerOfferReschedule: true,
              users: [
                {
                  id: 101,
                },
              ],
            },
          ],
          organizer,
          apps: [TestData.apps["google-calendar"]],
        })
      );

      mockCalendarToHaveNoBusySlots("googlecalendar", {});

      // Create bookings that equal the limit (2 future bookings for a limit of 2)
      const existingBookingDate1 = new Date();
      existingBookingDate1.setDate(existingBookingDate1.getDate() + 2); // 2 days from now
      existingBookingDate1.setHours(10, 0, 0, 0); // 10 AM to avoid conflict

      const existingBookingDate2 = new Date();
      existingBookingDate2.setDate(existingBookingDate2.getDate() + 3); // 3 days from now
      existingBookingDate2.setHours(14, 0, 0, 0); // 2 PM to avoid conflict

      await prismaMock.booking.create({
        data: {
          uid: "existing-booking-1",
          eventTypeId: 1,
          userId: organizer.id,
          startTime: existingBookingDate1,
          endTime: new Date(existingBookingDate1.getTime() + 30 * 60 * 1000), // 30 minutes later
          title: "Existing Booking 1",
          status: BookingStatus.ACCEPTED,
          attendees: {
            create: {
              email: booker.email,
              name: booker.name,
              timeZone: "America/New_York",
            },
          },
        },
      });

      await prismaMock.booking.create({
        data: {
          uid: "existing-booking-2",
          eventTypeId: 1,
          userId: organizer.id,
          startTime: existingBookingDate2,
          endTime: new Date(existingBookingDate2.getTime() + 30 * 60 * 1000), // 30 minutes later
          title: "Existing Booking 2",
          status: BookingStatus.ACCEPTED,
          attendees: {
            create: {
              email: booker.email,
              name: booker.name,
              timeZone: "America/New_York",
            },
          },
        },
      });

      const mockBookingData = getMockRequestDataForBooking({
        data: {
          eventTypeId: 1,
          responses: {
            email: booker.email,
            name: booker.name,
            location: { optionValue: "", value: "New York" },
          },
        },
      });

      try {
        await handleNewBooking({
          bookingData: mockBookingData,
        });
      } catch (error) {
        expect(error.message).toEqual("booker_limit_exceeded_error_reschedule");
        expect(error.data).toEqual(
          expect.objectContaining({
            rescheduleUid: "existing-booking-1",
          })
        );
      }
    });
  });
});
