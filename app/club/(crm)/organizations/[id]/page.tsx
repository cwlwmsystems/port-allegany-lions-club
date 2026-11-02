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

  const { data: outreachHistory } = await supabase
    .from('community_partner_outreach')
    .select(`
      id,
      outreach_type,
      outcome,
      notes,
      contacted_at,
      next_follow_up
    `)
    .eq('organization_id', id)
    .order('contacted_at', {
      ascending: false,
    })
    .limit(50);

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
              <h3>Community Partner</h3>
            </div>

            <div className="crm-property-grid">

              <div className="crm-property">
                <span className="crm-property-label">
                  Status
                </span>

                <span className="crm-property-value">
                  {(
                    organization.community_partner_status ||
                    'not_prospect'
                  )
                    .replaceAll('_', ' ')
                    .replace(/\b\w/g, (char: string) =>
                      char.toUpperCase()
                    )}
                </span>
              </div>

              <div className="crm-property">
                <span className="crm-property-label">
                  Public Partner
                </span>

                <span className="crm-property-value">
                  {organization.community_partner_public
                    ? 'Yes'
                    : 'No'}
                </span>
              </div>

              <div className="crm-property">
                <span className="crm-property-label">
                  Partner Since
                </span>

                <span className="crm-property-value">
                  {organization.community_partner_since || '—'}
                </span>
              </div>

              <div className="crm-property">
                <span className="crm-property-label">
                  Last Contacted
                </span>

                <span className="crm-property-value">
                  {organization.community_partner_last_contacted || '—'}
                </span>
              </div>

              <div className="crm-property">
                <span className="crm-property-label">
                  Next Follow-up
                </span>

                <span className="crm-property-value">
                  {organization.community_partner_next_follow_up || '—'}
                </span>
              </div>

              <div className="crm-property">
                <span className="crm-property-label">
                  Facebook
                </span>

                <span className="crm-property-value">
                  {organization.facebook_url ? (
                    <a
                      href={organization.facebook_url}
                      target="_blank"
                      rel="noreferrer"
                      className="crm-link"
                    >
                      Open Page
                    </a>
                  ) : (
                    '—'
                  )}
                </span>
              </div>

              <div className="crm-property crm-property-wide">
                <span className="crm-property-label">
                  Support Types
                </span>

                <span className="crm-property-value">
                  {organization.community_partner_support_types?.length
                    ? organization.community_partner_support_types.join(', ')
                    : '—'}
                </span>
              </div>

              <div className="crm-property crm-property-wide">
                <span className="crm-property-label">
                  Public Description
                </span>

                <span className="crm-property-value">
                  {organization.community_partner_public_description || '—'}
                </span>
              </div>

              <div className="crm-property crm-property-wide">
                <span className="crm-property-label">
                  Partner / Outreach Notes
                </span>

                <span className="crm-property-value crm-pre-wrap">
                  {organization.community_partner_notes || '—'}
                </span>
              </div>

            </div>

          </section>


                    {organization.community_partner_website_screenshot_url && (
            <section className="crm-panel crm-organization-website-preview">

              <div className="crm-panel-header">
                <div>
                  <h3>Website Preview</h3>

                  <p>
                    Captured from the organization's website
                  </p>
                </div>

                {organization.website && (
                  <a
                    href={organization.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="crm-button crm-button-secondary crm-button-small"
                  >
                    Open Website
                  </a>
                )}
              </div>

              <div className="crm-organization-screenshot-wrap">

                {organization.website ? (
                  <a
                    href={organization.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="crm-organization-screenshot-link"
                  >
                    <img
                      src={`${organization.community_partner_website_screenshot_url}?v=${organization.community_partner_website_screenshot_updated_at || ''}`}
                      alt={`${organization.name} website preview`}
                      loading="lazy"
                    />
                  </a>
                ) : (
                  <div className="crm-organization-screenshot-link">
                    <img
                      src={`${organization.community_partner_website_screenshot_url}?v=${organization.community_partner_website_screenshot_updated_at || ''}`}
                      alt={`${organization.name} website preview`}
                      loading="lazy"
                    />
                  </div>
                )}

              </div>

            </section>
          )}

<section className="crm-panel">

            <div className="crm-panel-header">
              <h3>Outreach History</h3>
            </div>

            {outreachHistory?.length ? (
              <div className="crm-outreach-history">

                {outreachHistory.map(
                  (entry) => (
                    <div
                      key={entry.id}
                      className="crm-outreach-history-item"
                    >
                      <div className="crm-outreach-history-main">

                        <div className="crm-outreach-history-left">
                          <span
                            className={`crm-outreach-method crm-outreach-method-${entry.outreach_type}`}
                          >
                            {entry.outreach_type
                              .replaceAll('_', ' ')
                              .replace(
                                /\b\w/g,
                                (char: string) =>
                                  char.toUpperCase()
                              )}
                          </span>

                          {entry.outcome && (
                            <span className="crm-outreach-outcome">
                              {entry.outcome
                                .replaceAll('_', ' ')
                                .replace(
                                  /\b\w/g,
                                  (char: string) =>
                                    char.toUpperCase()
                                )}
                            </span>
                          )}
                        </div>

                        <span className="crm-outreach-date">
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
                            new Date(
                              entry.contacted_at
                            )
                          )}
                        </span>

                      </div>

                      {entry.notes && (
                        <div className="crm-outreach-notes">
                          {entry.notes}
                        </div>
                      )}

                      {entry.next_follow_up && (
                        <div className="crm-outreach-followup">
                          <span className="crm-outreach-followup-label">
                            Next follow-up
                          </span>

                          <span className="crm-outreach-followup-date">
                            {new Intl.DateTimeFormat(
                              'en-US',
                              {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              }
                            ).format(
                              new Date(
                                `${entry.next_follow_up}T12:00:00`
                              )
                            )}
                          </span>
                        </div>
                      )}

                    </div>
                  )
                )}

              </div>
            ) : (
              <div className="crm-empty-state">
                No outreach has been logged yet.
              </div>
            )}

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
