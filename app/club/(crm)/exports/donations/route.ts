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
      'treasurer',
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
      .from('donations')
      .select(`
        donation_date,
        amount,
        donation_type,
        payment_method,
        receipt_number,
        receipt_sent,
        anonymous,
        notes,
        contacts (
          first_name,
          last_name,
          email
        ),
        organizations (
          name
        ),
        campaigns (
          name
        )
      `)
      .order('donation_date', {
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
      (donation: any) => {

        const contact =
          donation.contacts as any;

        const organization =
          donation.organizations as any;

        const campaign =
          donation.campaigns as any;

        return {
          'Donation Date':
            donation.donation_date,

          Amount:
            donation.amount,

          'Donation Type':
            donation.donation_type,

          'Payment Method':
            donation.payment_method ?? '',

          'First Name':
            contact?.first_name ?? '',

          'Last Name':
            contact?.last_name ?? '',

          Email:
            contact?.email ?? '',

          Organization:
            organization?.name ?? '',

          Campaign:
            campaign?.name ?? '',

          'Receipt Number':
            donation.receipt_number ?? '',

          'Receipt Sent':
            donation.receipt_sent
              ? 'Yes'
              : 'No',

          Anonymous:
            donation.anonymous
              ? 'Yes'
              : 'No',

          Notes:
            donation.notes ?? '',
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
        'attachment; filename="lions-donations.csv"',
    },
  });
}
