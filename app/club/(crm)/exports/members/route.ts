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
      .from('memberships')
      .select(`
        member_number,
        membership_status,
        membership_type,
        join_date,
        end_date,
        end_reason,
        officer_role,
        committee,
        dues_status,
        last_dues_payment_date,
        notes,
        contacts (
          first_name,
          last_name,
          email
        )
      `)
      .order('join_date', {
        ascending: false,
      });

  if (error) {
    return new NextResponse(
      error.message,
      { status: 500 }
    );
  }

  const rows =
    (data ?? []).map(
      (membership: any) => {

        const contact =
          membership.contacts as any;

        return {
          'First Name':
            contact?.first_name ?? '',

          'Last Name':
            contact?.last_name ?? '',

          Email:
            contact?.email ?? '',

          'Member Number':
            membership.member_number ?? '',

          'Membership Status':
            membership.membership_status,

          'Membership Type':
            membership.membership_type ?? '',

          'Join Date':
            membership.join_date ?? '',

          'End Date':
            membership.end_date ?? '',

          'End Reason':
            membership.end_reason ?? '',

          'Officer Role':
            membership.officer_role ?? '',

          Committee:
            membership.committee ?? '',

          'Dues Status':
            membership.dues_status,

          'Last Dues Payment Date':
            membership.last_dues_payment_date ?? '',

          Notes:
            membership.notes ?? '',
        };
      }
    );

  const csv = stringify(
    rows,
    { header: true }
  );

  return new NextResponse(csv, {
    headers: {
      'Content-Type':
        'text/csv; charset=utf-8',

      'Content-Disposition':
        'attachment; filename="lions-members.csv"',
    },
  });
}
