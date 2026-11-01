import Link from 'next/link';

import { createClient } from '@/lib/supabase/server';
import { requireCRMRole, type CRMRole } from '@/lib/crm-permissions';

import { logCommunityPartnerOutreach } from './actions/community-partner-actions';

const ROLES: CRMRole[] = [
  'admin',
  'officer',
  'membership_chair',
  'treasurer',
];

type SearchParams = Promise<{
  view?: string;
  q?: string;
}>;

function formatStatus(value: string | null) {
  return (value || 'not_prospect')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default async function CommunityPartnersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireCRMRole(ROLES);

  const params = await searchParams;

  const view = params.view || 'all';
  const q = params.q?.trim() || '';

  const supabase = await createClient();

  let query = supabase
    .from('organizations')
    .select(`
      id,
      name,
      organization_type,
      email,
      phone,
      website,
      facebook_url,
      community_partner_status,
      community_partner_support_types,
      community_partner_since,
      community_partner_public,
      community_partner_last_contacted,
      community_partner_next_follow_up
    `)
    .neq(
      'community_partner_status',
      'not_prospect'
    )
    .order('name');

  const today = new Date()
    .toISOString()
    .slice(0, 10);

  if (view === 'prospects') {
    query = query.eq(
      'community_partner_status',
      'prospect'
    );
  }

  if (view === 'contacted') {
    query = query.eq(
      'community_partner_status',
      'contacted'
    );
  }

  if (view === 'interested') {
    query = query.eq(
      'community_partner_status',
      'interested'
    );
  }

  if (view === 'active') {
    query = query.eq(
      'community_partner_status',
      'active'
    );
  }

  if (view === 'public') {
    query = query
      .eq(
        'community_partner_status',
        'active'
      )
      .eq(
        'community_partner_public',
        true
      );
  }

  if (view === 'followup') {
    query = query
      .not(
        'community_partner_next_follow_up',
        'is',
        null
      )
      .lte(
        'community_partner_next_follow_up',
        today
      );
  }

  if (q) {
    query = query.ilike(
      'name',
      `%${q}%`
    );
  }

  const {
    data: organizations,
    error,
  } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const { data: allPartners } =
    await supabase
      .from('organizations')
      .select(`
        community_partner_status,
        community_partner_public,
        community_partner_next_follow_up
      `)
      .neq(
        'community_partner_status',
        'not_prospect'
      );

  const stats = {
    prospects:
      allPartners?.filter(
        (item) =>
          item.community_partner_status ===
          'prospect'
      ).length || 0,

    interested:
      allPartners?.filter(
        (item) =>
          item.community_partner_status ===
          'interested'
      ).length || 0,

    active:
      allPartners?.filter(
        (item) =>
          item.community_partner_status ===
          'active'
      ).length || 0,

    followup:
      allPartners?.filter((item) => {
        if (
          !item.community_partner_next_follow_up
        ) {
          return false;
        }

        return (
          item.community_partner_next_follow_up <=
          today
        );
      }).length || 0,
  };

  const views = [
    ['all', 'All'],
    ['prospects', 'Prospects'],
    ['contacted', 'Contacted'],
    ['interested', 'Interested'],
    ['followup', 'Needs Follow-up'],
    ['active', 'Active Partners'],
    ['public', 'Public Partners'],
  ];

  return (
    <div>
      <div className="crm-page-header">
        <div>
          <h2 className="crm-page-title">
            Community Partners
          </h2>

          <p className="crm-page-description">
            Track business outreach, follow-up,
            support, and active community
            partnerships.
          </p>
        </div>

        <Link
          href="/club/organizations/new"
          className="crm-button crm-button-primary"
        >
          + Add Organization
        </Link>
      </div>

      <div className="crm-stat-grid">
        <div className="crm-stat-card">
          <span className="crm-stat-label">
            Prospects
          </span>

          <strong className="crm-stat-value">
            {stats.prospects}
          </strong>
        </div>

        <div className="crm-stat-card">
          <span className="crm-stat-label">
            Interested
          </span>

          <strong className="crm-stat-value">
            {stats.interested}
          </strong>
        </div>

        <div className="crm-stat-card">
          <span className="crm-stat-label">
            Active Partners
          </span>

          <strong className="crm-stat-value">
            {stats.active}
          </strong>
        </div>

        <div className="crm-stat-card">
          <span className="crm-stat-label">
            Needs Follow-up
          </span>

          <strong className="crm-stat-value">
            {stats.followup}
          </strong>
        </div>
      </div>

      <div className="crm-partner-toolbar">
        <div className="crm-partner-tabs">
          {views.map(([value, label]) => (
            <Link
              key={value}
              href={`/club/community-partners?view=${value}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
              className={
                view === value
                  ? 'crm-partner-tab crm-partner-tab-active'
                  : 'crm-partner-tab'
              }
            >
              {label}
            </Link>
          ))}
        </div>

        <form
          method="get"
          className="crm-partner-search"
        >
          <input
            type="hidden"
            name="view"
            value={view}
          />

          <input
            type="search"
            name="q"
            placeholder="Search organizations..."
            defaultValue={q}
          />

          <button
            type="submit"
            className="crm-button crm-button-secondary"
          >
            Search
          </button>
        </form>
      </div>

      <div className="crm-table-card">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Organization</th>
              <th>Status</th>
              <th>Support</th>
              <th>Last Contacted</th>
              <th>Next Follow-up</th>
              <th>Public</th>
              <th>Quick Actions</th>
            </tr>
          </thead>

          <tbody>
            {organizations?.map(
              (organization) => {
                const overdue =
                  organization.community_partner_next_follow_up &&
                  organization.community_partner_next_follow_up <=
                    today;

                return (
                  <tr key={organization.id}>
                    <td>
                      <Link
                        href={`/club/organizations/${organization.id}`}
                        className="crm-link"
                      >
                        <strong>
                          {organization.name}
                        </strong>
                      </Link>

                      {organization.organization_type && (
                        <div className="crm-table-subtext">
                          {
                            organization.organization_type
                          }
                        </div>
                      )}
                    </td>

                    <td>
                      <span
                        className={`crm-partner-status crm-partner-status-${organization.community_partner_status}`}
                      >
                        {formatStatus(
                          organization.community_partner_status
                        )}
                      </span>
                    </td>

                    <td>
                      {organization
                        .community_partner_support_types
                        ?.length
                        ? organization.community_partner_support_types.join(
                            ', '
                          )
                        : '—'}
                    </td>

                    <td>
                      {organization.community_partner_last_contacted ||
                        '—'}
                    </td>

                    <td>
                      <span
                        className={
                          overdue
                            ? 'crm-followup-overdue'
                            : ''
                        }
                      >
                        {organization.community_partner_next_follow_up ||
                          '—'}
                      </span>
                    </td>

                    <td>
                      {organization.community_partner_public
                        ? 'Yes'
                        : 'No'}
                    </td>

                    <td>
                      <div className="crm-partner-actions">

                        <Link
                          href={`/club/communications/new?type=email&organization=${organization.id}`}
                          className="crm-partner-action-link"
                        >
                          Email
                        </Link>

                        <Link
                          href={`/club/communications/new?type=letter&organization=${organization.id}`}
                          className="crm-partner-action-link"
                        >
                          Letter
                        </Link>

                        <Link
                          href={`/club/tasks/new?organization=${organization.id}`}
                          className="crm-partner-action-link"
                        >
                          Task
                        </Link>

                      </div>

                      <form
                        action={
                          logCommunityPartnerOutreach
                        }
                        className="crm-outreach-form"
                      >
                        <input
                          type="hidden"
                          name="organization_id"
                          value={
                            organization.id
                          }
                        />

                        <select
                          name="outreach_type"
                          defaultValue="facebook"
                          title="Outreach method"
                        >
                          <option value="facebook">
                            Facebook
                          </option>
                          <option value="email">
                            Email
                          </option>
                          <option value="phone">
                            Phone
                          </option>
                          <option value="in_person">
                            In Person
                          </option>
                          <option value="meeting">
                            Meeting
                          </option>
                          <option value="letter">
                            Letter
                          </option>
                          <option value="other">
                            Other
                          </option>
                        </select>

                        <select
                          name="outcome"
                          defaultValue=""
                          title="Outcome"
                        >
                          <option value="">
                            Outcome...
                          </option>
                          <option value="no_response">
                            No Response
                          </option>
                          <option value="responded">
                            Responded
                          </option>
                          <option value="interested">
                            Interested
                          </option>
                          <option value="follow_up">
                            Follow Up
                          </option>
                          <option value="meeting_scheduled">
                            Meeting Scheduled
                          </option>
                          <option value="not_interested">
                            Not Interested
                          </option>
                          <option value="donated">
                            Donated
                          </option>
                          <option value="volunteered">
                            Volunteered
                          </option>
                          <option value="joined">
                            Joined
                          </option>
                        </select>

                        <input
                          type="date"
                          name="next_follow_up"
                          title="Next follow-up date"
                        />

                        <input
                          type="text"
                          name="notes"
                          placeholder="Quick note..."
                          title="Outreach notes"
                        />

                        <button
                          type="submit"
                          className="crm-button crm-button-secondary crm-button-small"
                        >
                          Log Outreach
                        </button>
                      </form>

                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>

        {!organizations?.length && (
          <div className="crm-empty-state">
            No organizations match this view.
          </div>
        )}
      </div>
    </div>
  );
}
