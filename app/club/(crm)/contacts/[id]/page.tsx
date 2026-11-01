import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { addContactNote } from './actions';
import ContactActivityTimeline from '@/components/crm/contact-activity-timeline';

export default async function ContactRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: contact, error } = await supabase
    .from('contacts')
    .select(`
      id,
      first_name,
      last_name,
      email,
      phone,
      mobile_phone,
      address_line_1,
      address_line_2,
      city,
      state,
      postal_code,
      preferred_contact_method,
      status,
      birthday,
      occupation,
      employer_name,
      source,
      general_notes,
      do_not_contact,
      created_at,

      contact_tags (
        id,
        tags (
          id,
          name
        )
      ),

      contact_organizations (
        id,
        relationship_type,
        job_title,
        is_primary,
        start_date,
        end_date,
        notes,
        organizations (
          id,
          name,
          organization_type,
          email,
          phone,
          website,
          city,
          state
        )
      ),

      contact_notes (
        id,
        note,
        created_at,
        created_by
      ),

      memberships (
        id,
        member_number,
        membership_status,
        membership_type,
        join_date,
        end_date,
        end_reason,
        officer_role,
        committee,
        dues_status,
        last_dues_payment_date,
        notes
      ),

      event_participants (
        id,
        participant_role,
        attendance_status,
        volunteer_hours,
        notes,
        events (
          id,
          name,
          event_type,
          event_date,
          location,
          status
        )
      ),

      donations (
        id,
        donation_date,
        amount,
        donation_type,
        payment_method,
        receipt_sent,
        anonymous,
        notes,
        campaigns (
          id,
          name
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error || !contact) {
    notFound();
  }

  const notes = [...(contact.contact_notes ?? [])].sort(
    (a: any, b: any) =>
      new Date(b.created_at).getTime() -
      new Date(a.created_at).getTime()
  );

  const memberships =
    [...(contact.memberships ?? [])].sort(
      (a: any, b: any) => {
        if (!a.join_date) return 1;
        if (!b.join_date) return -1;

        return (
          new Date(b.join_date).getTime() -
          new Date(a.join_date).getTime()
        );
      }
    );

  const currentMembership =
    memberships.find(
      (membership: any) =>
        membership.membership_status === 'active'
    ) || memberships[0];

  const volunteerHistory =
    [...((contact.event_participants as any[]) ?? [])]
      .filter(
        (participation: any) =>
          participation.attendance_status === 'attended'
      )
      .sort((a: any, b: any) => {
        const aDate = a.events?.event_date || '';
        const bDate = b.events?.event_date || '';
        return bDate.localeCompare(aDate);
      });

  const lifetimeVolunteerHours =
    volunteerHistory.reduce(
      (total: number, participation: any) =>
        total + Number(participation.volunteer_hours || 0),
      0
    );

  const volunteerEventCount =
    volunteerHistory.length;

  const lastVolunteerDate =
    volunteerHistory[0]?.events?.event_date || null;

  const donationHistory =
    [...((contact.donations as any[]) ?? [])]
      .sort((a: any, b: any) =>
        (b.donation_date || '').localeCompare(
          a.donation_date || ''
        )
      );

  const lifetimeGiving =
    donationHistory.reduce(
      (total: number, donation: any) =>
        total + Number(donation.amount || 0),
      0
    );

  const donationCount =
    donationHistory.length;

  const lastDonationDate =
    donationHistory[0]?.donation_date || null;

  const primaryOrganization =
    (contact.contact_organizations as any[])?.find(
      (association: any) =>
        association.is_primary
    );

  const displayEmployer =
    primaryOrganization?.organizations?.name ||
    contact.employer_name;

  const fullAddress = [
    contact.address_line_1,
    contact.address_line_2,
    contact.city,
    contact.state,
    contact.postal_code,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div>

      <div className="crm-record-breadcrumb">

        <Link href="/club/contacts">
          Contacts
        </Link>

        <span>/</span>

        <span>
          {contact.first_name} {contact.last_name}
        </span>

      </div>


      <div className="crm-record-header">

        <div>

          <div className="crm-record-title-row">

            <div className="crm-record-avatar">
              {contact.first_name?.charAt(0)}
              {contact.last_name?.charAt(0)}
            </div>

            <div>

              <h2 className="crm-record-title">
                {contact.first_name} {contact.last_name}
              </h2>

              <div className="crm-record-subtitle">
                {contact.occupation || 'Contact'}

                {displayEmployer && (
                  <>
                    {' '}• {displayEmployer}
                  </>
                )}
              </div>

            </div>

          </div>


          <div className="crm-tag-list crm-record-tags">

            {contact.contact_tags?.map(
              (relationship: any) => (
                <span
                  key={relationship.id}
                  className="crm-tag"
                >
                  {relationship.tags?.name}
                </span>
              )
            )}

          </div>

        </div>


        <div className="crm-record-actions">

          <Link
            href={`/club/tasks/new?contact=${contact.id}`}
            className="crm-button crm-button-secondary"
          >
            + Task
          </Link>

          <Link
            href={`/club/donations/new?contact=${contact.id}`}
            className="crm-button crm-button-secondary"
          >
            + Donation
          </Link>

          <Link
            href={`/club/contacts/${contact.id}/edit`}
            className="crm-button"
          >
            Edit Contact
          </Link>

        </div>

      </div>


      <div className="crm-record-grid">

        <div className="crm-record-main">


          <section className="crm-panel">

            <div className="crm-panel-header">
              <h3>Contact Information</h3>
            </div>

            <div className="crm-property-grid">

              <div className="crm-property">
                <span className="crm-property-label">
                  Email
                </span>
                <span className="crm-property-value">
                  {contact.email || '—'}
                </span>
              </div>

              <div className="crm-property">
                <span className="crm-property-label">
                  Mobile Phone
                </span>
                <span className="crm-property-value">
                  {contact.mobile_phone || '—'}
                </span>
              </div>

              <div className="crm-property">
                <span className="crm-property-label">
                  Phone
                </span>
                <span className="crm-property-value">
                  {contact.phone || '—'}
                </span>
              </div>

              <div className="crm-property">
                <span className="crm-property-label">
                  Preferred Contact Method
                </span>
                <span className="crm-property-value">
                  {contact.preferred_contact_method || '—'}
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

              <div className="crm-property">
                <span className="crm-property-label">
                  Birthday
                </span>
                <span className="crm-property-value">
                  {contact.birthday || '—'}
                </span>
              </div>

              <div className="crm-property">
                <span className="crm-property-label">
                  Status
                </span>
                <span className="crm-property-value">
                  {contact.status || '—'}
                </span>
              </div>

              <div className="crm-property">
                <span className="crm-property-label">
                  Source
                </span>
                <span className="crm-property-value">
                  {contact.source || '—'}
                </span>
              </div>

              <div className="crm-property">
                <span className="crm-property-label">
                  Do Not Contact
                </span>
                <span className="crm-property-value">
                  {contact.do_not_contact ? 'Yes' : 'No'}
                </span>
              </div>

            </div>

          </section>


          <section className="crm-panel">

            <div className="crm-panel-header crm-panel-header-row">

              <h3>Membership</h3>

              {!currentMembership && (
                <Link
                  href={`/club/contacts/${contact.id}/membership/new`}
                  className="crm-small-action"
                >
                  + Add Membership
                </Link>
              )}

            </div>


            {currentMembership ? (

              <div className="crm-membership-summary">

                <div className="crm-membership-summary-header">

                  <div>

                    <div className="crm-membership-name">
                      {currentMembership.membership_type ||
                        'Lions Club Member'}
                    </div>

                    <div className="crm-membership-meta">
                      Member #
                      {' '}
                      {currentMembership.member_number || 'Not assigned'}
                    </div>

                  </div>


                  <div className="crm-membership-actions">

                    <span
                      className={`crm-status-badge crm-status-${currentMembership.membership_status}`}
                    >
                      {currentMembership.membership_status}
                    </span>

                    <Link
                      href={`/club/members/${currentMembership.id}/edit`}
                      className="crm-small-action"
                    >
                      Edit
                    </Link>

                  </div>

                </div>


                <div className="crm-membership-details">

                  <div>
                    <span className="crm-property-label">
                      Join Date
                    </span>

                    <span className="crm-property-value">
                      {currentMembership.join_date || '—'}
                    </span>
                  </div>


                  <div>
                    <span className="crm-property-label">
                      Dues Status
                    </span>

                    <span
                      className={`crm-dues-badge crm-dues-${currentMembership.dues_status}`}
                    >
                      {currentMembership.dues_status.replaceAll(
                        '_',
                        ' '
                      )}
                    </span>
                  </div>


                  <div>
                    <span className="crm-property-label">
                      Officer Role
                    </span>

                    <span className="crm-property-value">
                      {currentMembership.officer_role || '—'}
                    </span>
                  </div>


                  <div>
                    <span className="crm-property-label">
                      Committee
                    </span>

                    <span className="crm-property-value">
                      {currentMembership.committee || '—'}
                    </span>
                  </div>

                </div>

              </div>

            ) : (

              <div className="crm-empty-state">
                This contact does not currently have a membership record.
              </div>

            )}

          </section>


          <ContactActivityTimeline
            contactId={contact.id}
          />


          <section className="crm-panel">

            <div className="crm-panel-header">
              <h3>Volunteer History</h3>
            </div>

            <div className="crm-volunteer-summary-grid">

              <div className="crm-volunteer-summary-card">
                <span className="crm-property-label">
                  Lifetime Hours
                </span>

                <strong>
                  {lifetimeVolunteerHours.toFixed(2)}
                </strong>
              </div>

              <div className="crm-volunteer-summary-card">
                <span className="crm-property-label">
                  Events Participated
                </span>

                <strong>
                  {volunteerEventCount}
                </strong>
              </div>

              <div className="crm-volunteer-summary-card">
                <span className="crm-property-label">
                  Last Volunteer Date
                </span>

                <strong>
                  {lastVolunteerDate
                    ? new Intl.DateTimeFormat(
                        'en-US',
                        {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        }
                      ).format(
                        new Date(
                          `${lastVolunteerDate}T00:00:00`
                        )
                      )
                    : '—'}
                </strong>
              </div>

            </div>


            {volunteerHistory.length ? (

              <div className="crm-volunteer-history-list">

                {volunteerHistory.map(
                  (participation: any) => {

                    const event =
                      participation.events as any;

                    return (
                      <div
                        key={participation.id}
                        className="crm-volunteer-history-item"
                      >

                        <div>

                          <Link
                            href={`/club/events/${event.id}`}
                            className="crm-association-title crm-link"
                          >
                            {event.name}
                          </Link>

                          <div className="crm-association-meta">
                            {new Intl.DateTimeFormat(
                              'en-US',
                              {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              }
                            ).format(
                              new Date(
                                `${event.event_date}T00:00:00`
                              )
                            )}

                            {' '}•{' '}

                            {event.event_type}

                            {event.location && (
                              <>
                                {' '}• {event.location}
                              </>
                            )}
                          </div>

                          <div className="crm-association-meta">
                            Role: {participation.participant_role}
                            {' '}•{' '}
                            Attendance: {participation.attendance_status}
                          </div>

                          {participation.notes && (
                            <div className="crm-association-meta">
                              {participation.notes}
                            </div>
                          )}

                        </div>


                        <div className="crm-volunteer-history-hours">

                          <strong>
                            {Number(
                              participation.volunteer_hours || 0
                            ).toFixed(2)}
                          </strong>

                          <span>
                            hours
                          </span>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            ) : (

              <div className="crm-empty-state">
                No completed volunteer participation has been recorded yet.
              </div>

            )}

          </section>


          <section className="crm-panel">

            <div className="crm-panel-header crm-panel-header-row">

              <h3>Donation History</h3>

              <Link
                href="/club/donations/new"
                className="crm-small-action"
              >
                + Add Donation
              </Link>

            </div>


            <div className="crm-donation-summary-grid">

              <div className="crm-donation-summary-card">
                <span className="crm-property-label">
                  Lifetime Giving
                </span>

                <strong>
                  ${lifetimeGiving.toFixed(2)}
                </strong>
              </div>

              <div className="crm-donation-summary-card">
                <span className="crm-property-label">
                  Donations
                </span>

                <strong>
                  {donationCount}
                </strong>
              </div>

              <div className="crm-donation-summary-card">
                <span className="crm-property-label">
                  Last Donation
                </span>

                <strong>
                  {lastDonationDate
                    ? new Intl.DateTimeFormat(
                        'en-US',
                        {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        }
                      ).format(
                        new Date(
                          `${lastDonationDate}T00:00:00`
                        )
                      )
                    : '—'}
                </strong>
              </div>

            </div>


            {donationHistory.length ? (

              <div className="crm-donation-history-list">

                {donationHistory.map(
                  (donation: any) => {

                    const campaign =
                      donation.campaigns as any;

                    return (
                      <div
                        key={donation.id}
                        className="crm-donation-history-item"
                      >

                        <div>

                          <div className="crm-association-title">
                            {campaign?.name || 'Unassigned Fund'}
                          </div>

                          <div className="crm-association-meta">

                            {new Intl.DateTimeFormat(
                              'en-US',
                              {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              }
                            ).format(
                              new Date(
                                `${donation.donation_date}T00:00:00`
                              )
                            )}

                            {' '}•{' '}

                            {donation.donation_type}

                            {donation.payment_method && (
                              <>
                                {' '}• {donation.payment_method}
                              </>
                            )}

                          </div>

                          {donation.notes && (
                            <div className="crm-association-meta">
                              {donation.notes}
                            </div>
                          )}

                        </div>


                        <div className="crm-donation-amount">
                          ${Number(
                            donation.amount
                          ).toFixed(2)}
                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            ) : (

              <div className="crm-empty-state">
                No donations have been recorded for this contact.
              </div>

            )}

          </section>


          <section className="crm-panel">

            <div className="crm-panel-header">
              <h3>Organizations</h3>
            </div>

            {contact.contact_organizations?.length ? (

              <div className="crm-association-list">

                {contact.contact_organizations.map(
                  (association: any) => (
                    <div
                      key={association.id}
                      className="crm-association-card"
                    >

                      <div>

                        <Link
                          href={`/club/organizations/${association.organizations?.id}`}
                          className="crm-association-title crm-link"
                        >
                          {association.organizations?.name}
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


                        {(association.organizations?.city ||
                          association.organizations?.state) && (

                          <div className="crm-association-meta">

                            {[
                              association.organizations?.city,
                              association.organizations?.state,
                            ]
                              .filter(Boolean)
                              .join(', ')}

                          </div>

                        )}

                      </div>


                      {association.is_primary && (
                        <span className="crm-badge-primary">
                          Primary
                        </span>
                      )}

                    </div>
                  )
                )}

              </div>

            ) : (

              <div className="crm-empty-state">
                No organizations associated with this contact.
              </div>

            )}

          </section>


          <section className="crm-panel">

            <div className="crm-panel-header">
              <h3>Activity & Notes</h3>
            </div>


            <form
              action={addContactNote}
              className="crm-note-form"
            >

              <input
                type="hidden"
                name="contact_id"
                value={contact.id}
              />

              <textarea
                name="note"
                required
                placeholder="Add a note about this contact..."
                className="crm-textarea"
              />

              <div className="crm-note-form-actions">
                <button
                  type="submit"
                  className="crm-button"
                >
                  Add Note
                </button>
              </div>

            </form>


            <div className="crm-timeline">

              {notes.length ? (

                notes.map((note: any) => (

                  <div
                    key={note.id}
                    className="crm-timeline-item"
                  >

                    <div className="crm-timeline-dot" />

                    <div className="crm-timeline-content">

                      <div className="crm-timeline-date">
                        {new Intl.DateTimeFormat('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        }).format(
                          new Date(note.created_at)
                        )}
                      </div>

                      <div className="crm-timeline-note">
                        {note.note}
                      </div>

                    </div>

                  </div>

                ))

              ) : (

                <div className="crm-empty-state">
                  No notes have been added yet.
                </div>

              )}

            </div>

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
                  Contact ID
                </span>

                <span className="crm-record-id">
                  {contact.id}
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
                    new Date(contact.created_at)
                  )}
                </span>
              </div>

            </div>

          </section>


          {contact.general_notes && (

            <section className="crm-panel">

              <div className="crm-panel-header">
                <h3>General Notes</h3>
              </div>

              <p className="crm-general-notes">
                {contact.general_notes}
              </p>

            </section>

          )}

        </aside>

      </div>

    </div>
  );
}