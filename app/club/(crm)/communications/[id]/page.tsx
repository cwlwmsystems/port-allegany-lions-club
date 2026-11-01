import Link from 'next/link';
import { notFound } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { requireCRMRole, type CRMRole } from '@/lib/crm-permissions';

import { sendCommunicationEmail } from '../actions/communication-actions';

const ROLES: CRMRole[] = [
  'admin',
  'officer',
  'membership_chair',
  'treasurer',
];

export default async function CommunicationRecordPage({
  params,
  searchParams,
}: {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    sent?: string;
  }>;
}) {
  await requireCRMRole(ROLES);

  const { id } =
    await params;

  const query =
    await searchParams;

  const supabase =
    await createClient();

  const {
    data: communication,
    error,
  } = await supabase
    .from('communications')
    .select(`
      *,
      contacts (
        id,
        first_name,
        last_name,
        email
      ),
      organizations (
        id,
        name
      ),
      communication_templates (
        id,
        name
      )
    `)
    .eq('id', id)
    .single();

  if (
    error ||
    !communication
  ) {
    notFound();
  }

  const isEmail =
    communication.communication_type ===
    'email';

  return (
    <div>
      <div className="crm-page-header">
        <div>
          <div className="crm-record-eyebrow">
            {isEmail
              ? 'Email'
              : 'Letter'}
          </div>

          <h2 className="crm-page-title">
            {communication.subject ||
              `${isEmail ? 'Email' : 'Letter'} for ${
                communication.recipient_name ||
                'Recipient'
              }`}
          </h2>

          <p className="crm-page-description">
            {communication.recipient_name ||
              'No recipient selected'}
          </p>
        </div>

        <div className="crm-page-actions">
          <Link
            href="/club/communications"
            className="crm-button crm-button-secondary"
          >
            Back
          </Link>

          {!isEmail && (
            <a
              href={`/club/communications/${communication.id}/pdf`}
              className="crm-button crm-button-primary"
            >
              Download PDF
            </a>
          )}
        </div>
      </div>

      {query.sent === '1' && (
        <div className="crm-success-banner">
          Email sent successfully.
        </div>
      )}

      <div className="crm-record-grid">
        <section className="crm-card">
          <div className="crm-section-header">
            <h3>
              {isEmail
                ? 'Email Preview'
                : 'Letter Preview'}
            </h3>
          </div>

          <div className="crm-letter-preview">
            {isEmail && (
              <div className="crm-email-preview-meta">
                <div>
                  <strong>To:</strong>{' '}
                  {communication.recipient_email ||
                    'No email address'}
                </div>

                <div>
                  <strong>
                    Subject:
                  </strong>{' '}
                  {communication.subject ||
                    '—'}
                </div>
              </div>
            )}

            <div className="crm-communication-body">
              {communication.body}
            </div>
          </div>

          {isEmail &&
            communication.status !==
              'sent' && (
              <form
                action={
                  sendCommunicationEmail
                }
                className="crm-send-email-panel"
              >
                <input
                  type="hidden"
                  name="communication_id"
                  value={
                    communication.id
                  }
                />

                <button
                  type="submit"
                  className="crm-button crm-button-primary"
                  disabled={
                    !communication.recipient_email
                  }
                >
                  Send Through Resend
                </button>
              </form>
            )}
        </section>

        <aside className="crm-card">
          <div className="crm-section-header">
            <h3>Details</h3>
          </div>

          <dl className="crm-detail-list">
            <div>
              <dt>Status</dt>

              <dd>
                <span
                  className={`crm-communication-status crm-communication-${communication.status}`}
                >
                  {
                    communication.status
                  }
                </span>
              </dd>
            </div>

            <div>
              <dt>Recipient</dt>

              <dd>
                {communication.recipient_name ||
                  '—'}
              </dd>
            </div>

            <div>
              <dt>Email</dt>

              <dd>
                {communication.recipient_email ||
                  '—'}
              </dd>
            </div>

            <div>
              <dt>Template</dt>

              <dd>
                {(
                  communication.communication_templates as any
                )?.name || 'Custom'}
              </dd>
            </div>

            {communication.sent_at && (
              <div>
                <dt>Sent</dt>

                <dd>
                  {new Intl.DateTimeFormat(
                    'en-US',
                    {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    }
                  ).format(
                    new Date(
                      communication.sent_at
                    )
                  )}
                </dd>
              </div>
            )}

            {communication.resend_message_id && (
              <div>
                <dt>
                  Resend Message ID
                </dt>

                <dd>
                  <code>
                    {
                      communication.resend_message_id
                    }
                  </code>
                </dd>
              </div>
            )}
          </dl>
        </aside>
      </div>
    </div>
  );
}
