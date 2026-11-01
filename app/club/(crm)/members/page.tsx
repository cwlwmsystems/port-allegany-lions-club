import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    dues?: string;
    q?: string;
  }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('memberships')
    .select(`
      id,
      member_number,
      membership_status,
      membership_type,
      join_date,
      officer_role,
      committee,
      dues_status,
      contacts (
        id,
        first_name,
        last_name,
        email,
        mobile_phone
      )
    `)
    .order('join_date', { ascending: false });

  if (params.status) {
    query = query.eq(
      'membership_status',
      params.status
    );
  }

  if (params.dues) {
    query = query.eq(
      'dues_status',
      params.dues
    );
  }

  const { data: memberships, error } =
    await query;

  const filteredMemberships =
    params.q
      ? memberships?.filter((membership: any) => {
          const contact = membership.contacts as any;
          const value = params.q!.toLowerCase();

          return (
            contact?.first_name
              ?.toLowerCase()
              .includes(value) ||
            contact?.last_name
              ?.toLowerCase()
              .includes(value) ||
            contact?.email
              ?.toLowerCase()
              .includes(value)
          );
        })
      : memberships;

  if (error) {
    return (
      <div className="crm-error">
        Unable to load members: {error.message}
      </div>
    );
  }

  return (
    <div>

      <div className="crm-page-header crm-page-header-row">

        <div>
          <h2 className="crm-page-title">
            Members
          </h2>

          <p className="crm-page-description">
            Manage Lions Club membership, roles, committees, and dues status.
          </p>
        </div>

        <Link
          href="/club/members/new"
          className="crm-button"
        >
          + Add Membership
        </Link>

      </div>


      <form
        method="get"
        className="crm-search-filter-bar"
      >
        <input
          type="search"
          name="q"
          placeholder="Search member..."
          defaultValue={params.q || ''}
          className="crm-search-input"
        />

        <select
          name="status"
          defaultValue={params.status || ''}
        >
          <option value="">
            All Membership Statuses
          </option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="former">Former</option>
          <option value="deceased">Deceased</option>
        </select>

        <select
          name="dues"
          defaultValue={params.dues || ''}
        >
          <option value="">All Dues</option>
          <option value="current">Current</option>
          <option value="due">Due</option>
          <option value="overdue">Overdue</option>
          <option value="waived">Waived</option>
          <option value="not_applicable">
            Not Applicable
          </option>
        </select>

        <button
          type="submit"
          className="crm-button"
        >
          Filter
        </button>

        <Link
          href="/club/members"
          className="crm-filter-clear"
        >
          Clear
        </Link>
      </form>

      <div className="crm-result-count">
        {filteredMemberships?.length ?? 0}
        {' '}
        member
        {(filteredMemberships?.length ?? 0) === 1
          ? ''
          : 's'}
      </div>

      <div className="crm-table-card">

        <table className="crm-table">

          <thead>
            <tr>
              <th>Member</th>
              <th>Member #</th>
              <th>Status</th>
              <th>Type</th>
              <th>Joined</th>
              <th>Officer Role</th>
              <th>Committee</th>
              <th>Dues</th>
            </tr>
          </thead>

          <tbody>

            {filteredMemberships?.map((membership: any) => {

              const contact = membership.contacts;

              return (
                <tr key={membership.id}>

                  <td>
                    <Link
                      href={`/club/contacts/${contact.id}`}
                      className="crm-contact-name"
                    >
                      {contact.first_name} {contact.last_name}
                    </Link>

                    {contact.email && (
                      <div className="crm-table-subtext">
                        {contact.email}
                      </div>
                    )}
                  </td>

                  <td>
                    {membership.member_number || '—'}
                  </td>

                  <td>
                    <span
                      className={`crm-status-badge crm-status-${membership.membership_status}`}
                    >
                      {membership.membership_status}
                    </span>
                  </td>

                  <td>
                    {membership.membership_type || '—'}
                  </td>

                  <td>
                    {membership.join_date
                      ? new Intl.DateTimeFormat('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        }).format(
                          new Date(
                            `${membership.join_date}T00:00:00`
                          )
                        )
                      : '—'}
                  </td>

                  <td>
                    {membership.officer_role || '—'}
                  </td>

                  <td>
                    {membership.committee || '—'}
                  </td>

                  <td>
                    <span
                      className={`crm-dues-badge crm-dues-${membership.dues_status}`}
                    >
                      {membership.dues_status.replaceAll('_', ' ')}
                    </span>
                  </td>

                </tr>
              );
            })}

          </tbody>

        </table>

      </div>

    </div>
  );
}
