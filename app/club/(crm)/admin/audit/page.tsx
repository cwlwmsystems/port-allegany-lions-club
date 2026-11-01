import { requireCRMRole } from '@/lib/crm-permissions';
import { createClient } from '@/lib/supabase/server';

function formatTable(value: string) {
  return value
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{
    table?: string;
    action?: string;
  }>;
}) {
  await requireCRMRole(['admin']);

  const params = await searchParams;

  const supabase = await createClient();

  let query = supabase
    .from('crm_audit_log')
    .select(`
      id,
      table_name,
      record_id,
      action,
      actor_email,
      actor_role,
      old_values,
      new_values,
      created_at
    `)
    .order('created_at', {
      ascending: false,
    })
    .limit(200);

  if (params.table) {
    query = query.eq(
      'table_name',
      params.table
    );
  }

  if (params.action) {
    query = query.eq(
      'action',
      params.action
    );
  }

  const { data: entries, error } =
    await query;

  if (error) {
    return (
      <div className="crm-error-state">
        <strong>
          Unable to load audit history.
        </strong>

        <span>{error.message}</span>
      </div>
    );
  }

  return (
    <div>

      <div className="crm-page-header">

        <h2 className="crm-page-title">
          Audit Log
        </h2>

        <p className="crm-page-description">
          Append-only history of sensitive CRM changes.
        </p>

      </div>


      <form
        method="get"
        className="crm-filter-bar"
      >

        <select
          name="table"
          defaultValue={params.table || ''}
        >
          <option value="">
            All Record Types
          </option>

          <option value="contacts">
            Contacts
          </option>

          <option value="organizations">
            Organizations
          </option>

          <option value="memberships">
            Memberships
          </option>

          <option value="events">
            Events
          </option>

          <option value="event_participants">
            Event Participants
          </option>

          <option value="donations">
            Donations
          </option>

          <option value="campaigns">
            Campaigns
          </option>

          <option value="tasks">
            Tasks
          </option>

          <option value="crm_user_profiles">
            User Roles
          </option>
        </select>


        <select
          name="action"
          defaultValue={params.action || ''}
        >
          <option value="">
            All Actions
          </option>

          <option value="INSERT">
            Created
          </option>

          <option value="UPDATE">
            Updated
          </option>

          <option value="DELETE">
            Deleted
          </option>
        </select>


        <button
          type="submit"
          className="crm-button crm-button-secondary"
        >
          Filter
        </button>

      </form>


      <div className="crm-table-card">

        <table className="crm-table">

          <thead>
            <tr>
              <th>Date</th>
              <th>Record Type</th>
              <th>Action</th>
              <th>User</th>
              <th>Role</th>
              <th>Record ID</th>
            </tr>
          </thead>

          <tbody>

            {entries?.map((entry) => (

              <tr key={entry.id}>

                <td>
                  {new Intl.DateTimeFormat(
                    'en-US',
                    {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    }
                  ).format(
                    new Date(entry.created_at)
                  )}
                </td>

                <td>
                  {formatTable(
                    entry.table_name
                  )}
                </td>

                <td>
                  <span
                    className={`crm-audit-action crm-audit-${entry.action.toLowerCase()}`}
                  >
                    {entry.action}
                  </span>
                </td>

                <td>
                  {entry.actor_email ||
                    'System'}
                </td>

                <td>
                  {entry.actor_role
                    ?.replaceAll('_', ' ') ||
                    '—'}
                </td>

                <td>
                  <code className="crm-audit-id">
                    {entry.record_id || '—'}
                  </code>
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {!entries?.length && (
        <div className="crm-empty-state">
          No audit entries match these filters.
        </div>
      )}

    </div>
  );
}
