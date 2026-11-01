'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

function optionalString(formData: FormData, key: string) {
  const value = formData.get(key)?.toString().trim();
  return value || null;
}

export async function createTask(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be signed in.');
  }

  const title =
    formData.get('title')?.toString().trim();

  if (!title) {
    throw new Error('Task title is required.');
  }

  const contactId =
    optionalString(formData, 'contact_id');

  const organizationId =
    optionalString(formData, 'organization_id');

  if (!contactId && !organizationId) {
    throw new Error(
      'A task must be associated with a contact or organization.'
    );
  }

  const { error } = await supabase
    .from('tasks')
    .insert({
      title,
      description:
        optionalString(formData, 'description'),
      contact_id: contactId,
      organization_id: organizationId,
      assigned_user_id: user.id,
      due_date:
        optionalString(formData, 'due_date'),
      priority:
        optionalString(formData, 'priority') ||
        'normal',
      status:
        optionalString(formData, 'status') ||
        'open',
    });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/club/tasks');
  revalidatePath('/club/dashboard');

  if (contactId) {
    revalidatePath(`/club/contacts/${contactId}`);
  }

  if (organizationId) {
    revalidatePath(
      `/club/organizations/${organizationId}`
    );
  }

  redirect('/club/tasks');
}


export async function updateTask(
  taskId: string,
  formData: FormData
) {
  const supabase = await createClient();

  const title =
    formData.get('title')?.toString().trim();

  if (!title) {
    throw new Error('Task title is required.');
  }

  const contactId =
    optionalString(formData, 'contact_id');

  const organizationId =
    optionalString(formData, 'organization_id');

  if (!contactId && !organizationId) {
    throw new Error(
      'A task must be associated with a contact or organization.'
    );
  }

  const status =
    optionalString(formData, 'status') || 'open';

  const { error } = await supabase
    .from('tasks')
    .update({
      title,
      description:
        optionalString(formData, 'description'),
      contact_id: contactId,
      organization_id: organizationId,
      due_date:
        optionalString(formData, 'due_date'),
      priority:
        optionalString(formData, 'priority') ||
        'normal',
      status,
      completed_at:
        status === 'completed'
          ? new Date().toISOString()
          : null,
    })
    .eq('id', taskId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/club/tasks');
  revalidatePath('/club/dashboard');

  if (contactId) {
    revalidatePath(`/club/contacts/${contactId}`);
  }

  redirect('/club/tasks');
}


export async function completeTask(taskId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('tasks')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', taskId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/club/tasks');
  revalidatePath('/club/dashboard');
}
