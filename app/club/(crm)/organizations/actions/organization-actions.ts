'use server';

import { assertCRMRole } from '@/lib/crm-permissions';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

function optionalString(formData: FormData, key: string) {
  const value = formData.get(key)?.toString().trim();
  return value || null;
}

export async function createOrganization(formData: FormData) {
  await assertCRMRole(['admin', 'officer']);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be signed in.');
  }

  const name = formData.get('name')?.toString().trim();

  if (!name) {
    throw new Error('Organization name is required.');
  }

  const { data: organization, error } = await supabase
    .from('organizations')
    .insert({
      name,
      organization_type: optionalString(formData, 'organization_type'),
      email: optionalString(formData, 'email'),
      phone: optionalString(formData, 'phone'),
      website: optionalString(formData, 'website'),
      address_line_1: optionalString(formData, 'address_line_1'),
      address_line_2: optionalString(formData, 'address_line_2'),
      city: optionalString(formData, 'city'),
      state: optionalString(formData, 'state'),
      postal_code: optionalString(formData, 'postal_code'),
      notes: optionalString(formData, 'notes'),
    })
    .select('id')
    .single();

  if (error || !organization) {
    throw new Error(error?.message || 'Unable to create organization.');
  }

  revalidatePath('/club/organizations');

  redirect(`/club/organizations/${organization.id}`);
}

export async function updateOrganization(
  organizationId: string,
  formData: FormData
) {
  await assertCRMRole(['admin', 'officer']);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be signed in.');
  }

  const name = formData.get('name')?.toString().trim();

  if (!name) {
    throw new Error('Organization name is required.');
  }

  const { error } = await supabase
    .from('organizations')
    .update({
      name,
      organization_type: optionalString(formData, 'organization_type'),
      email: optionalString(formData, 'email'),
      phone: optionalString(formData, 'phone'),
      website: optionalString(formData, 'website'),
      address_line_1: optionalString(formData, 'address_line_1'),
      address_line_2: optionalString(formData, 'address_line_2'),
      city: optionalString(formData, 'city'),
      state: optionalString(formData, 'state'),
      postal_code: optionalString(formData, 'postal_code'),
      notes: optionalString(formData, 'notes'),
    })
    .eq('id', organizationId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/club/organizations');
  revalidatePath(`/club/organizations/${organizationId}`);

  redirect(`/club/organizations/${organizationId}`);
}

export async function addContactAssociation(
  organizationId: string,
  formData: FormData
) {
  await assertCRMRole(['admin', 'officer']);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be signed in.');
  }

  const contactId = formData.get('contact_id')?.toString();

  if (!contactId) {
    throw new Error('Contact is required.');
  }

  const { data: existing } = await supabase
    .from('contact_organizations')
    .select('id')
    .eq('contact_id', contactId)
    .eq('organization_id', organizationId)
    .maybeSingle();

  if (existing) {
    throw new Error('This contact is already associated with this organization.');
  }

  const relationshipType =
    optionalString(formData, 'relationship_type');

  const jobTitle =
    optionalString(formData, 'job_title');

  const isPrimary =
    formData.get('is_primary') === 'on';

  if (isPrimary) {
    await supabase
      .from('contact_organizations')
      .update({
        is_primary: false,
      })
      .eq('contact_id', contactId);
  }

  const { error } = await supabase
    .from('contact_organizations')
    .insert({
      contact_id: contactId,
      organization_id: organizationId,
      relationship_type: relationshipType,
      job_title: jobTitle,
      is_primary: isPrimary,
    });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/club/organizations/${organizationId}`);
  revalidatePath(`/club/contacts/${contactId}`);
}

export async function removeContactAssociation(
  organizationId: string,
  associationId: string
) {
  await assertCRMRole(['admin', 'officer']);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be signed in.');
  }

  const { data: association } = await supabase
    .from('contact_organizations')
    .select('contact_id')
    .eq('id', associationId)
    .single();

  const { error } = await supabase
    .from('contact_organizations')
    .delete()
    .eq('id', associationId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/club/organizations/${organizationId}`);

  if (association?.contact_id) {
    revalidatePath(`/club/contacts/${association.contact_id}`);
  }
}
