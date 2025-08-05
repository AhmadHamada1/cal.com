export type TeamSelect = {
  id?: boolean;
  name?: boolean;
  slug?: boolean;
  logoUrl?: boolean;
  parentId?: boolean;
  metadata?: boolean;
  isOrganization?: boolean;
  organizationSettings?: boolean;
  isPlatform?: boolean;
  bio?: boolean;
  hideBranding?: boolean;
  hideBookATeamMember?: boolean;
  hideTeamProfileLink?: boolean;
  isPrivate?: boolean;
  bookingLimits?: boolean;
  rrResetInterval?: boolean;
  rrTimestampBasis?: boolean;
  includeManagedEventsInLimits?: boolean;
  theme?: boolean;
  brandColor?: boolean;
  darkBrandColor?: boolean;
  parent?: {
    select: {
      id?: boolean;
      slug?: boolean;
      name?: boolean;
      isPrivate?: boolean;
      isOrganization?: boolean;
      logoUrl?: boolean;
      metadata?: boolean;
      organizationSettings?: {
        select: {
          allowSEOIndexing?: boolean;
          orgProfileRedirectsToVerifiedDomain?: boolean;
          orgAutoAcceptEmail?: boolean;
        };
      };
    };
  };
  children?: {
    select: {
      name?: boolean;
      slug?: boolean;
    };
  };
  members?: {
    select: {
      accepted?: boolean;
      role?: boolean;
      disableImpersonation?: boolean;
      user?: any;
    };
  };
  eventTypes?: {
    where?: any;
    orderBy?: any;
    select: any;
  };
  inviteTokens?: {
    select: {
      token?: boolean;
      expires?: boolean;
      expiresInDays?: boolean;
      identifier?: boolean;
    };
  };
};

export const teamBasicSelect: TeamSelect = {
  id: true,
  name: true,
  slug: true,
  logoUrl: true,
  parentId: true,
  metadata: true,
  isOrganization: true,
  organizationSettings: true,
  isPlatform: true,
};
