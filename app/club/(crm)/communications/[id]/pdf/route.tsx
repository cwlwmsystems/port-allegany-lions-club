import path from 'path';

import {
  renderToBuffer,
} from '@react-pdf/renderer';

import { createClient } from '@/lib/supabase/server';
import { requireCRMRole, type CRMRole } from '@/lib/crm-permissions';

import LetterPdf from '@/components/crm/communications/letter-pdf';

const ROLES: CRMRole[] = [
  'admin',
  'officer',
  'membership_chair',
  'treasurer',
];

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  await requireCRMRole(ROLES);

  const { id } =
    await params;

  const supabase =
    await createClient();

  const {
    data: communication,
    error,
  } = await supabase
    .from('communications')
    .select(`
      *,
      contacts (
        address_line_1,
        address_line_2,
        city,
        state,
        postal_code
      )
    `)
    .eq('id', id)
    .single();

  if (
    error ||
    !communication
  ) {
    return new Response(
      'Communication not found.',
      {
        status: 404,
      }
    );
  }

  if (
    communication.communication_type !==
    'letter'
  ) {
    return new Response(
      'This communication is not a letter.',
      {
        status: 400,
      }
    );
  }

  const contact =
    communication.contacts as any;

  const addressLines: string[] =
    [];

  if (
    contact?.address_line_1
  ) {
    addressLines.push(
      contact.address_line_1
    );
  }

  if (
    contact?.address_line_2
  ) {
    addressLines.push(
      contact.address_line_2
    );
  }

  const locality = [
    contact?.city,
    contact?.state,
  ]
    .filter(Boolean)
    .join(', ');

  const finalLocality = [
    locality,
    contact?.postal_code,
  ]
    .filter(Boolean)
    .join(' ');

  if (finalLocality) {
    addressLines.push(
      finalLocality
    );
  }

  const logoPath = path.join(
    process.cwd(),
    'public',
    'images',
    'lions-emblem-official.png'
  );

  const buffer =
    await renderToBuffer(
      <LetterPdf
        recipientName={
          communication.recipient_name
        }
        addressLines={addressLines}
        body={communication.body}
        date={
          new Intl.DateTimeFormat(
            'en-US',
            {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            }
          ).format(
            new Date()
          )
        }
        logoPath={logoPath}
      />
    );

  const safeName = (
    communication.recipient_name ||
    'letter'
  )
    .replace(
      /[^a-zA-Z0-9]+/g,
      '-'
    )
    .replace(
      /^-+|-+$/g,
      ''
    );

  return new Response(
    new Uint8Array(buffer),
    {
      headers: {
        'Content-Type':
          'application/pdf',

        'Content-Disposition':
          `attachment; filename="Port-Allegany-Lions-${safeName || 'Letter'}.pdf"`,
      },
    }
  );
}
