type ContactData = {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  address_line_1?: string | null;
  address_line_2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
};

type OrganizationData = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address_line_1?: string | null;
  address_line_2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
};

type MergeData = {
  contact?: ContactData | null;
  organization?: OrganizationData | null;

  custom?: {
    message?: string | null;
  };
};

const CLUB_FIELDS: Record<string, string> = {
  'club.name': 'Port Allegany Lions Club',
  'club.city': 'Port Allegany',
  'club.state': 'PA',
};

function getValue(
  data: MergeData,
  key: string
): string {
  if (key in CLUB_FIELDS) {
    return CLUB_FIELDS[key];
  }

  const parts = key.split('.');

  if (parts.length !== 2) {
    return '';
  }

  const [group, field] = parts;

  if (group === 'contact') {
    const value =
      data.contact?.[
        field as keyof ContactData
      ];

    return value?.toString() || '';
  }

  if (group === 'organization') {
    const value =
      data.organization?.[
        field as keyof OrganizationData
      ];

    return value?.toString() || '';
  }

  if (group === 'custom') {
    const value =
      data.custom?.[
        field as keyof NonNullable<
          MergeData['custom']
        >
      ];

    return value?.toString() || '';
  }

  return '';
}

export function mergeCommunicationTemplate(
  template: string,
  data: MergeData
) {
  return template.replace(
    /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g,
    (_, key: string) => getValue(data, key)
  );
}

export const COMMUNICATION_MERGE_FIELDS = [
  '{{contact.first_name}}',
  '{{contact.last_name}}',
  '{{contact.email}}',
  '{{contact.phone}}',
  '{{contact.address_line_1}}',
  '{{contact.address_line_2}}',
  '{{contact.city}}',
  '{{contact.state}}',
  '{{contact.postal_code}}',

  '{{organization.name}}',
  '{{organization.email}}',
  '{{organization.phone}}',
  '{{organization.website}}',

  '{{club.name}}',
  '{{club.city}}',
  '{{club.state}}',

  '{{custom.message}}',
];
