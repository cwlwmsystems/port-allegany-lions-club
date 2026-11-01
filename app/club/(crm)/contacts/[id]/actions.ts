'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function addContactNote(formData: FormData) {
  const contactId = formData.get('contact_id')?.toString();
  const note = formData.get('note')?.toString().trim();

  if (!contactId || !note) {
    return;
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be signed in to add a note.');
  }

  const { error } = await supabase
    .from('contact_notes')
    .insert({
      contact_id: contactId,
      note,
      created_by: user.id,
    });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/club/contacts/${contactId}`);
}
