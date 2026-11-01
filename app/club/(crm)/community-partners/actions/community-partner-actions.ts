'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '@/lib/supabase/server';
import {
  assertCRMRole,
  type CRMRole,
} from '@/lib/crm-permissions';

const ROLES: CRMRole[] = [
  'admin',
  'officer',
];

function optionalString(
  formData: FormData,
  key: string
) {
  const value =
    formData.get(key)?.toString().trim();

  return value || null;
}

export async function logCommunityPartnerOutreach(
  formData: FormData
) {
  await assertCRMRole(ROLES);

  const organizationId =
    formData
      .get('organization_id')
      ?.toString();

  if (!organizationId) {
    throw new Error(
      'Organization ID is required.'
    );
  }

  const outreachType =
    optionalString(
      formData,
      'outreach_type'
    ) || 'facebook';

  const outcome =
    optionalString(
      formData,
      'outcome'
    );

  const notes =
    optionalString(
      formData,
      'notes'
    );

  const nextFollowUp =
    optionalString(
      formData,
      'next_follow_up'
    );

  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      'You must be signed in.'
    );
  }

  const {
    data: organization,
    error: loadError,
  } = await supabase
    .from('organizations')
    .select(
      'community_partner_status'
    )
    .eq('id', organizationId)
    .single();

  if (
    loadError ||
    !organization
  ) {
    throw new Error(
      loadError?.message ||
        'Organization not found.'
    );
  }

  const {
    error: outreachError,
  } = await supabase
    .from(
      'community_partner_outreach'
    )
    .insert({
      organization_id:
        organizationId,
      outreach_type:
        outreachType,
      outcome,
      notes,
      next_follow_up:
        nextFollowUp,
      created_by:
        user.id,
    });

  if (outreachError) {
    throw new Error(
      outreachError.message
    );
  }

  const today =
    new Date()
      .toISOString()
      .slice(0, 10);

  let status =
    organization.community_partner_status;

  if (
    status === 'prospect' ||
    status === 'not_prospect'
  ) {
    status = 'contacted';
  }

  if (outcome === 'interested') {
    status = 'interested';
  }

  if (
    outcome ===
    'not_interested'
  ) {
    status =
      'not_interested';
  }

  if (
    outcome ===
    'follow_up'
  ) {
    status =
      'follow_up_later';
  }

  const { error: updateError } =
    await supabase
      .from('organizations')
      .update({
        community_partner_status:
          status,
        community_partner_last_contacted:
          today,
        community_partner_next_follow_up:
          nextFollowUp,
      })
      .eq(
        'id',
        organizationId
      );

  if (updateError) {
    throw new Error(
      updateError.message
    );
  }

  revalidatePath(
    '/club/community-partners'
  );

  revalidatePath(
    `/club/organizations/${organizationId}`
  );
}
