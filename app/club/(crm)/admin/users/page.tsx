import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { updateUserRole } from './actions/user-actions';
import { requireCRMRole } from '@/lib/crm-permissions';

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  officer: 'Officer',
  treasurer: 'Treasurer',
  membership_chair: 'Membership Chair',
  volunteer_coordinator:
    'Volunteer Coordinator',
  viewer: 'Viewer',
};

export default async function UsersPage() {
  await requireCRMRole(['admin']);

const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/club/login');
  }

  const { data: currentProfile } =
    await supabase
      .from('crm_user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

  if (currentProfile?.role !== 'admin') {
    redirect('/club/dashboard');
  }

  const { data: profiles, error } =
    await supabase
      .from('crm_user_profiles')
      .select(`
        user_id,
        email,
        full_name,
        role,
        created_at
      `)
      .order('email');

  if (error) {
    return (
      <div className="crm-error-state">
        <strong>
          Unable to load CRM users.
        </strong>
        <span>{error.message}</span>
      </div>
    );
  }

  return (
    <div>

      <div className="crm-page-header">
        <h2 className="crm-page-title">
          Users & Roles
        </h2>

        <p className="crm-page-description">
          Control what authenticated Lions CRM
          users are allowed to manage.
        </p>
      </div>


      <div className="crm-panel">

        <div className="crm-panel-header">
          <h3>CRM Users</h3>
        </div>

        <div className="crm-table-card crm-table-card-flat">

          <table className="crm-table">

            <thead>
              <tr>
                <th>User</th>
                <th>Current Role</th>
                <th>Change Role</th>
              </tr>
            </thead>

            <tbody>

              {profiles?.map((profile) => {

                const action =
                  updateUserRole.bind(
                    null,
                    profile.user_id
                  );

                return (
                  <tr key={profile.user_id}>

                    <td>
                      <strong>
                        {profile.full_name ||
                          profile.email ||
                          'CRM User'}
                      </strong>

                      {profile.full_name &&
                        profile.email && (
                        <div className="crm-table-subtext">
                          {profile.email}
                        </div>
                      )}
                    </td>

                    <td>
                      <span className="crm-role-badge">
                        {roleLabels[
                          profile.role
                        ] || profile.role}
                      </span>
                    </td>

                    <td>
                      <form
                        action={action}
                        className="crm-role-form"
                      >

                        <select
                          name="role"
                          defaultValue={
                            profile.role
                          }
                        >
                          <option value="admin">
                            Admin
                          </option>

                          <option value="officer">
                            Officer
                          </option>

                          <option value="treasurer">
                            Treasurer
                          </option>

                          <option value="membership_chair">
                            Membership Chair
                          </option>

                          <option value="volunteer_coordinator">
                            Volunteer Coordinator
                          </option>

                          <option value="viewer">
                            Viewer
                          </option>
                        </select>

                        <button
                          type="submit"
                          className="crm-button crm-button-secondary"
                        >
                          Save
                        </button>

                      </form>
                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}