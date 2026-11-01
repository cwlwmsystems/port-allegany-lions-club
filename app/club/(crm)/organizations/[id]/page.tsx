import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

import {
  addContactAssociation,
  removeContactAssociation,
} from '../actions/organization-actions';

export default async function OrganizationRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: organization, error } = await supabase
    .from('organizations')
    .select(`
      *,
      contact_organizations (
        id,
        relationship_type,
        job_title,
        is_primary,
        contacts (
          id,
          first_name,
          last_name,
          email,
          mobile_phone
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error || !organization) {
    notFound();
  }

  const { data: contacts } = await supabase
    .from('contacts')
    .select('id, first_name, last_name, email')
    .order('last_name')
    .order('first_name');

  const fullAddress = [
    organization.address_line_1,
    organization.address_line_2,
    organization.city,
    organization.state,
    organization.postal_code,
  ]
    .filter(Boolean)
    .join(', ');

  const addAssociation =
    addContactAssociation.bind(null, organization.id);

  return (
    <div>

      <div className="crm-record-breadcrumb">

        <Link href="/club/organizations">
          Organizations
        </Link>

        <span>/</span>

        <span>
          {organization.name}
        </span>

      </div>


      <div className="crm-record-header">

        <div>

          <h2 className="crm-record-title">
            {organization.name}
          </h2>

          <div className="crm-record-subtitle">
            {organization.organization_type || 'Organization'}
          </div>

        </div>

        <div className="crm-record-actions">

          <Link
            href={`/club/tasks/new?organization=${organization.id}`}
            className="crm-button crm-button-secondary"
          >
            + Task
          </Link>

          <Link
            href={`/club/donations/new?organization=${organization.id}`}
            className="crm-button crm-button-secondary"
          >
            + Donation
          </Link>

          <Link
            href={`/club/organizations/${organization.id}/edit`}
            className="crm-button"
          >
            Edit Organization
          </Link>

        </div>

      </div>


      <div className="crm-record-grid">

        <div className="crm-record-main">


          <section className="crm-panel">

            <div className="crm-panel-header">
              <h3>Organization Information</h3>
            </div>

            <div className="crm-property-grid">

              <div className="crm-property">
                <span className="crm-property-label">
                  Type
                </span>

                <span className="crm-property-value">
                  {organization.organization_type || '—'}
                </span>
              </div>

              <div className="crm-property">
                <span className="crm-property-label">
                  Phone
                </span>

                <span className="crm-property-value">
                  {organization.phone || '—'}
                </span>
              </div>

              <div className="crm-property">
                <span className="crm-property-label">
                  Email
                </span>

                <span className="crm-property-value">
                  {organization.email || '—'}
                </span>
              </div>

              <div className="crm-property">
                <span className="crm-property-label">
                  Website
                </span>

                <span className="crm-property-value">
                  {organization.website || '—'}
                </span>
              </div>

              <div className="crm-property crm-property-wide">
                <span className="crm-property-label">
                  Address
                </span>

                <span className="crm-property-value">
                  {fullAddress || '—'}
                </span>
              </div>

            </div>

          </section>


          <section className="crm-panel">

            <div className="crm-panel-header">
              <h3>Associated Contacts</h3>
            </div>

            {organization.contact_organizations?.length ? (

              <div className="crm-association-list">

                {organization.contact_organizations.map(
                  (association: any) => {

                    const contact = association.contacts;

                    const removeAction =
                      removeContactAssociation.bind(
                        null,
                        organization.id,
                        association.id
                      );

                    return (
                      <div
                        key={association.id}
                        className="crm-association-card"
                      >

                        <div>

                          <Link
                            href={`/club/contacts/${contact.id}`}
                            className="crm-association-title crm-link"
                          >
                            {contact.first_name} {contact.last_name}
                          </Link>

                          <div className="crm-association-meta">
                            {association.relationship_type ||
                              'Associated Contact'}

                            {association.job_title && (
                              <>
                                {' '}• {association.job_title}
                              </>
                            )}
                          </div>

                          {contact.email && (
                            <div className="crm-association-meta">
                              {contact.email}
                            </div>
                          )}

                        </div>

                        <div className="crm-association-actions">

                          {association.is_primary && (
                            <span className="crm-badge-primary">
                              Primary
                            </span>
                          )}

                          <form action={removeAction}>
                            <button
                              type="submit"
                              className="crm-button-link-danger"
                            >
                              Remove
                            </button>
                          </form>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            ) : (

              <div className="crm-empty-state">
                No contacts are associated with this organization.
              </div>

            )}

          </section>


          <section className="crm-panel">

            <div className="crm-panel-header">
              <h3>Associate Contact</h3>
            </div>

            <form
              action={addAssociation}
              className="crm-association-form"
            >

              <label className="crm-field">
                <span>Contact</span>

                <select
                  name="contact_id"
                  required
                >
                  <option value="">
                    Select contact...
                  </option>

                  {contacts?.map((contact) => (
                    <option
                      key={contact.id}
                      value={contact.id}
                    >
                      {contact.first_name}{' '}
                      {contact.last_name}
                      {contact.email
                        ? ` — ${contact.email}`
                        : ''}
                    </option>
                  ))}

                </select>
              </label>


              <label className="crm-field">
                <span>Relationship</span>

                <select name="relationship_type">

                  <option value="">
                    Select...
                  </option>

                  <option value="Employee">
                    Employee
                  </option>

                  <option value="Owner">
                    Owner
                  </option>

                  <option value="Representative">
                    Representative
                  </option>

                  <option value="Sponsor Contact">
                    Sponsor Contact
                  </option>

                  <option value="Volunteer Contact">
                    Volunteer Contact
                  </option>

                  <option value="Member">
                    Member
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>
              </label>


              <label className="crm-field">
                <span>Job Title / Role</span>

                <input name="job_title" />
              </label>


              <label className="crm-field crm-checkbox-field">
                <input
                  type="checkbox"
                  name="is_primary"
                />

                <span>
                  Primary Organization
                </span>
              </label>


              <div className="crm-association-submit">

                <button
                  type="submit"
                  className="crm-button"
                >
                  Associate Contact
                </button>

              </div>

            </form>

          </section>

        </div>


        <aside className="crm-record-sidebar">

          <section className="crm-panel">

            <div className="crm-panel-header">
              <h3>Record Details</h3>
            </div>

            <div className="crm-sidebar-properties">

              <div>
                <span className="crm-property-label">
                  Organization ID
                </span>

                <span className="crm-record-id">
                  {organization.id}
                </span>
              </div>

              <div>
                <span className="crm-property-label">
                  Created
                </span>

                <span className="crm-property-value">
                  {new Intl.DateTimeFormat(
                    'en-US',
                    {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    }
                  ).format(
                    new Date(organization.created_at)
                  )}
                </span>
              </div>

            </div>

          </section>


          {organization.notes && (

            <section className="crm-panel">

              <div className="crm-panel-header">
                <h3>Notes</h3>
              </div>

              <p className="crm-general-notes">
                {organization.notes}
              </p>

            </section>

          )}

        </aside>

      </div>

    </div>
  );
}
