import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

function clean(
  value: unknown,
  maxLength = 500
) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().slice(0, maxLength);
}

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    // Honeypot.
    if (clean(body.company_website_check)) {
      return NextResponse.json({
        success: true,
      });
    }

    const businessName =
      clean(body.business_name, 160);

    const firstName =
      clean(body.first_name, 100);

    const lastName =
      clean(body.last_name, 100);

    const email =
      clean(body.email, 200)
        .toLowerCase();

    const phone =
      clean(body.phone, 40) || null;

    const website =
      clean(body.website, 300) || null;

    const message =
      clean(body.message, 2000) || null;

    const supportInterests =
      Array.isArray(
        body.support_interests
      )
        ? body.support_interests
            .map((value: unknown) =>
              clean(value, 80)
            )
            .filter(Boolean)
            .slice(0, 10)
        : [];

    if (
      !businessName ||
      !firstName ||
      !lastName ||
      !email
    ) {
      return NextResponse.json(
        {
          error:
            'Business name, contact name, and email are required.',
        },
        {
          status: 400,
        }
      );
    }

    if (
      !email.includes('@')
    ) {
      return NextResponse.json(
        {
          error:
            'Please enter a valid email address.',
        },
        {
          status: 400,
        }
      );
    }

    const supabase =
      await createClient();

    const { error } =
      await supabase
        .from(
          'community_partner_inquiries'
        )
        .insert({
          business_name:
            businessName,
          first_name:
            firstName,
          last_name:
            lastName,
          email,
          phone,
          website,
          support_interests:
            supportInterests,
          message,
          status: 'new',
          source:
            'community_partner_form',
        });

    if (error) {
      console.error(
        'Community partner inquiry error:',
        error
      );

      return NextResponse.json(
        {
          error:
            'Unable to submit your request right now.',
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
    });

  } catch (error) {

    console.error(
      'Community partner form error:',
      error
    );

    return NextResponse.json(
      {
        error:
          'Unable to submit your request right now.',
      },
      {
        status: 500,
      }
    );

  }
}
