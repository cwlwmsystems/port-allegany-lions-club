
export type CommunityNeed = {
  id: string;
  title: string;
  organization: string;
  description: string;
  location: string;
  timing: string;
  volunteersNeeded?: string;
};

/*
  Add only requests approved by both the club and the
  submitting organization. Do not include private contact details.
*/
export const communityNeeds: CommunityNeed[] = [];
