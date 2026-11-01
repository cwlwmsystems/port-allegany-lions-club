'use server';

import { assertCRMRole } from '@/lib/crm-permissions';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

function optionalString(formData: FormData, key: string) {
  const value = formData.get(key)?.toString().trim();
  return value || null;
}

export async function createCampaign(formData: FormData) {
  await assertCRMRole(['admin', 'officer', 'treasurer']);
  const supabase = await createClient();

  const name =
    formData.get('name')?.toString().trim();

  if (!name) {
    throw new Error('Campaign name is required.');
  }

  const goalValue =
    formData.get('goal_amount')?.toString();

  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      name,
      campaign_type:
        optionalString(formData, 'campaign_type') ||
        'General Fund',
      description:
        optionalString(formData, 'description'),
      start_date:
        optionalString(formData, 'start_date'),
      end_date:
        optionalString(formData, 'end_date'),
      goal_amount:
        goalValue ? Number(goalValue) : null,
      status:
        optionalString(formData, 'status') ||
        'active',
    })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error(
      error?.message || 'Unable to create campaign.'
    );
  }

  revalidatePath('/club/campaigns');

  redirect(`/club/campaigns/${data.id}`);
}


export async function updateCampaign(
  campaignId: string,
  formData: FormData
) {
  await assertCRMRole(['admin', 'officer', 'treasurer']);
  const supabase = await createClient();

  const name =
    formData.get('name')?.toString().trim();

  if (!name) {
    throw new Error('Campaign name is required.');
  }

  const goalValue =
    formData.get('goal_amount')?.toString();

  const { error } = await supabase
    .from('campaigns')
    .update({
      name,
      campaign_type:
        optionalString(formData, 'campaign_type') ||
        'General Fund',
      description:
        optionalString(formData, 'description'),
      start_date:
        optionalString(formData, 'start_date'),
      end_date:
        optionalString(formData, 'end_date'),
      goal_amount:
        goalValue ? Number(goalValue) : null,
      status:
        optionalString(formData, 'status') ||
        'active',
    })
    .eq('id', campaignId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/club/campaigns');
  revalidatePath(`/club/campaigns/${campaignId}`);

  redirect(`/club/campaigns/${campaignId}`);
}
