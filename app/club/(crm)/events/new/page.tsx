import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import EventForm from '@/components/crm/event-form';
import { createEvent } from '../actions/event-actions';
import { requireCRMRole } from '@/lib/crm-permissions';

export default async function NewEventPage() {
  await requireCRMRole(['admin', 'officer', 'volunteer_coordinator']);

const supabase = await createClient();

  const { data: contacts } = await supabase
    .from('contacts')
    .select('id, first_name, last_name')
    .order('last_name')
    .order('first_name');

  return (
    <div>
      <div className="crm-record-breadcrumb">
        <Link href="/club/events">Events</Link>
        <span>/</span>
        <span>New Event</span>
      </div>

      <div className="crm-page-header">
        <h2 className="crm-page-title">Add Event</h2>
        <p className="crm-page-description">
          Create a club event or community service project.
        </p>
      </div>

      <EventForm
        action={createEvent}
        contacts={contacts ?? []}
        submitLabel="Create Event"
      />
    </div>
  );
}