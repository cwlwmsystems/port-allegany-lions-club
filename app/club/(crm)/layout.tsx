import '@/styles/crm.css';
import '@/styles/lions-ai.css';

import { redirect } from 'next/navigation';

import SidebarNav from '@/components/crm/sidebar-nav';
import LionsAiPanel from '@/components/lions-ai/lions-ai-panel';

import { createClient } from '@/lib/supabase/server';

import { logout } from '../actions/auth-actions';

export default async function CRMLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/club/login');
  }

  const { data: profile } = await supabase
    .from('crm_user_profiles')
    .select('role, full_name')
    .eq('user_id', user.id)
    .single();

  const role =
    (profile?.role || 'viewer') as
      | 'admin'
      | 'officer'
      | 'treasurer'
      | 'membership_chair'
      | 'volunteer_coordinator'
      | 'viewer';

  const roleLabel =
    role
      .replaceAll('_', ' ')
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );

  return (
    <div className={`crm-shell crm-role-${role}`}>

      <div className="crm-layout">

        <aside className="crm-sidebar">

          <div className="crm-brand">

            <p className="crm-brand-kicker">
              Port Allegany Lions
            </p>

            <h1 className="crm-brand-title">
              Club CRM
            </h1>

          </div>

          <SidebarNav role={role} />

        </aside>


        <div className="crm-main">

          <header className="crm-topbar">

            <div className="crm-topbar-user">

              <div className="crm-topbar-identity">

                <strong>
                  {profile?.full_name ||
                    user.email}
                </strong>

                <span>
                  {roleLabel}
                </span>

              </div>

              <form action={logout}>
                <button
                  type="submit"
                  className="crm-logout-button"
                >
                  Log out
                </button>
              </form>

            </div>

          </header>


          <main className="crm-content">
            {children}
          </main>

        </div>

      </div>

      <LionsAiPanel />

    </div>
  );
}
