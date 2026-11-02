'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { lookup } from 'node:dns/promises';

import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

import { createClient } from '@/lib/supabase/server';
import {
  assertCRMRole,
  type CRMRole,
} from '@/lib/crm-permissions';

const ROLES: CRMRole[] = [
  'admin',
  'officer',
];

async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be signed in.');
  }

  return {
    supabase,
    user,
  };
}

export async function markInquiryReviewing(
  formData: FormData
) {
  await assertCRMRole(ROLES);

  const inquiryId =
    formData.get('inquiry_id')?.toString();

  if (!inquiryId) {
    throw new Error('Inquiry ID is required.');
  }

  const { supabase, user } =
    await getCurrentUser();

  const { error } = await supabase
    .from('community_partner_inquiries')
    .update({
      status: 'reviewing',
      reviewed_at:
        new Date().toISOString(),
      reviewed_by: user.id,
    })
    .eq('id', inquiryId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(
    '/club/community-partner-inquiries'
  );
}

export async function declineInquiry(
  formData: FormData
) {
  await assertCRMRole(ROLES);

  const inquiryId =
    formData.get('inquiry_id')?.toString();

  if (!inquiryId) {
    throw new Error('Inquiry ID is required.');
  }

  const { supabase, user } =
    await getCurrentUser();

  const { error } = await supabase
    .from('community_partner_inquiries')
    .update({
      status: 'declined',
      reviewed_at:
        new Date().toISOString(),
      reviewed_by: user.id,
    })
    .eq('id', inquiryId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(
    '/club/community-partner-inquiries'
  );
}

export async function convertInquiryToProspect(
  formData: FormData
) {
  await assertCRMRole(ROLES);

  const inquiryId =
    formData.get('inquiry_id')?.toString();

  if (!inquiryId) {
    throw new Error('Inquiry ID is required.');
  }

  const { supabase, user } =
    await getCurrentUser();

  const {
    data: inquiry,
    error: inquiryError,
  } = await supabase
    .from('community_partner_inquiries')
    .select('*')
    .eq('id', inquiryId)
    .single();

  if (inquiryError || !inquiry) {
    throw new Error(
      inquiryError?.message ||
        'Inquiry not found.'
    );
  }

  if (inquiry.status === 'converted') {
    throw new Error(
      'This inquiry has already been converted.'
    );
  }

  /*
   * --------------------------------------------------------
   * ORGANIZATION
   * --------------------------------------------------------
   */

  const {
    data: existingOrganizations,
    error: organizationSearchError,
  } = await supabase
    .from('organizations')
    .select('id, name')
    .ilike(
      'name',
      inquiry.business_name
    )
    .limit(5);

  if (organizationSearchError) {
    throw new Error(
      organizationSearchError.message
    );
  }

  let organizationId =
    existingOrganizations?.find(
      (organization) =>
        organization.name
          .trim()
          .toLowerCase() ===
        inquiry.business_name
          .trim()
          .toLowerCase()
    )?.id;

  if (!organizationId) {
    const {
      data: organization,
      error: organizationError,
    } = await supabase
      .from('organizations')
      .insert({
        name:
          inquiry.business_name,
        website:
          inquiry.website || null,

        community_partner_status:
          'prospect',

        community_partner_support_types:
          inquiry.support_interests || [],

        community_partner_notes:
          inquiry.message
            ? `Community Partner inquiry:\n${inquiry.message}`
            : 'Created from Community Partner inquiry form.',

        community_partner_website_screenshot_url:
          inquiry.website_screenshot_url || null,

        community_partner_website_screenshot_updated_at:
          inquiry.website_screenshot_updated_at || null,
      })
      .select('id')
      .single();

    if (
      organizationError ||
      !organization
    ) {
      throw new Error(
        organizationError?.message ||
          'Unable to create organization.'
      );
    }

    organizationId =
      organization.id;
  } else {
    const {
      error: organizationUpdateError,
    } = await supabase
      .from('organizations')
      .update({
        community_partner_status:
          'prospect',

        community_partner_support_types:
          inquiry.support_interests || [],

        community_partner_website_screenshot_url:
          inquiry.website_screenshot_url || null,

        community_partner_website_screenshot_updated_at:
          inquiry.website_screenshot_updated_at || null,
      })
      .eq('id', organizationId);

    if (organizationUpdateError) {
      throw new Error(
        organizationUpdateError.message
      );
    }
  }

  /*
   * --------------------------------------------------------
   * CONTACT
   * --------------------------------------------------------
   */

  const {
    data: existingContacts,
    error: contactSearchError,
  } = await supabase
    .from('contacts')
    .select('id, email')
    .ilike(
      'email',
      inquiry.email
    )
    .limit(5);

  if (contactSearchError) {
    throw new Error(
      contactSearchError.message
    );
  }

  let contactId =
    existingContacts?.find(
      (contact) =>
        contact.email
          ?.trim()
          .toLowerCase() ===
        inquiry.email
          .trim()
          .toLowerCase()
    )?.id;

  if (!contactId) {
    const {
      data: contact,
      error: contactError,
    } = await supabase
      .from('contacts')
      .insert({
        first_name:
          inquiry.first_name,
        last_name:
          inquiry.last_name,
        email:
          inquiry.email,
        phone:
          inquiry.phone || null,
      })
      .select('id')
      .single();

    if (
      contactError ||
      !contact
    ) {
      throw new Error(
        contactError?.message ||
          'Unable to create contact.'
      );
    }

    contactId =
      contact.id;
  }

  /*
   * --------------------------------------------------------
   * CONTACT ↔ ORGANIZATION ASSOCIATION
   * --------------------------------------------------------
   */

  const {
    data: existingAssociation,
    error: associationSearchError,
  } = await supabase
    .from('contact_organizations')
    .select('contact_id, organization_id')
    .eq(
      'contact_id',
      contactId
    )
    .eq(
      'organization_id',
      organizationId
    )
    .maybeSingle();

  if (associationSearchError) {
    throw new Error(
      associationSearchError.message
    );
  }

  if (!existingAssociation) {
    const {
      error: associationError,
    } = await supabase
      .from('contact_organizations')
      .insert({
        contact_id:
          contactId,
        organization_id:
          organizationId,
      });

    if (associationError) {
      throw new Error(
        associationError.message
      );
    }
  }

  /*
   * --------------------------------------------------------
   * UPDATE INQUIRY
   * --------------------------------------------------------
   */

  const { error: updateError } =
    await supabase
      .from(
        'community_partner_inquiries'
      )
      .update({
        status: 'converted',
        reviewed_at:
          new Date().toISOString(),
        reviewed_by:
          user.id,
      })
      .eq('id', inquiryId);

  if (updateError) {
    throw new Error(
      updateError.message
    );
  }

  revalidatePath(
    '/club/community-partner-inquiries'
  );

  revalidatePath(
    '/club/community-partners'
  );

  revalidatePath(
    `/club/organizations/${organizationId}`
  );

  redirect(
    `/club/organizations/${organizationId}`
  );
}


function isPrivateAddress(address: string) {
  const value =
    address.toLowerCase();

  if (
    value === '::1' ||
    value === '::' ||
    value.startsWith('fe80:') ||
    value.startsWith('fc') ||
    value.startsWith('fd')
  ) {
    return true;
  }

  const parts =
    value
      .split('.')
      .map(Number);

  if (
    parts.length !== 4 ||
    parts.some(Number.isNaN)
  ) {
    return false;
  }

  const [a, b] = parts;

  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (
      a === 169 &&
      b === 254
    ) ||
    (
      a === 172 &&
      b >= 16 &&
      b <= 31
    ) ||
    (
      a === 192 &&
      b === 168
    ) ||
    (
      a === 100 &&
      b >= 64 &&
      b <= 127
    ) ||
    a >= 224
  );
}


async function assertPublicWebsite(
  url: URL
) {
  if (
    url.protocol !== 'http:' &&
    url.protocol !== 'https:'
  ) {
    throw new Error(
      'Only HTTP and HTTPS websites can be captured.'
    );
  }

  if (
    url.hostname === 'localhost' ||
    url.hostname.endsWith('.local')
  ) {
    throw new Error(
      'Local addresses cannot be captured.'
    );
  }

  const addresses =
    await lookup(
      url.hostname,
      {
        all: true,
        verbatim: true,
      }
    );

  if (
    !addresses.length ||
    addresses.some(
      ({ address }) =>
        isPrivateAddress(address)
    )
  ) {
    throw new Error(
      'This website resolves to a private or unsupported network address.'
    );
  }
}


export async function captureInquiryWebsiteScreenshot(
  formData: FormData
) {
  await assertCRMRole(ROLES);

  const inquiryId =
    formData
      .get('inquiry_id')
      ?.toString();

  if (!inquiryId) {
    throw new Error(
      'Inquiry ID is required.'
    );
  }

  const { supabase } =
    await getCurrentUser();

  const {
    data: inquiry,
    error: inquiryError,
  } = await supabase
    .from(
      'community_partner_inquiries'
    )
    .select(
      'id, business_name, website, status'
    )
    .eq('id', inquiryId)
    .single();

  if (
    inquiryError ||
    !inquiry
  ) {
    throw new Error(
      inquiryError?.message ||
        'Inquiry not found.'
    );
  }

  if (!inquiry.website) {
    throw new Error(
      'This inquiry does not have a website.'
    );
  }

  const websiteUrl =
    new URL(
      inquiry.website
    );

  await assertPublicWebsite(
    websiteUrl
  );

  let browser;

  try {
    const executablePath =
      process.env.CHROME_EXECUTABLE_PATH ||
      await chromium.executablePath();

    browser =
      await puppeteer.launch({
        args: chromium.args,
        executablePath,
        headless: true,
      });

    const page =
      await browser.newPage();

    await page.setViewport({
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
    });

    await page.goto(
      websiteUrl.toString(),
      {
        waitUntil:
          'networkidle2',
        timeout:
          25000,
      }
    );

    const screenshot =
      await page.screenshot({
        type: 'jpeg',
        quality: 82,
        fullPage: false,
      });

    const storagePath =
      `inquiries/${inquiryId}.jpg`;

    const {
      error: uploadError,
    } = await supabase.storage
      .from(
        'partner-screenshots'
      )
      .upload(
        storagePath,
        Buffer.from(
          screenshot
        ),
        {
          contentType:
            'image/jpeg',

          cacheControl:
            '3600',

          upsert:
            true,
        }
      );

    if (uploadError) {
      throw new Error(
        uploadError.message
      );
    }

    const {
      data: publicUrlData,
    } = supabase.storage
      .from(
        'partner-screenshots'
      )
      .getPublicUrl(
        storagePath
      );

    const {
      error: updateError,
    } = await supabase
      .from(
        'community_partner_inquiries'
      )
      .update({
        website_screenshot_url:
          publicUrlData.publicUrl,

        website_screenshot_updated_at:
          new Date().toISOString(),
      })
      .eq(
        'id',
        inquiryId
      );

    if (updateError) {
      throw new Error(
        updateError.message
      );
    }

    /*
     * If this inquiry has already been converted,
     * carry the refreshed screenshot into the
     * corresponding Organization as well.
     */
    if (
      inquiry.status === 'converted'
    ) {
      const {
        data: matchingOrganizations,
        error: organizationSearchError,
      } = await supabase
        .from('organizations')
        .select('id, name')
        .ilike(
          'name',
          inquiry.business_name
        )
        .limit(10);

      if (organizationSearchError) {
        throw new Error(
          organizationSearchError.message
        );
      }

      const organization =
        matchingOrganizations?.find(
          (item) =>
            item.name
              .trim()
              .toLowerCase() ===
            inquiry.business_name
              .trim()
              .toLowerCase()
        );

      if (organization) {
        const {
          error: organizationUpdateError,
        } = await supabase
          .from('organizations')
          .update({
            community_partner_website_screenshot_url:
              publicUrlData.publicUrl,

            community_partner_website_screenshot_updated_at:
              new Date().toISOString(),
          })
          .eq(
            'id',
            organization.id
          );

        if (organizationUpdateError) {
          throw new Error(
            organizationUpdateError.message
          );
        }

        revalidatePath(
          `/club/organizations/${organization.id}`
        );
      }
    }

  } finally {
    if (browser) {
      await browser.close();
    }
  }

  revalidatePath(
    '/club/community-partner-inquiries'
  );
}
