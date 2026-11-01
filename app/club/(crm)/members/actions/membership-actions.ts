'use server';

import { assertCRMRole } from '@/lib/crm-permissions';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

function optionalString(formData: FormData, key: string) {
  const value = formData.get(key)?.toString().trim();
  return value || null;
}

export async function createMembership(formData: FormData) {
  await assertCRMRole(['admin', 'officer', 'membership_chair']);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be signed in.');
  }

  const contactId = formData.get('contact_id')?.toString();

  if (!contactId) {
    throw new Error('A contact is required.');
  }

  const { data: membership, error } = await supabase
    .from('memberships')
    .insert({
      contact_id: contactId,
      member_number: optionalString(formData, 'member_number'),
      membership_status:
        optionalString(formData, 'membership_status') || 'active',
      membership_type: optionalString(formData, 'membership_type'),
      join_date: optionalString(formData, 'join_date'),
      end_date: optionalString(formData, 'end_date'),
      end_reason: optionalString(formData, 'end_reason'),
      officer_role: optionalString(formData, 'officer_role'),
      committee: optionalString(formData, 'committee'),
      dues_status:
        optionalString(formData, 'dues_status') || 'current',
      last_dues_payment_date:
        optionalString(formData, 'last_dues_payment_date'),
      notes: optionalString(formData, 'notes'),
    })
    .select('id')
    .single();

  if (error || !membership) {
    throw new Error(error?.message || 'Unable to create membership.');
  }

  revalidatePath('/club/members');
  revalidatePath(`/club/contacts/${contactId}`);
  revalidatePath('/club/dashboard');

  redirect(`/club/contacts/${contactId}`);
}


export async function updateMembership(
  membershipId: string,
  formData: FormData
) {
  await assertCRMRole(['admin', 'officer', 'membership_chair']);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be signed in.');
  }

  const contactId = formData.get('contact_id')?.toString();

  if (!contactId) {
    throw new Error('A contact is required.');
  }

  const { error } = await supabase
    .from('memberships')
    .update({
      member_number: optionalString(formData, 'member_number'),
      membership_status:
        optionalString(formData, 'membership_status') || 'active',
      membership_type: optionalString(formData, 'membership_type'),
      join_date: optionalString(formData, 'join_date'),
      end_date: optionalString(formData, 'end_date'),
      end_reason: optionalString(formData, 'end_reason'),
      officer_role: optionalString(formData, 'officer_role'),
      committee: optionalString(formData, 'committee'),
      dues_status:
        optionalString(formData, 'dues_status') || 'current',
      last_dues_payment_date:
        optionalString(formData, 'last_dues_payment_date'),
      notes: optionalString(formData, 'notes'),
    })
    .eq('id', membershipId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/club/members');
  revalidatePath(`/club/contacts/${contactId}`);
  revalidatePath('/club/dashboard');

  redirect(`/club/contacts/${contactId}`);
}
