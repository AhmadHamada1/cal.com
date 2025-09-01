import dayjs from "@calcom/dayjs";
import type { ScheduleWorkflowRemindersArgs } from "@calcom/ee/workflows/lib/reminders/reminderScheduler";
import { scheduleWorkflowReminders } from "@calcom/ee/workflows/lib/reminders/reminderScheduler";
import type { timeUnitLowerCase } from "@calcom/ee/workflows/lib/reminders/smsReminderManager";
import type { Workflow } from "@calcom/ee/workflows/lib/types";
import { tasker } from "@calcom/features/tasker";
import { prisma } from "@calcom/prisma";
import { WorkflowTriggerEvents } from "@calcom/prisma/enums";
import type { FORM_SUBMITTED_WEBHOOK_RESPONSES } from "@calcom/routing-forms/trpc/utils";

import { getHideBranding } from "../../hideBranding";
import { WorkflowRepository } from "../repository/workflow";

// TODO (Sean): Move most of the logic migrated in 16861 to this service
export class WorkflowService {
  static _beforeAfterEventTriggers: WorkflowTriggerEvents[] = [
    WorkflowTriggerEvents.AFTER_EVENT,
    WorkflowTriggerEvents.BEFORE_EVENT,
  ];
  static async deleteWorkflowRemindersOfRemovedTeam(teamId: number) {
    const team = await prisma.team.findUnique({
      where: {
        id: teamId,
      },
    });

    if (team?.parentId) {
      const activeWorkflowsOnTeam = await prisma.workflow.findMany({
        where: {
          teamId: team.parentId,
          OR: [
            {
              activeOnTeams: {
                some: {
                  teamId: team.id,
                },
              },
            },
            {
              isActiveOnAll: true,
            },
          ],
        },
        select: {
          steps: true,
          activeOnTeams: true,
          isActiveOnAll: true,
        },
      });

      for (const workflow of activeWorkflowsOnTeam) {
        const workflowSteps = workflow.steps;
        let remainingActiveOnIds = [];

        if (workflow.isActiveOnAll) {
          const allRemainingOrgTeams = await prisma.team.findMany({
            where: {
              parentId: team.parentId,
              id: {
                not: team.id,
              },
            },
          });
          remainingActiveOnIds = allRemainingOrgTeams.map((team) => team.id);
        } else {
          remainingActiveOnIds = workflow.activeOnTeams
            .filter((activeOn) => activeOn.teamId !== team.id)
            .map((activeOn) => activeOn.teamId);
        }
        const remindersToDelete = await WorkflowRepository.getRemindersFromRemovedTeams(
          [team.id],
          workflowSteps,
          remainingActiveOnIds
        );
        await WorkflowRepository.deleteAllWorkflowReminders(remindersToDelete);
      }
    }
  }

  static async scheduleFormWorkflows({
    workflows,
    responses,
    responseId,
    form,
  }: {
    workflows: Workflow[];
    responses: FORM_SUBMITTED_WEBHOOK_RESPONSES;
    responseId: number;
    form: {
      id: string;
      userId: number;
      teamId?: number | null;
      fields?: { type: string; identifier?: string }[];
      user: {
        email: string;
        timeFormat: number | null;
        locale: string;
      };
    };
  }) {
    if (workflows.length <= 0) return;

    const workflowsToTrigger: Workflow[] = [];

    workflowsToTrigger.push(
      ...workflows.filter((workflow) => workflow.trigger === WorkflowTriggerEvents.FORM_SUBMITTED)
    );

    let smsReminderNumber: string | null = null;
    if (form.fields) {
      const phoneField = form.fields.find((field) => field.type === "phone");
      if (phoneField && phoneField.identifier) {
        const phoneResponse = responses[phoneField.identifier];
        if (phoneResponse?.response && typeof phoneResponse.response === "string") {
          smsReminderNumber = phoneResponse.response as string;
        }
      }
    }

    // Get hideBranding using the new function
    const hideBranding = await getHideBranding({
      userId: form.userId,
      teamId: form.teamId,
    });

    await scheduleWorkflowReminders({
      smsReminderNumber,
      formData: {
        responses,
        user: { email: form.user.email, timeFormat: form.user.timeFormat, locale: form.user.locale },
      },
      hideBranding,
      workflows: workflowsToTrigger,
    });

    const workflowsToSchedule: Workflow[] = [];

    workflowsToSchedule.push(
      ...workflows.filter((workflow) => workflow.trigger === WorkflowTriggerEvents.FORM_SUBMITTED_NO_EVENT)
    );

    //create tasker here
    const promisesFormSubmittedNoEvent = workflowsToSchedule.map((workflow) => {
      const timeUnit: timeUnitLowerCase = (workflow.timeUnit?.toLowerCase() as timeUnitLowerCase) ?? "minute";

      const scheduledAt = dayjs() //todo: remove dayjs
        .add(workflow.time ?? 15, timeUnit)
        .toDate();

      return tasker.create(
        "triggerFormSubmittedNoEventWorkflow",
        {
          responseId,
          responses,
          formId: form.id,
          workflow,
        },
        { scheduledAt }
      );
    });
    await Promise.all(promisesFormSubmittedNoEvent);
  }

  static async scheduleWorkflowsForNewBooking({
    isNormalBookingOrFirstRecurringSlot,
    isConfirmedByDefault,
    isRescheduleEvent,
    workflows,
    ...args
  }: ScheduleWorkflowRemindersArgs & {
    isConfirmedByDefault: boolean;
    isRescheduleEvent: boolean;
    isNormalBookingOrFirstRecurringSlot: boolean;
  }) {
    if (workflows.length <= 0) return;

    const workflowsToTrigger: Workflow[] = [];

    if (isRescheduleEvent) {
      workflowsToTrigger.push(
        ...workflows.filter(
          (workflow) =>
            workflow.trigger === WorkflowTriggerEvents.RESCHEDULE_EVENT ||
            this._beforeAfterEventTriggers.includes(workflow.trigger)
        )
      );
    } else if (!isConfirmedByDefault) {
      workflowsToTrigger.push(
        ...workflows.filter((workflow) => workflow.trigger === WorkflowTriggerEvents.BOOKING_REQUESTED)
      );
    } else if (isConfirmedByDefault) {
      workflowsToTrigger.push(
        ...workflows.filter(
          (workflow) =>
            this._beforeAfterEventTriggers.includes(workflow.trigger) ||
            (isNormalBookingOrFirstRecurringSlot
              ? workflow.trigger === WorkflowTriggerEvents.NEW_EVENT
              : false)
        )
      );
    }

    if (workflowsToTrigger.length === 0) return;

    await scheduleWorkflowReminders({
      ...args,
      workflows: workflowsToTrigger,
    });
  }

  static async scheduleWorkflowsFilteredByTriggerEvent({
    workflows,
    triggers,
    ...args
  }: ScheduleWorkflowRemindersArgs & { triggers: WorkflowTriggerEvents[] }) {
    if (workflows.length <= 0) return;
    await scheduleWorkflowReminders({
      ...args,
      workflows: workflows.filter((workflow) => triggers.includes(workflow.trigger)),
    });
  }
}
