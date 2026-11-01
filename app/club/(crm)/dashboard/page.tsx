import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();

  const today = new Date().toISOString().slice(0, 10);

  const [
    contactsResult,
    membersResult,
    organizationsResult,
    eventsResult,
    participationResult,
    donationsResult,
    openTasksResult,
    overdueTasksResult,
    upcomingEventsResult,
    recentDonationsResult,
    recentTasksResult,
    duesAttentionResult,
    campaignsResult,
  ] = await Promise.all([

    supabase
      .from('contacts')
      .select('*', {
        count: 'exact',
        head: true,
      }),

    supabase
      .from('memberships')
      .select('*', {
        count: 'exact',
        head: true,
      })
      .eq('membership_status', 'active'),

    supabase
      .from('organizations')
      .select('*', {
        count: 'exact',
        head: true,
      }),

    supabase
      .from('events')
      .select('*', {
        count: 'exact',
        head: true,
      }),

    supabase
      .from('event_participants')
      .select('volunteer_hours')
      .eq('attendance_status', 'attended'),

    supabase
      .from('donations')
      .select('amount, contact_id'),

    supabase
      .from('tasks')
      .select('*', {
        count: 'exact',
        head: true,
      })
      .in('status', [
        'open',
        'in_progress',
      ]),

    supabase
      .from('tasks')
      .select('*', {
        count: 'exact',
        head: true,
      })
      .lt('due_date', today)
      .in('status', [
        'open',
        'in_progress',
      ]),

    supabase
      .from('events')
      .select(`
        id,
        name,
        event_type,
        event_date,
        location,
        status
      `)
      .gte('event_date', today)
      .neq('status', 'cancelled')
      .order('event_date', {
        ascending: true,
      })
      .limit(5),

    supabase
      .from('donations')
      .select(`
        id,
        amount,
        donation_date,
        donation_type,
        contacts (
          id,
          first_name,
          last_name
        ),
        organizations (
          id,
          name
        ),
        campaigns (
          id,
          name
        )
      `)
      .order('donation_date', {
        ascending: false,
      })
      .limit(5),

    supabase
      .from('tasks')
      .select(`
        id,
        title,
        due_date,
        priority,
        status,
        contacts (
          id,
          first_name,
          last_name
        ),
        organizations (
          id,
          name
        )
      `)
      .in('status', [
        'open',
        'in_progress',
      ])
      .order('due_date', {
        ascending: true,
        nullsFirst: false,
      })
      .limit(6),

    supabase
      .from('memberships')
      .select(`
        id,
        dues_status,
        contacts (
          id,
          first_name,
          last_name
        )
      `)
      .in('dues_status', [
        'due',
        'overdue',
      ])
      .eq('membership_status', 'active')
      .limit(6),

    supabase
      .from('campaigns')
      .select(`
        id,
        name,
        goal_amount,
        status,
        donations (
          id,
          amount
        )
      `)
      .eq('status', 'active')
      .order('name')
      .limit(4),
  ]);

  const volunteerHours =
    participationResult.data?.reduce(
      (total, row) =>
        total +
        Number(row.volunteer_hours || 0),
      0
    ) ?? 0;

  const totalDonations =
    donationsResult.data?.reduce(
      (total, row) =>
        total +
        Number(row.amount || 0),
      0
    ) ?? 0;

  const uniqueDonors =
    new Set(
      donationsResult.data
        ?.map((row) => row.contact_id)
        .filter(Boolean)
    ).size;

  const upcomingEvents =
    upcomingEventsResult.data ?? [];

  const recentDonations =
    recentDonationsResult.data ?? [];

  const recentTasks =
    recentTasksResult.data ?? [];

  const duesAttention =
    duesAttentionResult.data ?? [];

  const campaigns =
    campaignsResult.data ?? [];

  return (
    <div>

      <div className="crm-page-header crm-page-header-row">

        <div>
          <h2 className="crm-page-title">
            Dashboard
          </h2>

          <p className="crm-page-description">
            Operational overview of the Port Allegany Lions Club.
          </p>
        </div>

        <div className="crm-dashboard-actions">

          <Link
            href="/club/contacts/new"
            className="crm-button crm-button-secondary"
          >
            + Contact
          </Link>

          <Link
            href="/club/events/new"
            className="crm-button crm-button-secondary"
          >
            + Event
          </Link>

          <Link
            href="/club/tasks/new"
            className="crm-button"
          >
            + Task
          </Link>

        </div>

      </div>


      <div className="crm-stat-grid">

        <div className="crm-stat-card">
          <p className="crm-stat-label">
            Contacts
          </p>

          <p className="crm-stat-number">
            {contactsResult.count ?? 0}
          </p>
        </div>


        <div className="crm-stat-card">
          <p className="crm-stat-label">
            Active Members
          </p>

          <p className="crm-stat-number">
            {membersResult.count ?? 0}
          </p>
        </div>


        <div className="crm-stat-card">
          <p className="crm-stat-label">
            Events
          </p>

          <p className="crm-stat-number">
            {eventsResult.count ?? 0}
          </p>
        </div>


        <div className="crm-stat-card">
          <p className="crm-stat-label">
            Volunteer Hours
          </p>

          <p className="crm-stat-number">
            {volunteerHours.toFixed(2)}
          </p>
        </div>


        <div className="crm-stat-card">
          <p className="crm-stat-label">
            Total Donations
          </p>

          <p className="crm-stat-number crm-stat-money">
            ${totalDonations.toFixed(2)}
          </p>
        </div>


        <div className="crm-stat-card">
          <p className="crm-stat-label">
            Donors
          </p>

          <p className="crm-stat-number">
            {uniqueDonors}
          </p>
        </div>


        <div className="crm-stat-card">
          <p className="crm-stat-label">
            Open Tasks
          </p>

          <p className="crm-stat-number">
            {openTasksResult.count ?? 0}
          </p>
        </div>


        <div className="crm-stat-card">
          <p className="crm-stat-label">
            Overdue Tasks
          </p>

          <p
            className={`crm-stat-number ${
              (overdueTasksResult.count ?? 0) > 0
                ? 'crm-stat-alert'
                : ''
            }`}
          >
            {overdueTasksResult.count ?? 0}
          </p>
        </div>

      </div>


      <div className="crm-dashboard-grid">


        <section className="crm-panel">

          <div className="crm-panel-header crm-panel-header-row">

            <h3>Upcoming Events</h3>

            <Link
              href="/club/events"
              className="crm-small-action"
            >
              View all
            </Link>

          </div>


          {upcomingEvents.length ? (

            <div className="crm-dashboard-list">

              {upcomingEvents.map(
                (event: any) => (
                  <Link
                    key={event.id}
                    href={`/club/events/${event.id}`}
                    className="crm-dashboard-list-item"
                  >

                    <div>

                      <strong>
                        {event.name}
                      </strong>

                      <div className="crm-dashboard-meta">
                        {event.event_type}

                        {event.location && (
                          <>
                            {' '}• {event.location}
                          </>
                        )}
                      </div>

                    </div>


                    <div className="crm-dashboard-date">

                      {new Intl.DateTimeFormat(
                        'en-US',
                        {
                          month: 'short',
                          day: 'numeric',
                        }
                      ).format(
                        new Date(
                          `${event.event_date}T00:00:00`
                        )
                      )}

                    </div>

                  </Link>
                )
              )}

            </div>

          ) : (

            <div className="crm-empty-state">
              No upcoming events.
            </div>

          )}

        </section>


        <section className="crm-panel">

          <div className="crm-panel-header crm-panel-header-row">

            <h3>Tasks Needing Attention</h3>

            <Link
              href="/club/tasks"
              className="crm-small-action"
            >
              View all
            </Link>

          </div>


          {recentTasks.length ? (

            <div className="crm-dashboard-list">

              {recentTasks.map(
                (task: any) => {

                  const contact =
                    task.contacts as any;

                  const organization =
                    task.organizations as any;

                  const overdue =
                    task.due_date &&
                    task.due_date < today;

                  return (
                    <Link
                      key={task.id}
                      href={`/club/tasks/${task.id}/edit`}
                      className="crm-dashboard-list-item"
                    >

                      <div>

                        <strong>
                          {task.title}
                        </strong>

                        <div className="crm-dashboard-meta">

                          {contact &&
                            `${contact.first_name} ${contact.last_name}`}

                          {contact &&
                            organization &&
                            ' • '}

                          {organization?.name}

                        </div>

                      </div>


                      <div>

                        {task.due_date ? (
                          <span
                            className={
                              overdue
                                ? 'crm-dashboard-date crm-dashboard-date-overdue'
                                : 'crm-dashboard-date'
                            }
                          >
                            {task.due_date}
                          </span>
                        ) : (
                          <span className="crm-dashboard-date">
                            No due date
                          </span>
                        )}

                      </div>

                    </Link>
                  );
                }
              )}

            </div>

          ) : (

            <div className="crm-empty-state">
              No open tasks.
            </div>

          )}

        </section>


        <section className="crm-panel">

          <div className="crm-panel-header crm-panel-header-row">

            <h3>Recent Donations</h3>

            <Link
              href="/club/donations"
              className="crm-small-action"
            >
              View all
            </Link>

          </div>


          {recentDonations.length ? (

            <div className="crm-dashboard-list">

              {recentDonations.map(
                (donation: any) => {

                  const contact =
                    donation.contacts as any;

                  const organization =
                    donation.organizations as any;

                  const campaign =
                    donation.campaigns as any;

                  const donor =
                    contact
                      ? `${contact.first_name} ${contact.last_name}`
                      : organization?.name ||
                        'Unknown';

                  return (
                    <div
                      key={donation.id}
                      className="crm-dashboard-list-item"
                    >

                      <div>

                        <strong>
                          {donor}
                        </strong>

                        <div className="crm-dashboard-meta">

                          {campaign?.name ||
                            'Unassigned Fund'}

                          {' '}•{' '}

                          {donation.donation_type}

                        </div>

                      </div>


                      <div className="crm-dashboard-money">
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
              No donations recorded yet.
            </div>

          )}

        </section>


        <section className="crm-panel">

          <div className="crm-panel-header crm-panel-header-row">

            <h3>Dues Attention</h3>

            <Link
              href="/club/members?dues=overdue"
              className="crm-small-action"
            >
              View members
            </Link>

          </div>


          {duesAttention.length ? (

            <div className="crm-dashboard-list">

              {duesAttention.map(
                (membership: any) => {

                  const contact =
                    membership.contacts as any;

                  return (
                    <Link
                      key={membership.id}
                      href={`/club/contacts/${contact.id}`}
                      className="crm-dashboard-list-item"
                    >

                      <div>

                        <strong>
                          {contact.first_name}{' '}
                          {contact.last_name}
                        </strong>

                      </div>


                      <span
                        className={`crm-dues-badge crm-dues-${membership.dues_status}`}
                      >
                        {membership.dues_status}
                      </span>

                    </Link>
                  );
                }
              )}

            </div>

          ) : (

            <div className="crm-empty-state">
              No dues require attention.
            </div>

          )}

        </section>

      </div>


      <div className="crm-dashboard-section">

        <div className="crm-dashboard-section-header">

          <div>
            <h3>
              Active Campaigns
            </h3>

            <p>
              Fundraising progress across active funds and campaigns.
            </p>
          </div>

          <Link
            href="/club/campaigns"
            className="crm-small-action"
          >
            Manage campaigns
          </Link>

        </div>


        <div className="crm-campaign-grid">

          {campaigns.length ? (

            campaigns.map(
              (campaign: any) => {

                const raised =
                  campaign.donations?.reduce(
                    (
                      total: number,
                      donation: any
                    ) =>
                      total +
                      Number(
                        donation.amount || 0
                      ),
                    0
                  ) ?? 0;

                const goal =
                  campaign.goal_amount !== null
                    ? Number(
                        campaign.goal_amount
                      )
                    : null;

                const progress =
                  goal && goal > 0
                    ? Math.min(
                        100,
                        (raised / goal) * 100
                      )
                    : 0;

                return (
                  <Link
                    href={`/club/campaigns/${campaign.id}`}
                    key={campaign.id}
                    className="crm-campaign-card"
                  >

                    <div className="crm-campaign-card-header">

                      <strong>
                        {campaign.name}
                      </strong>

                      <span>
                        ${raised.toFixed(2)}
                      </span>

                    </div>


                    {goal !== null ? (

                      <>

                        <div className="crm-progress-track">

                          <div
                            className="crm-progress-fill"
                            style={{
                              width:
                                `${progress}%`,
                            }}
                          />

                        </div>


                        <div className="crm-campaign-progress-meta">

                          <span>
                            {progress.toFixed(0)}%
                          </span>

                          <span>
                            Goal ${goal.toFixed(2)}
                          </span>

                        </div>

                      </>

                    ) : (

                      <div className="crm-campaign-progress-meta">
                        <span>
                          No fundraising goal set
                        </span>
                      </div>

                    )}

                  </Link>
                );
              }
            )

          ) : (

            <div className="crm-empty-state">
              No active campaigns.
            </div>

          )}

        </div>

      </div>

    </div>
  );
}
