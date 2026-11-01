import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function OrganizationsPage() {
  const supabase = await createClient();

  const { data: organizations, error } = await supabase
    .from('organizations')
    .select(`
      id,
      name,
      organization_type,
      phone,
      website,
      city,
      state,
      contact_organizations (
        id
      )
    `)
    .order('name');

  if (error) {
    return (
      <div className="crm-error">
        Unable to load organizations: {error.message}
      </div>
    );
  }

  return (
    <div>

      <div className="crm-page-header crm-page-header-row">

        <div>
          <h2 className="crm-page-title">
            Organizations
          </h2>

          <p className="crm-page-description">
            Manage businesses, schools, nonprofits, sponsors,
            and community organizations.
          </p>
        </div>

        <Link
          href="/club/organizations/new"
          className="crm-button"
        >
          + Add Organization
        </Link>

      </div>


      <div className="crm-table-card">

        <table className="crm-table">

          <thead>
            <tr>
              <th>Organization</th>
              <th>Type</th>
              <th>Location</th>
              <th>Contacts</th>
              <th>Phone</th>
            </tr>
          </thead>

          <tbody>

            {organizations?.map((organization) => (

              <tr key={organization.id}>

                <td>
                  <Link
                    href={`/club/organizations/${organization.id}`}
                    className="crm-contact-name"
                  >
                    {organization.name}
                  </Link>
                </td>

                <td>
                  {organization.organization_type || '—'}
                </td>

                <td>
                  {[
                    organization.city,
                    organization.state,
                  ]
                    .filter(Boolean)
                    .join(', ') || '—'}
                </td>

                <td>
                  {organization.contact_organizations?.length ?? 0}
                </td>

                <td>
                  {organization.phone || '—'}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}
