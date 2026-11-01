'use server';

import { assertCRMRole } from '@/lib/crm-permissions';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

function getOptionalString(formData: FormData, key: string) {
  const value = formData.get(key)?.toString().trim();
  return value || null;
}

export async function createContact(formData: FormData) {
  await assertCRMRole(['admin', 'officer', 'membership_chair']);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be signed in.');
  }

  const firstName = formData.get('first_name')?.toString().trim();
  const lastName = formData.get('last_name')?.toString().trim();

  if (!firstName || !lastName) {
    throw new Error('First name and last name are required.');
  }

  const { data: contact, error } = await supabase
    .from('contacts')
    .insert({
      first_name: firstName,
      last_name: lastName,
      email: getOptionalString(formData, 'email'),
      phone: getOptionalString(formData, 'phone'),
      mobile_phone: getOptionalString(formData, 'mobile_phone'),
      address_line_1: getOptionalString(formData, 'address_line_1'),
      address_line_2: getOptionalString(formData, 'address_line_2'),
      city: getOptionalString(formData, 'city'),
      state: getOptionalString(formData, 'state'),
      postal_code: getOptionalString(formData, 'postal_code'),
      preferred_contact_method: getOptionalString(
        formData,
        'preferred_contact_method'
      ),
      status: getOptionalString(formData, 'status') || 'active',
      birthday: getOptionalString(formData, 'birthday'),
      occupation: getOptionalString(formData, 'occupation'),
      employer_name: getOptionalString(formData, 'employer_name'),
      source: getOptionalString(formData, 'source'),
      general_notes: getOptionalString(formData, 'general_notes'),
      do_not_contact: formData.get('do_not_contact') === 'on',
    })
    .select('id')
    .single();

  if (error || !contact) {
    throw new Error(error?.message || 'Unable to create contact.');
  }

  const tagIds = formData.getAll('tag_ids').map(String);

  if (tagIds.length) {
    const { error: tagError } = await supabase
      .from('contact_tags')
      .insert(
        tagIds.map((tagId) => ({
          contact_id: contact.id,
          tag_id: tagId,
        }))
      );

    if (tagError) {
      throw new Error(tagError.message);
    }
  }

  revalidatePath('/club/contacts');
  redirect(`/club/contacts/${contact.id}`);
}

export async function updateContact(
  contactId: string,
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

  const firstName = formData.get('first_name')?.toString().trim();
  const lastName = formData.get('last_name')?.toString().trim();

  if (!firstName || !lastName) {
    throw new Error('First name and last name are required.');
  }

  const { error } = await supabase
    .from('contacts')
    .update({
      first_name: firstName,
      last_name: lastName,
      email: getOptionalString(formData, 'email'),
      phone: getOptionalString(formData, 'phone'),
      mobile_phone: getOptionalString(formData, 'mobile_phone'),
      address_line_1: getOptionalString(formData, 'address_line_1'),
      address_line_2: getOptionalString(formData, 'address_line_2'),
      city: getOptionalString(formData, 'city'),
      state: getOptionalString(formData, 'state'),
      postal_code: getOptionalString(formData, 'postal_code'),
      preferred_contact_method: getOptionalString(
        formData,
        'preferred_contact_method'
      ),
      status: getOptionalString(formData, 'status') || 'active',
      birthday: getOptionalString(formData, 'birthday'),
      occupation: getOptionalString(formData, 'occupation'),
      employer_name: getOptionalString(formData, 'employer_name'),
      source: getOptionalString(formData, 'source'),
      general_notes: getOptionalString(formData, 'general_notes'),
      do_not_contact: formData.get('do_not_contact') === 'on',
    })
    .eq('id', contactId);

  if (error) {
    throw new Error(error.message);
  }

  const tagIds = formData.getAll('tag_ids').map(String);

  const { error: deleteTagError } = await supabase
    .from('contact_tags')
    .delete()
    .eq('contact_id', contactId);

  if (deleteTagError) {
    throw new Error(deleteTagError.message);
  }

  if (tagIds.length) {
    const { error: insertTagError } = await supabase
      .from('contact_tags')
      .insert(
        tagIds.map((tagId) => ({
          contact_id: contactId,
          tag_id: tagId,
        }))
      );

    if (insertTagError) {
      throw new Error(insertTagError.message);
    }
  }

  revalidatePath('/club/contacts');
  revalidatePath(`/club/contacts/${contactId}`);

  redirect(`/club/contacts/${contactId}`);
}
