import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ConfirmSubmitButton from '@/components/crm/confirm-submit-button';
import {
  addEventParticipant,
  removeEventParticipant,
} from '../actions/event-actions';

export default async function EventRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from('events')
    .select(`
      *,
      coordinator:contacts!events_coordinator_contact_id_fkey (
        id,
        first_name,
        last_name
      ),
      event_participants (
        id,
        participant_role,
        attendance_status,
        volunteer_hours,
        notes,
        contacts (
          id,
          first_name,
          last_name,
          email
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error || !event) notFound();

  const { data: contacts } = await supabase
    .from('contacts')
    .select('id, first_name, last_name, email')
    .order('last_name')
    .order('first_name');

  const usedIds = new Set(
    event.event_participants?.map(
      (participant: any) => participant.contacts?.id
    ) ?? []
  );

  const availableContacts =
    contacts?.filter((contact) => !usedIds.has(contact.id)) ?? [];

  const totalHours =
    event.event_participants?.reduce(
      (total: number, participant: any) =>
        total + Number(participant.volunteer_hours || 0),
      0
    ) ?? 0;

  const attendedCount =
    event.event_participants?.filter(
      (participant: any) =>
        participant.attendance_status === 'attended'
    ).length ?? 0;

  const addParticipant = addEventParticipant.bind(null, event.id);

  return (
    <div>

      <div className="crm-record-breadcrumb">
        <Link href="/club/events">Events</Link>
        <span>/</span>
        <span>{event.name}</span>
      </div>

      <div className="crm-record-header">
        <div>
          <h2 className="crm-record-title">{event.name}</h2>
          <div className="crm-record-subtitle">
            {event.event_type} •{' '}
            {new Intl.DateTimeFormat('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            }).format(
              new Date(`${event.event_date}T00:00:00`)
            )}
          </div>
        </div>

        <Link
          href={`/club/events/${event.id}/edit`}
          className="crm-button crm-button-secondary"
        >
          Edit Event
        </Link>
      </div>

      <div className="crm-stat-grid crm-event-stat-grid">

        <div className="crm-stat-card">
          <p className="crm-stat-label">Participants</p>
          <p className="crm-stat-number">
            {event.event_participants?.length ?? 0}
          </p>
        </div>

        <div className="crm-stat-card">
          <p className="crm-stat-label">Attended</p>
          <p className="crm-stat-number">{attendedCount}</p>
        </div>

        <div className="crm-stat-card">
          <p className="crm-stat-label">Volunteer Hours</p>
          <p className="crm-stat-number">{totalHours.toFixed(2)}</p>
        </div>

        <div className="crm-stat-card">
          <p className="crm-stat-label">Volunteer Goal</p>
          <p className="crm-stat-number">{event.volunteer_goal ?? '—'}</p>
        </div>

      </div>

      <div className="crm-record-grid">

        <div className="crm-record-main">

          <section className="crm-panel">
            <div className="crm-panel-header">
              <h3>Event Details</h3>
            </div>

            <div className="crm-property-grid">

              <div className="crm-property">
                <span className="crm-property-label">Status</span>
                <span className="crm-property-value">{event.status}</span>
              </div>

              <div className="crm-property">
                <span className="crm-property-label">Location</span>
                <span className="crm-property-value">
                  {event.location || '—'}
                </span>
              </div>

              <div className="crm-property">
                <span className="crm-property-label">Start Time</span>
                <span className="crm-property-value">
                  {event.start_time || '—'}
                </span>
              </div>

              <div className="crm-property">
                <span className="crm-property-label">End Time</span>
                <span className="crm-property-value">
                  {event.end_time || '—'}
                </span>
              </div>

              <div className="crm-property crm-property-wide">
                <span className="crm-property-label">Description</span>
                <span className="crm-property-value">
                  {event.description || '—'}
                </span>
              </div>

            </div>
          </section>

          <section className="crm-panel">
            <div className="crm-panel-header">
              <h3>Participants</h3>
            </div>

            {event.event_participants?.length ? (
              <div className="crm-association-list">
                {event.event_participants.map((participant: any) => {
                  const contact = participant.contacts;

                  const removeAction =
                    removeEventParticipant.bind(
                      null,
                      event.id,
                      participant.id
                    );

                  return (
                    <div
                      key={participant.id}
                      className="crm-volunteer-row"
                    >
                      <div>
                        <Link
                          href={`/club/contacts/${contact.id}`}
                          className="crm-association-title crm-link"
                        >
                          {contact.first_name} {contact.last_name}
                        </Link>

                        <div className="crm-association-meta">
                          {participant.participant_role} •{' '}
                          {participant.attendance_status}
                        </div>

                        {participant.notes && (
                          <div className="crm-association-meta">
                            {participant.notes}
                          </div>
                        )}
                      </div>

                      <div className="crm-volunteer-hours">
                        <strong>
                          {Number(
                            participant.volunteer_hours || 0
                          ).toFixed(2)}
                        </strong>
                        <span>hours</span>
                      </div>

                      <div>
                        <Link
                          href={`/club/events/${event.id}/participants/${participant.id}/edit`}
                          className="crm-small-action"
                        >
                          Edit
                        </Link>

                        <form
                          action={removeAction}
                          className="crm-inline-form"
                        >
                          <ConfirmSubmitButton
                            className="crm-button-link-danger"
                            message="Remove this participant from the event?"
                          >
                            Remove
                          </ConfirmSubmitButton>
                        </form>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="crm-empty-state">
                No participants have been added yet.
              </div>
            )}
          </section>

          <section className="crm-panel">

            <div className="crm-panel-header">
              <h3>Add Participant</h3>
            </div>

            <form
              action={addParticipant}
              className="crm-volunteer-form"
            >

              <label className="crm-field">
                <span>Contact</span>
                <select name="contact_id" required>
                  <option value="">Select contact...</option>

                  {availableContacts.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.first_name} {contact.last_name}
                      {contact.email ? ` — ${contact.email}` : ''}
                    </option>
                  ))}
                </select>
              </label>

              <label className="crm-field">
                <span>Role</span>
                <select
                  name="participant_role"
                  defaultValue="Volunteer"
                >
                  <option value="Volunteer">Volunteer</option>
                  <option value="Coordinator">Coordinator</option>
                  <option value="Organizer">Organizer</option>
                  <option value="Member">Member</option>
                  <option value="Attendee">Attendee</option>
                  <option value="Guest">Guest</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <label className="crm-field">
                <span>Attendance</span>
                <select
                  name="attendance_status"
                  defaultValue="attended"
                >
                  <option value="registered">Registered</option>
                  <option value="attended">Attended</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no_show">No Show</option>
                </select>
              </label>

              <label className="crm-field">
                <span>Volunteer Hours</span>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  name="volunteer_hours"
                  defaultValue="0"
                />
              </label>

              <label className="crm-field crm-field-wide">
                <span>Notes</span>
                <input name="notes" />
              </label>

              <div className="crm-association-submit">
                <button type="submit" className="crm-button">
                  Add Participant
                </button>
              </div>

            </form>
          </section>

        </div>

        <aside className="crm-record-sidebar">
          <section className="crm-panel">
            <div className="crm-panel-header">
              <h3>Event Record</h3>
            </div>

            <div className="crm-sidebar-properties">

              <div>
                <span className="crm-property-label">
                  Event Type
                </span>
                <span className="crm-property-value">
                  {event.event_type}
                </span>
              </div>

              <div>
                <span className="crm-property-label">
                  Coordinator
                </span>
                <span className="crm-property-value">
                  {event.coordinator
                    ? `${(event.coordinator as any).first_name} ${(event.coordinator as any).last_name}`
                    : '—'}
                </span>
              </div>

            </div>
          </section>
        </aside>

      </div>
    </div>
  );
}
