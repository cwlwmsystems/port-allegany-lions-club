import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import EventForm from '@/components/crm/event-form';
import { updateEvent } from '../../actions/event-actions';
import { requireCRMRole } from '@/lib/crm-permissions';

export default async function EditEventPage({
params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireCRMRole(['admin', 'officer', 'volunteer_coordinator']);

  const { id } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (!event) notFound();

  const { data: contacts } = await supabase
    .from('contacts')
    .select('id, first_name, last_name')
    .order('last_name')
    .order('first_name');

  const updateAction = updateEvent.bind(null, id);

  return (
    <div>

      <div className="crm-record-breadcrumb">
        <Link href="/club/events">Events</Link>
        <span>/</span>
        <Link href={`/club/events/${id}`}>
          {event.name}
        </Link>
        <span>/</span>
        <span>Edit</span>
      </div>

      <div className="crm-page-header">
        <h2 className="crm-page-title">Edit Event</h2>
        <p className="crm-page-description">
          Update event information and service details.
        </p>
      </div>

      <EventForm
        action={updateAction}
        contacts={contacts ?? []}
        event={event}
        submitLabel="Save Event"
      />

    </div>
  );
}