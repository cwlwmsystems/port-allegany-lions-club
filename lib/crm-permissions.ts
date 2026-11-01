import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type CRMRole =
  | 'admin'
  | 'officer'
  | 'treasurer'
  | 'membership_chair'
  | 'volunteer_coordinator'
  | 'viewer';


export async function getCurrentCRMRole(): Promise<CRMRole> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/club/login');
  }

  const { data } = await supabase
    .from('crm_user_profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  return (data?.role || 'viewer') as CRMRole;
}


export async function assertCRMRole(
  allowed: CRMRole[]
) {
  const role = await getCurrentCRMRole();

  if (!allowed.includes(role)) {
    throw new Error(
      `Your CRM role (${role.replaceAll('_', ' ')}) does not have permission to perform this action.`
    );
  }

  return role;
}


export async function requireCRMRole(
  allowed: CRMRole[]
) {
  const role = await getCurrentCRMRole();

  if (!allowed.includes(role)) {
    redirect('/club/access-denied');
  }

  return role;
}
