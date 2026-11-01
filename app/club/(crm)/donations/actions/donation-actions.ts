'use server';

import { assertCRMRole } from '@/lib/crm-permissions';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

function optionalString(formData: FormData, key: string) {
  const value = formData.get(key)?.toString().trim();
  return value || null;
}

export async function createDonation(formData: FormData) {
  await assertCRMRole(['admin', 'officer', 'treasurer']);
  const supabase = await createClient();

  const donationDate =
    formData.get('donation_date')?.toString();

  if (!donationDate) {
    throw new Error('Donation date is required.');
  }

  const amount =
    Number(formData.get('amount')?.toString() || 0);

  const contactId =
    optionalString(formData, 'contact_id');

  const organizationId =
    optionalString(formData, 'organization_id');

  if (!contactId && !organizationId) {
    throw new Error(
      'A donation must be associated with a contact or organization.'
    );
  }

  const { data: donation, error } = await supabase
    .from('donations')
    .insert({
      contact_id: contactId,
      organization_id: organizationId,
      campaign_id:
        optionalString(formData, 'campaign_id'),
      donation_date: donationDate,
      amount: Number.isFinite(amount) ? amount : 0,
      donation_type:
        optionalString(formData, 'donation_type') ||
        'Monetary',
      payment_method:
        optionalString(formData, 'payment_method'),
      receipt_number:
        optionalString(formData, 'receipt_number'),
      receipt_sent:
        formData.get('receipt_sent') === 'on',
      anonymous:
        formData.get('anonymous') === 'on',
      notes:
        optionalString(formData, 'notes'),
    })
    .select('id')
    .single();

  if (error || !donation) {
    throw new Error(
      error?.message || 'Unable to create donation.'
    );
  }

  revalidatePath('/club/donations');
  revalidatePath('/club/dashboard');

  if (contactId) {
    revalidatePath(`/club/contacts/${contactId}`);
  }

  if (organizationId) {
    revalidatePath(
      `/club/organizations/${organizationId}`
    );
  }

  redirect(`/club/donations`);
}


export async function updateDonation(
  donationId: string,
  formData: FormData
) {
  await assertCRMRole(['admin', 'officer', 'treasurer']);
  const supabase = await createClient();

  const donationDate =
    formData.get('donation_date')?.toString();

  if (!donationDate) {
    throw new Error('Donation date is required.');
  }

  const amount =
    Number(formData.get('amount')?.toString() || 0);

  const contactId =
    optionalString(formData, 'contact_id');

  const organizationId =
    optionalString(formData, 'organization_id');

  if (!contactId && !organizationId) {
    throw new Error(
      'A donation must be associated with a contact or organization.'
    );
  }

  const { error } = await supabase
    .from('donations')
    .update({
      contact_id: contactId,
      organization_id: organizationId,
      campaign_id:
        optionalString(formData, 'campaign_id'),
      donation_date: donationDate,
      amount: Number.isFinite(amount) ? amount : 0,
      donation_type:
        optionalString(formData, 'donation_type') ||
        'Monetary',
      payment_method:
        optionalString(formData, 'payment_method'),
      receipt_number:
        optionalString(formData, 'receipt_number'),
      receipt_sent:
        formData.get('receipt_sent') === 'on',
      anonymous:
        formData.get('anonymous') === 'on',
      notes:
        optionalString(formData, 'notes'),
    })
    .eq('id', donationId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/club/donations');
  revalidatePath('/club/dashboard');

  if (contactId) {
    revalidatePath(`/club/contacts/${contactId}`);
  }

  if (organizationId) {
    revalidatePath(
      `/club/organizations/${organizationId}`
    );
  }

  redirect('/club/donations');
}
