'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

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
