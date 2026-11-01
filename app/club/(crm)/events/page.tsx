import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    type?: string;
    q?: string;
  }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('events')
    .select(`
      id,
      name,
      event_type,
      event_date,
      location,
      status,
      event_participants (
        id,
        volunteer_hours
      )
    `)
    .order('event_date', { ascending: false });

  if (params.status) {
    query = query.eq(
      'status',
      params.status
    );
  }

  if (params.type) {
    query = query.eq(
      'event_type',
      params.type
    );
  }

  if (params.q) {
    query = query.ilike(
      'name',
      `%${params.q}%`
    );
  }

  const { data: events, error } =
    await query;

  if (error) {
    return (
      <div className="crm-error">
        Unable to load events: {error.message}
      </div>
    );
  }

  return (
    <div>

      <div className="crm-page-header crm-page-header-row">
        <div>
          <h2 className="crm-page-title">Events</h2>
          <p className="crm-page-description">
            Manage service projects, fundraisers, meetings, and volunteer participation.
          </p>
        </div>

        <Link href="/club/events/new" className="crm-button">
          + Add Event
        </Link>
      </div>

      <form
        method="get"
        className="crm-search-filter-bar"
      >
        <input
          type="search"
          name="q"
          placeholder="Search events..."
          defaultValue={params.q || ''}
          className="crm-search-input"
        />

        <select
          name="status"
          defaultValue={params.status || ''}
        >
          <option value="">All Statuses</option>
          <option value="planned">Planned</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          name="type"
          defaultValue={params.type || ''}
        >
          <option value="">All Event Types</option>
          <option value="Service Project">
            Service Project
          </option>
          <option value="Fundraiser">
            Fundraiser
          </option>
          <option value="Club Meeting">
            Club Meeting
          </option>
          <option value="Community Event">
            Community Event
          </option>
          <option value="Membership Event">
            Membership Event
          </option>
          <option value="Social Event">
            Social Event
          </option>
          <option value="Youth Program">
            Youth Program
          </option>
          <option value="District Event">
            Lions District Event
          </option>
          <option value="Other">
            Other
          </option>
        </select>

        <button
          type="submit"
          className="crm-button"
        >
          Filter
        </button>

        <Link
          href="/club/events"
          className="crm-filter-clear"
        >
          Clear
        </Link>
      </form>

      <div className="crm-result-count">
        {events?.length ?? 0}
        {' '}
        event
        {(events?.length ?? 0) === 1 ? '' : 's'}
      </div>

      <div className="crm-table-card">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Date</th>
              <th>Type</th>
              <th>Status</th>
              <th>Location</th>
              <th>Participants</th>
              <th>Hours</th>
            </tr>
          </thead>

          <tbody>
            {events?.map((event: any) => {
              const hours =
                event.event_participants?.reduce(
                  (total: number, participant: any) =>
                    total + Number(participant.volunteer_hours || 0),
                  0
                ) ?? 0;

              return (
                <tr key={event.id}>
                  <td>
                    <Link
                      href={`/club/events/${event.id}`}
                      className="crm-contact-name"
                    >
                      {event.name}
                    </Link>
                  </td>

                  <td>
                    {new Intl.DateTimeFormat('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    }).format(
                      new Date(`${event.event_date}T00:00:00`)
                    )}
                  </td>

                  <td>{event.event_type}</td>

                  <td>
                    <span
                      className={`crm-status-badge crm-event-${event.status}`}
                    >
                      {event.status}
                    </span>
                  </td>

                  <td>{event.location || '—'}</td>
                  <td>{event.event_participants?.length ?? 0}</td>
                  <td>{hours.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
