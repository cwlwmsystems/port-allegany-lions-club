import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    tag?: string;
    status?: string;
  }>;
}) {
  const params = await searchParams;

  const supabase = await createClient();

  const { data: tags } = await supabase
    .from('tags')
    .select('id, name')
    .order('name');

  let query = supabase
    .from('contacts')
    .select(`
      id,
      first_name,
      last_name,
      email,
      mobile_phone,
      phone,
      status,
      do_not_contact,
      contact_tags (
        tag_id,
        tags (
          id,
          name
        )
      ),
      contact_organizations (
        organizations (
          id,
          name
        )
      )
    `)
    .order('last_name')
    .order('first_name');

  if (params.status) {
    query = query.eq(
      'status',
      params.status
    );
  }

  if (params.q) {
    const q = params.q.trim();

    query = query.or(
      [
        `first_name.ilike.%${q}%`,
        `last_name.ilike.%${q}%`,
        `email.ilike.%${q}%`,
        `mobile_phone.ilike.%${q}%`,
        `phone.ilike.%${q}%`,
      ].join(',')
    );
  }

  const { data: contacts, error } =
    await query;

  if (error) {
    return (
      <div className="crm-error">
        Unable to load contacts:
        {' '}
        {error.message}
      </div>
    );
  }

  const filteredContacts =
    params.tag
      ? contacts?.filter((contact: any) =>
          contact.contact_tags?.some(
            (relationship: any) =>
              relationship.tag_id ===
              params.tag
          )
        )
      : contacts;

  return (
    <div>

      <div className="crm-page-header crm-page-header-row">

        <div>
          <h2 className="crm-page-title">
            Contacts
          </h2>

          <p className="crm-page-description">
            Manage people connected with the
            Port Allegany Lions Club.
          </p>
        </div>

        <Link
          href="/club/contacts/new"
          className="crm-button"
        >
          + Add Contact
        </Link>

      </div>


      <form
        method="get"
        className="crm-search-filter-bar"
      >

        <input
          type="search"
          name="q"
          placeholder="Search name, email, or phone..."
          defaultValue={params.q || ''}
          className="crm-search-input"
        />

        <select
          name="tag"
          defaultValue={params.tag || ''}
        >
          <option value="">
            All Contact Types
          </option>

          {tags?.map((tag) => (
            <option
              key={tag.id}
              value={tag.id}
            >
              {tag.name}
            </option>
          ))}
        </select>

        <select
          name="status"
          defaultValue={params.status || ''}
        >
          <option value="">
            All Statuses
          </option>

          <option value="active">
            Active
          </option>

          <option value="inactive">
            Inactive
          </option>
        </select>

        <button
          type="submit"
          className="crm-button"
        >
          Search
        </button>

        <Link
          href="/club/contacts"
          className="crm-filter-clear"
        >
          Clear
        </Link>

      </form>


      <div className="crm-result-count">
        {filteredContacts?.length ?? 0}
        {' '}
        contact
        {(filteredContacts?.length ?? 0) === 1
          ? ''
          : 's'}
      </div>


      <div className="crm-table-card">

        <table className="crm-table">

          <thead>
            <tr>
              <th>Name</th>
              <th>Tags</th>
              <th>Organization</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            {filteredContacts?.map(
              (contact: any) => {

                const organizations =
                  contact.contact_organizations
                    ?.map(
                      (relation: any) =>
                        relation.organizations?.name
                    )
                    .filter(Boolean)
                    .join(', ');

                return (
                  <tr key={contact.id}>

                    <td>
                      <Link
                        href={`/club/contacts/${contact.id}`}
                        className="crm-contact-name"
                      >
                        {contact.first_name}{' '}
                        {contact.last_name}
                      </Link>

                      {contact.do_not_contact && (
                        <div className="crm-dnc">
                          Do Not Contact
                        </div>
                      )}
                    </td>

                    <td>
                      <div className="crm-tag-list">
                        {contact.contact_tags?.map(
                          (relationship: any) => (
                            <span
                              key={relationship.tag_id}
                              className="crm-tag"
                            >
                              {relationship.tags?.name}
                            </span>
                          )
                        )}
                      </div>
                    </td>

                    <td>
                      {organizations || '—'}
                    </td>

                    <td>
                      {contact.email || '—'}
                    </td>

                    <td>
                      {contact.mobile_phone ||
                        contact.phone ||
                        '—'}
                    </td>

                    <td>
                      {contact.status}
                    </td>

                  </tr>
                );
              }
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}
