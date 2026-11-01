import { createClient } from '@/lib/supabase/server';

import ContactActivityTimelineClient, {
  type ActivityItem,
} from './contact-activity-timeline-client';

export default async function ContactActivityTimeline({
  contactId,
}: {
  contactId: string;
}) {
  const supabase = await createClient();

  const [
    notesResult,
    tasksResult,
    participationResult,
    donationsResult,
    membershipsResult,
  ] = await Promise.all([

    supabase
      .from('contact_notes')
      .select(`
        id,
        note,
        created_at
      `)
      .eq('contact_id', contactId)
      .order('created_at', {
        ascending: false,
      }),

    supabase
      .from('tasks')
      .select(`
        id,
        title,
        description,
        due_date,
        priority,
        status,
        created_at,
        completed_at
      `)
      .eq('contact_id', contactId)
      .order('created_at', {
        ascending: false,
      }),

    supabase
      .from('event_participants')
      .select(`
        id,
        participant_role,
        attendance_status,
        volunteer_hours,
        notes,
        created_at,
        events (
          id,
          name,
          event_type,
          event_date,
          location,
          status
        )
      `)
      .eq('contact_id', contactId),

    supabase
      .from('donations')
      .select(`
        id,
        donation_date,
        amount,
        donation_type,
        payment_method,
        notes,
        campaigns (
          id,
          name
        )
      `)
      .eq('contact_id', contactId)
      .order('donation_date', {
        ascending: false,
      }),

    supabase
      .from('memberships')
      .select(`
        id,
        membership_status,
        membership_type,
        join_date,
        end_date,
        officer_role,
        committee,
        dues_status,
        created_at
      `)
      .eq('contact_id', contactId)
      .order('created_at', {
        ascending: false,
      }),
  ]);


  const activity: ActivityItem[] = [];


  for (const note of notesResult.data ?? []) {
    activity.push({
      id: note.id,
      type: 'note',
      date: note.created_at,
      title: 'Note added',
      description: note.note,
    });
  }


  for (const task of tasksResult.data ?? []) {
    activity.push({
      id: task.id,
      type: 'task',
      date:
        task.completed_at ||
        task.created_at,
      title: task.title,
      description: task.description,
      href: `/club/tasks/${task.id}/edit`,
      meta: task.due_date
        ? `Due ${new Intl.DateTimeFormat(
            'en-US',
            {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }
          ).format(
            new Date(
              `${task.due_date}T00:00:00`
            )
          )}`
        : null,
      status: task.status,
    });
  }


  for (
    const participation of participationResult.data ?? []
  ) {
    const event =
      participation.events as any;

    if (!event) {
      continue;
    }

    const details: string[] = [];

    if (participation.participant_role) {
      details.push(
        `Role: ${participation.participant_role}`
      );
    }

    if (
      Number(participation.volunteer_hours || 0) > 0
    ) {
      details.push(
        `${Number(
          participation.volunteer_hours
        ).toFixed(2)} volunteer hours`
      );
    }

    if (event.location) {
      details.push(event.location);
    }

    activity.push({
      id: participation.id,
      type: 'event',
      date:
        `${event.event_date}T12:00:00`,
      title: event.name,
      description:
        participation.notes || null,
      href: `/club/events/${event.id}`,
      meta:
        details.length
          ? details.join(' • ')
          : event.event_type,
      status:
        participation.attendance_status,
    });
  }


  for (const donation of donationsResult.data ?? []) {
    const campaign =
      donation.campaigns as any;

    const details: string[] = [];

    if (donation.donation_type) {
      details.push(donation.donation_type);
    }

    if (donation.payment_method) {
      details.push(donation.payment_method);
    }

    if (campaign?.name) {
      details.push(campaign.name);
    }

    activity.push({
      id: donation.id,
      type: 'donation',
      date:
        `${donation.donation_date}T12:00:00`,
      title: campaign?.name
        ? `Donation to ${campaign.name}`
        : 'Donation recorded',
      description: donation.notes,
      href: `/club/donations/${donation.id}/edit`,
      meta:
        details.length
          ? details.join(' • ')
          : null,
      amount:
        Number(donation.amount || 0),
    });
  }


  for (
    const membership of membershipsResult.data ?? []
  ) {
    if (membership.join_date) {

      const details: string[] = [];

      if (membership.membership_type) {
        details.push(
          membership.membership_type
        );
      }

      if (membership.officer_role) {
        details.push(
          membership.officer_role
        );
      }

      if (membership.committee) {
        details.push(
          membership.committee
        );
      }

      activity.push({
        id: `${membership.id}-join`,
        type: 'membership',
        date:
          `${membership.join_date}T12:00:00`,
        title: 'Membership started',
        meta:
          details.length
            ? details.join(' • ')
            : null,
        status:
          membership.membership_status,
        href: `/club/members/${membership.id}/edit`,
      });
    }


    if (membership.end_date) {
      activity.push({
        id: `${membership.id}-end`,
        type: 'membership',
        date:
          `${membership.end_date}T12:00:00`,
        title: 'Membership ended',
        meta:
          membership.membership_type ||
          null,
        status:
          membership.membership_status,
        href: `/club/members/${membership.id}/edit`,
      });
    }
  }


  activity.sort(
    (a, b) =>
      new Date(b.date).getTime() -
      new Date(a.date).getTime()
  );


  return (
    <ContactActivityTimelineClient
      items={activity}
    />
  );
}
