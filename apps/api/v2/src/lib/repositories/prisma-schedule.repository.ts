import { PrismaScheduleRepository as PrismaScheduleRepositoryLib } from "@calcom/platform-libraries/repositories";
import { PrismaClient } from "@calcom/prisma";
import { Injectable } from "@nestjs/common";
import { PrismaWriteService } from "@/modules/prisma/prisma-write.service";

@Injectable()
export class PrismaScheduleRepository extends PrismaScheduleRepositoryLib {
  constructor(private readonly dbWrite: PrismaWriteService) {
    super(dbWrite.prisma as unknown as PrismaClient);
  }
}
