import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { updateEventParticipant } from '../../../../actions/event-actions';
import { requireCRMRole } from '@/lib/crm-permissions';

export default async function EditParticipantPage({
params,
}: {
  params: Promise<{
    id: string;
    participantId: string;
  }>;
}) {
  await requireCRMRole(['admin', 'officer', 'volunteer_coordinator']);

  const { id, participantId } = await params;
  const supabase = await createClient();

  const { data: participant } = await supabase
    .from('event_participants')
    .select(`
      *,
      contacts (
        id,
        first_name,
        last_name
      ),
      events (
        id,
        name
      )
    `)
    .eq('id', participantId)
    .single();

  if (!participant) notFound();

  const updateAction = updateEventParticipant.bind(
    null,
    id,
    participantId
  );

  const contact = participant.contacts as any;
  const event = participant.events as any;

  return (
    <div>

      <div className="crm-record-breadcrumb">
        <Link href="/club/events">Events</Link>
        <span>/</span>
        <Link href={`/club/events/${id}`}>
          {event?.name}
        </Link>
        <span>/</span>
        <span>Edit Participant</span>
      </div>

      <div className="crm-page-header">
        <h2 className="crm-page-title">
          Edit Volunteer Participation
        </h2>
        <p className="crm-page-description">
          Update participation for {contact?.first_name}{' '}
          {contact?.last_name}.
        </p>
      </div>

      <form action={updateAction} className="crm-form">

        <section className="crm-panel">
          <div className="crm-panel-header">
            <h3>Participation</h3>
          </div>

          <div className="crm-form-grid">

            <label className="crm-field">
              <span>Role</span>
              <select
                name="participant_role"
                defaultValue={participant.participant_role}
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
                defaultValue={participant.attendance_status}
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
                defaultValue={participant.volunteer_hours || 0}
              />
            </label>

            <label className="crm-field crm-field-wide">
              <span>Notes</span>
              <textarea
                name="notes"
                defaultValue={participant.notes || ''}
              />
            </label>

          </div>
        </section>

        <div className="crm-form-actions">
          <button type="submit" className="crm-button">
            Save Participation
          </button>
        </div>

      </form>

    </div>
  );
}