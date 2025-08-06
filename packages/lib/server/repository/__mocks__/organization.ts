import { vi, beforeEach } from "vitest";
import { mockReset, mockDeep } from "vitest-mock-extended";

import type * as organization from "@calcom/lib/server/repository/PrismaOrganizationRepository";

vi.mock("@calcom/lib/server/repository/PrismaOrganizationRepository", () => organizationMock);
type OrganizationModule = typeof organization;
beforeEach(() => {
  mockReset(organizationMock);
});

const organizationMock = mockDeep<OrganizationModule>();
const PrismaOrganizationRepository = organizationMock.PrismaOrganizationRepository;

export const organizationScenarios = {
  PrismaOrganizationRepository: {
    findUniqueNonPlatformOrgsByMatchingAutoAcceptEmail: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fakeReturnOrganization: (org: any, forInput: any) => {
        PrismaOrganizationRepository.findUniqueNonPlatformOrgsByMatchingAutoAcceptEmail.mockImplementation(
          (arg) => {
            if (forInput.email === arg.email) {
              return org;
            }
            const errorMsg = "Mock Error-fakeReturnOrganization: Unhandled input";
            console.log(errorMsg, { arg, forInput });
            throw new Error(errorMsg);
          }
        );
      },
      fakeNoMatch: () => {
        PrismaOrganizationRepository.findUniqueNonPlatformOrgsByMatchingAutoAcceptEmail.mockResolvedValue(
          null
        );
      },
    },
  } satisfies Partial<Record<keyof OrganizationModule["PrismaOrganizationRepository"], unknown>>,
} satisfies Partial<Record<keyof OrganizationModule, unknown>>;

export default organizationMock;
