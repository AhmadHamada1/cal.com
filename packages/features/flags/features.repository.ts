import { captureException } from "@sentry/nextjs";
import { injectable } from "inversify";

import db from "@calcom/prisma";

import type { IFeaturesRepository } from "./features.repository.interface";

@injectable()
export class FeaturesRepository implements IFeaturesRepository {
  async checkIfUserHasFeature(userId: number, slug: string) {
    try {
      const userHasFeature = await db.userFeatures.findUnique({
        where: {
          userId_featureId: { userId, featureId: slug },
        },
      });
      if (userHasFeature) return true;
      // If the user doesn't have the feature, check if they belong to a team with the feature.
      // This also covers organizations, which are teams.
      const userBelongsToTeamWithFeature = await this.checkIfUserBelongsToTeamWithFeature(userId, slug);
      if (userBelongsToTeamWithFeature) return true;
      return false;
    } catch (err) {
      captureException(err);
      throw err;
    }
  }
  private async checkIfUserBelongsToTeamWithFeature(userId: number, slug: string) {
    try {
      const memberships = await db.membership.findMany({ where: { userId }, select: { teamId: true } });
      if (!memberships.length) return false;
      const teamFeature = await db.teamFeatures.findMany({
        where: {
          teamId: { in: memberships.map((m) => m.teamId) },
          featureId: slug,
        },
      });
      return teamFeature.length > 0;
    } catch (err) {
      captureException(err);
      throw err;
    }
  }
}
