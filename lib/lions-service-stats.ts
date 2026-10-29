
export const serviceStats: {
  hours: number | null;
  projects: number | null;
  volunteers: number | null;
  verifiedThrough: string | null;
} = {
  hours: null,
  projects: null,
  volunteers: null,
  verifiedThrough: null
};

// Replace null with verified totals.
// Count volunteer hours consistently across projects.
// Do not use estimated or invented results.
