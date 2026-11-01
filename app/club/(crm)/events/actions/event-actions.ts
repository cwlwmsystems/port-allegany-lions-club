'use server';

import { assertCRMRole } from '@/lib/crm-permissions';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

function optionalString(formData: FormData, key: string) {
  const value = formData.get(key)?.toString().trim();
  return value || null;
}

export async function createEvent(formData: FormData) {
  await assertCRMRole(['admin', 'officer', 'volunteer_coordinator']);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('You must be signed in.');

  const name = formData.get('name')?.toString().trim();
  const eventDate = formData.get('event_date')?.toString();

  if (!name || !eventDate) {
    throw new Error('Event name and date are required.');
  }

  const volunteerGoal = formData.get('volunteer_goal')?.toString();

  const { data: event, error } = await supabase
    .from('events')
    .insert({
      name,
      event_type: optionalString(formData, 'event_type') || 'Service Project',
      event_date: eventDate,
      start_time: optionalString(formData, 'start_time'),
      end_time: optionalString(formData, 'end_time'),
      location: optionalString(formData, 'location'),
      description: optionalString(formData, 'description'),
      status: optionalString(formData, 'status') || 'planned',
      volunteer_goal: volunteerGoal ? Number(volunteerGoal) : null,
      coordinator_contact_id: optionalString(
        formData,
        'coordinator_contact_id'
      ),
    })
    .select('id')
    .single();

  if (error || !event) {
    throw new Error(error?.message || 'Unable to create event.');
  }

  revalidatePath('/club/events');
  revalidatePath('/club/dashboard');

  redirect(`/club/events/${event.id}`);
}

export async function updateEvent(
  eventId: string,
  formData: FormData
) {
  await assertCRMRole(['admin', 'officer', 'volunteer_coordinator']);
  const supabase = await createClient();

  const name = formData.get('name')?.toString().trim();
  const eventDate = formData.get('event_date')?.toString();

  if (!name || !eventDate) {
    throw new Error('Event name and date are required.');
  }

  const volunteerGoal = formData.get('volunteer_goal')?.toString();

  const { error } = await supabase
    .from('events')
    .update({
      name,
      event_type: optionalString(formData, 'event_type') || 'Service Project',
      event_date: eventDate,
      start_time: optionalString(formData, 'start_time'),
      end_time: optionalString(formData, 'end_time'),
      location: optionalString(formData, 'location'),
      description: optionalString(formData, 'description'),
      status: optionalString(formData, 'status') || 'planned',
      volunteer_goal: volunteerGoal ? Number(volunteerGoal) : null,
      coordinator_contact_id: optionalString(
        formData,
        'coordinator_contact_id'
      ),
    })
    .eq('id', eventId);

  if (error) throw new Error(error.message);

  revalidatePath('/club/events');
  revalidatePath(`/club/events/${eventId}`);
  revalidatePath('/club/dashboard');

  redirect(`/club/events/${eventId}`);
}

export async function addEventParticipant(
  eventId: string,
  formData: FormData
) {
  await assertCRMRole(['admin', 'officer', 'volunteer_coordinator']);
  const supabase = await createClient();

  const contactId = formData.get('contact_id')?.toString();

  if (!contactId) throw new Error('Contact is required.');

  const hours = Number(
    formData.get('volunteer_hours')?.toString() || 0
  );

  const { error } = await supabase
    .from('event_participants')
    .insert({
      event_id: eventId,
      contact_id: contactId,
      participant_role:
        optionalString(formData, 'participant_role') || 'Volunteer',
      attendance_status:
        optionalString(formData, 'attendance_status') || 'registered',
      volunteer_hours: Number.isFinite(hours) ? hours : 0,
      notes: optionalString(formData, 'notes'),
    });

  if (error) throw new Error(error.message);

  revalidatePath(`/club/events/${eventId}`);
  revalidatePath(`/club/contacts/${contactId}`);
  revalidatePath('/club/dashboard');
}

export async function updateEventParticipant(
  eventId: string,
  participantId: string,
  formData: FormData
) {
  await assertCRMRole(['admin', 'officer', 'volunteer_coordinator']);
  const supabase = await createClient();

  const hours = Number(
    formData.get('volunteer_hours')?.toString() || 0
  );

  const { data, error } = await supabase
    .from('event_participants')
    .update({
      participant_role:
        optionalString(formData, 'participant_role') || 'Volunteer',
      attendance_status:
        optionalString(formData, 'attendance_status') || 'registered',
      volunteer_hours: Number.isFinite(hours) ? hours : 0,
      notes: optionalString(formData, 'notes'),
    })
    .eq('id', participantId)
    .select('contact_id')
    .single();

  if (error) throw new Error(error.message);

  revalidatePath(`/club/events/${eventId}`);

  if (data?.contact_id) {
    revalidatePath(`/club/contacts/${data.contact_id}`);
  }

  revalidatePath('/club/dashboard');

  redirect(`/club/events/${eventId}`);
}

export async function removeEventParticipant(
  eventId: string,
  participantId: string
) {
  await assertCRMRole(['admin', 'officer', 'volunteer_coordinator']);
  const supabase = await createClient();

  const { data } = await supabase
    .from('event_participants')
    .select('contact_id')
    .eq('id', participantId)
    .single();

  const { error } = await supabase
    .from('event_participants')
    .delete()
    .eq('id', participantId);

  if (error) throw new Error(error.message);

  revalidatePath(`/club/events/${eventId}`);

  if (data?.contact_id) {
    revalidatePath(`/club/contacts/${data.contact_id}`);
  }

  revalidatePath('/club/dashboard');
}
