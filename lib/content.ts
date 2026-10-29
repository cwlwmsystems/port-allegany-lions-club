export const club = {
  name: 'Port Allegany Lions Club',
  town: 'Port Allegany, Pennsylvania',
  tagline: 'Local hearts. Lasting impact.',
  email: '', // Add club-owned, public email when approved.
  meetingDetails: '', // Set once officers approve a public schedule and location.
  socialUrl: 'https://www.facebook.com/portalleganylions',
};

export type EventItem = { title: string; date: string; location: string; description: string; type: 'Meeting'|'Service'|'Community'; };
// Publish only events with confirmed dates, locations, and officer approval.
export const events: EventItem[] = [];

export type ImpactItem = { title: string; category: string; description: string; date?: string; };
// Replace examples with approved, documented local club projects.
export const impactStories: ImpactItem[] = [
  {
    title: 'Route 6 Roadside Cleanup',
    category: 'Community Service',
    description: 'On October 26, 2026, the Port Allegany Lions Club carried out its biannual garbage pickup along Route 6 outside Port Allegany.',
    date: '2026-10-26'
  },
];

export const focusAreas = [
  { title: 'Community care', description: 'Show up for neighbors and respond to meaningful local needs.', icon: 'heart' },
  { title: 'Youth & opportunity', description: 'Create ways for young people to learn, lead, and give back.', icon: 'sun' },
  { title: 'Vision & well-being', description: 'Carry forward a global Lions commitment to vision and service.', icon: 'eye' },
];
