
export type ClubUpdate = {
  slug: string;
  title: string;
  date: string;
  category: 'Announcement' | 'Service Recap' | 'Club News';
  summary: string;
  content: string;
  image?: string;
};

export const clubUpdates: ClubUpdate[] = [];

// Add only announcements approved for publication.
// Project recaps should describe activities that actually happened.
