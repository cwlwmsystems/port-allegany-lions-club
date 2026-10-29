
export type ClubUpdate = {
  slug: string;
  title: string;
  date: string;
  category: 'Announcement' | 'Service Recap' | 'Club News';
  summary: string;
  content: string;
  image?: string;
};

export const clubUpdates: ClubUpdate[] = [
  {
    slug: 'route-6-roadside-cleanup-october-2026',
    title: 'Lions Complete Route 6 Roadside Cleanup',
    date: '2026-10-26',
    category: 'Service Recap',
    summary: 'The Port Allegany Lions Club completed its biannual garbage pickup along Route 6 outside Port Allegany on October 26, 2026.',
    content: 'On October 26, 2026, the Port Allegany Lions Club carried out its biannual garbage pickup along Route 6 outside Port Allegany. This recurring service activity is one way the club contributes to caring for our local community and surrounding roadsides.'
  },
];

// Add only announcements approved for publication.
// Project recaps should describe activities that actually happened.
