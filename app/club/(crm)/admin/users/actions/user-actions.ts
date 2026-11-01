'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

const allowedRoles = [
  'admin',
  'officer',
  'treasurer',
  'membership_chair',
  'volunteer_coordinator',
  'viewer',
];

export async function updateUserRole(
  userId: string,
  formData: FormData
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not signed in.');
  }

  const { data: profile } = await supabase
    .from('crm_user_profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    throw new Error(
      'Only administrators can change user roles.'
    );
  }

  const role =
    formData.get('role')?.toString();

  if (!role || !allowedRoles.includes(role)) {
    throw new Error('Invalid CRM role.');
  }

  const { error } = await supabase
    .from('crm_user_profiles')
    .update({ role })
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/club/admin/users');
}
