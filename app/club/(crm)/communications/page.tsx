import Link from 'next/link';

import { createClient } from '@/lib/supabase/server';
import { requireCRMRole, type CRMRole } from '@/lib/crm-permissions';

const ROLES: CRMRole[] = [
  'admin',
  'officer',
  'membership_chair',
  'treasurer',
];

export default async function CommunicationsPage() {
  await requireCRMRole(ROLES);

  const supabase =
    await createClient();

  const {
    data: communications,
  } = await supabase
    .from('communications')
    .select(`
      id,
      communication_type,
      recipient_name,
      recipient_email,
      subject,
      status,
      sent_at,
      created_at
    `)
    .order('created_at', {
      ascending: false,
    })
    .limit(50);

  const {
    count: templateCount,
  } = await supabase
    .from('communication_templates')
    .select('*', {
      count: 'exact',
      head: true,
    })
    .eq('is_active', true);

  const {
    count: sentCount,
  } = await supabase
    .from('communications')
    .select('*', {
      count: 'exact',
      head: true,
    })
    .eq('status', 'sent');

  const {
    count: letterCount,
  } = await supabase
    .from('communications')
    .select('*', {
      count: 'exact',
      head: true,
    })
    .eq(
      'communication_type',
      'letter'
    );

  return (
    <div>
      <div className="crm-page-header">
        <div>
          <h2 className="crm-page-title">
            Communications
          </h2>

          <p className="crm-page-description">
            Create letters, generate PDFs,
            send email, and maintain a
            communication history.
          </p>
        </div>

        <div className="crm-page-actions">
          <Link
            href="/club/communications/new?type=letter"
            className="crm-button crm-button-secondary"
          >
            Create Letter
          </Link>

          <Link
            href="/club/communications/new?type=email"
            className="crm-button crm-button-primary"
          >
            Create Email
          </Link>
        </div>
      </div>

      <div className="crm-stat-grid">
        <div className="crm-stat-card">
          <span className="crm-stat-label">
            Templates
          </span>

          <strong className="crm-stat-value">
            {templateCount || 0}
          </strong>
        </div>

        <div className="crm-stat-card">
          <span className="crm-stat-label">
            Letters Generated
          </span>

          <strong className="crm-stat-value">
            {letterCount || 0}
          </strong>
        </div>

        <div className="crm-stat-card">
          <span className="crm-stat-label">
            Emails Sent
          </span>

          <strong className="crm-stat-value">
            {sentCount || 0}
          </strong>
        </div>
      </div>

      <div className="crm-section-header">
        <div>
          <h3>Recent Communications</h3>
        </div>

        <Link
          href="/club/communications/templates"
          className="crm-button crm-button-secondary"
        >
          Manage Templates
        </Link>
      </div>

      <div className="crm-table-card">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Recipient</th>
              <th>Subject</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {communications?.map(
              (item) => (
                <tr key={item.id}>
                  <td>
                    {new Intl.DateTimeFormat(
                      'en-US',
                      {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      }
                    ).format(
                      new Date(
                        item.created_at
                      )
                    )}
                  </td>

                  <td>
                    {item.communication_type ===
                    'email'
                      ? 'Email'
                      : 'Letter'}
                  </td>

                  <td>
                    <Link
                      href={`/club/communications/${item.id}`}
                    >
                      {item.recipient_name ||
                        item.recipient_email ||
                        'No recipient'}
                    </Link>
                  </td>

                  <td>
                    {item.subject || '—'}
                  </td>

                  <td>
                    <span
                      className={`crm-communication-status crm-communication-${item.status}`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>

        {!communications?.length && (
          <div className="crm-empty-state">
            No communications have been
            created yet.
          </div>
        )}
      </div>
    </div>
  );
}
