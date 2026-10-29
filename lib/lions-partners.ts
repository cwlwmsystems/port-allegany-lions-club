export type ClubPartner = {
  name: string;
  description: string;
  contribution: string;
  website?: string;
  logo?: string;
  location?: string;
  contributionType?:
    | 'Financial Support'
    | 'Donated Goods'
    | 'Donated Services'
    | 'Volunteer Support'
    | 'Community Partnership';
};

// Only add verified club supporters.
// Confirm permission before displaying business logos.
// Do not publish donation amounts without permission.
export const clubPartners: ClubPartner[] = [];
