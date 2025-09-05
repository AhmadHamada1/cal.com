import { ConnectedApps, getConnectedApps } from "@calcom/platform-libraries/app-store";
import { PrismaClient } from "@calcom/prisma";
import { Injectable, Logger } from "@nestjs/common";
import { PrismaWriteService } from "@/modules/prisma/prisma-write.service";
import { UserWithProfile } from "@/modules/users/users.repository";

@Injectable()
export class ConferencingAtomsService {
  private logger = new Logger("ConferencingAtomService");

  constructor(private readonly dbWrite: PrismaWriteService) {}

  async getUserConferencingApps(user: UserWithProfile): Promise<ConnectedApps> {
    return getConnectedApps({
      user,
      input: {
        variant: "conferencing",
        onlyInstalled: true,
      },
      prisma: this.dbWrite.prisma as unknown as PrismaClient,
    });
  }

  async getTeamConferencingApps(user: UserWithProfile, teamId: number): Promise<ConnectedApps> {
    return getConnectedApps({
      user,
      input: {
        variant: "conferencing",
        onlyInstalled: true,
        teamId,
        includeTeamInstalledApps: true,
      },
      prisma: this.dbWrite.prisma as unknown as PrismaClient,
    });
  }
}
