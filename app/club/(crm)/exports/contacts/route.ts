import { NextResponse } from 'next/server';
import { stringify } from 'csv-stringify/sync';

import { createClient } from '@/lib/supabase/server';
import { getCurrentCRMRole } from '@/lib/crm-permissions';

export async function GET() {
  const role =
    await getCurrentCRMRole();

  if (
    ![
      'admin',
      'officer',
      'membership_chair',
    ].includes(role)
  ) {
    return new NextResponse(
      'Access denied',
      { status: 403 }
    );
  }

  const supabase =
    await createClient();

  const { data, error } =
    await supabase
      .from('contacts')
      .select(`
        first_name,
        last_name,
        email,
        phone,
        mobile_phone,
        address_line_1,
        address_line_2,
        city,
        state,
        postal_code,
        preferred_contact_method,
        status,
        occupation,
        source,
        general_notes,
        created_at
      `)
      .order('last_name')
      .order('first_name');

  if (error) {
    return new NextResponse(
      error.message,
      { status: 500 }
    );
  }

  const rows =
    (data ?? []).map((contact) => ({
      'First Name':
        contact.first_name,
      'Last Name':
        contact.last_name,
      Email:
        contact.email ?? '',
      Phone:
        contact.phone ?? '',
      'Mobile Phone':
        contact.mobile_phone ?? '',
      'Address Line 1':
        contact.address_line_1 ?? '',
      'Address Line 2':
        contact.address_line_2 ?? '',
      City:
        contact.city ?? '',
      State:
        contact.state ?? '',
      'Postal Code':
        contact.postal_code ?? '',
      'Preferred Contact Method':
        contact.preferred_contact_method ?? '',
      Status:
        contact.status,
      Occupation:
        contact.occupation ?? '',
      Source:
        contact.source ?? '',
      'General Notes':
        contact.general_notes ?? '',
      'Created At':
        contact.created_at,
    }));

  const csv = stringify(
    rows,
    {
      header: true,
    }
  );

  return new NextResponse(csv, {
    headers: {
      'Content-Type':
        'text/csv; charset=utf-8',

      'Content-Disposition':
        'attachment; filename="lions-contacts.csv"',
    },
  });
}
