import {
  Building2,
  CheckCircle2,
  Clock3,
  Mail,
  Phone,
  XCircle,
} from 'lucide-react';

import {
  requireCRMRole,
  type CRMRole,
} from '@/lib/crm-permissions';

import { createClient } from '@/lib/supabase/server';

import {
  convertInquiryToProspect,
  declineInquiry,
  markInquiryReviewing,
} from './actions/inquiry-actions';

const ROLES: CRMRole[] = [
  'admin',
  'officer',
];

type SearchParams = {
  view?: string;
};

function statusLabel(
  value: string
) {
  return value
    .replaceAll('_', ' ')
    .replace(
      /\b\w/g,
      (char) =>
        char.toUpperCase()
    );
}

export default async function CommunityPartnerInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireCRMRole(ROLES);

  const params =
    await searchParams;

  const view =
    params.view || 'open';

  const supabase =
    await createClient();

  let query = supabase
    .from(
      'community_partner_inquiries'
    )
    .select('*')
    .order(
      'created_at',
      {
        ascending: false,
      }
    );

  if (view === 'new') {
    query =
      query.eq(
        'status',
        'new'
      );
  }

  if (view === 'reviewing') {
    query =
      query.eq(
        'status',
        'reviewing'
      );
  }

  if (view === 'converted') {
    query =
      query.eq(
        'status',
        'converted'
      );
  }

  if (view === 'declined') {
    query =
      query.eq(
        'status',
        'declined'
      );
  }

  if (view === 'open') {
    query =
      query.in(
        'status',
        [
          'new',
          'reviewing',
        ]
      );
  }

  const {
    data: inquiries,
    error,
  } = await query;

  if (error) {
    throw new Error(
      error.message
    );
  }

  const {
    data: allInquiries,
  } = await supabase
    .from(
      'community_partner_inquiries'
    )
    .select('status');

  const stats = {
    new:
      allInquiries?.filter(
        (item) =>
          item.status === 'new'
      ).length || 0,

    reviewing:
      allInquiries?.filter(
        (item) =>
          item.status ===
          'reviewing'
      ).length || 0,

    converted:
      allInquiries?.filter(
        (item) =>
          item.status ===
          'converted'
      ).length || 0,
  };

  const tabs = [
    {
      value: 'open',
      label: 'Open',
    },
    {
      value: 'new',
      label: 'New',
    },
    {
      value: 'reviewing',
      label: 'Reviewing',
    },
    {
      value: 'converted',
      label: 'Converted',
    },
    {
      value: 'declined',
      label: 'Declined',
    },
    {
      value: 'all',
      label: 'All',
    },
  ];

  return (
    <div className="crm-page">

      <div className="crm-page-header">

        <div>
          <p className="crm-eyebrow">
            COMMUNITY PARTNERS
          </p>

          <h1>
            Partner Inquiries
          </h1>

          <p>
            Review businesses and
            organizations interested in
            supporting the Port Allegany
            Lions Club.
          </p>
        </div>

      </div>


      <div className="crm-stat-grid">

        <div className="crm-stat-card">
          <Clock3 size={20} />

          <div>
            <span>
              New
            </span>

            <strong>
              {stats.new}
            </strong>
          </div>
        </div>


        <div className="crm-stat-card">
          <Building2 size={20} />

          <div>
            <span>
              Reviewing
            </span>

            <strong>
              {stats.reviewing}
            </strong>
          </div>
        </div>


        <div className="crm-stat-card">
          <CheckCircle2
            size={20}
          />

          <div>
            <span>
              Converted
            </span>

            <strong>
              {stats.converted}
            </strong>
          </div>
        </div>

      </div>


      <div className="crm-partner-tabs">

        {tabs.map(
          (tab) => (
            <a
              key={tab.value}
              href={`/club/community-partner-inquiries?view=${tab.value}`}
              className={
                view === tab.value
                  ? 'crm-partner-tab crm-partner-tab-active'
                  : 'crm-partner-tab'
              }
            >
              {tab.label}
            </a>
          )
        )}

      </div>


      {!inquiries?.length ? (

        <section className="crm-panel">

          <div className="crm-empty-state">
            No inquiries in this view.
          </div>

        </section>

      ) : (

        <div className="crm-inquiry-list">

          {inquiries.map(
            (inquiry) => (

              <article
                key={inquiry.id}
                className="crm-inquiry-card"
              >

                <div className="crm-inquiry-card-header">

                  <div>

                    <div className="crm-inquiry-title-row">

                      <h2>
                        {inquiry.business_name}
                      </h2>

                      <span
                        className={`crm-inquiry-status crm-inquiry-status-${inquiry.status}`}
                      >
                        {statusLabel(
                          inquiry.status
                        )}
                      </span>

                    </div>

                    <p>
                      Submitted{' '}
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
                          inquiry.created_at
                        )
                      )}
                    </p>

                  </div>

                </div>


                <div className="crm-inquiry-grid">

                  <div>

                    <p className="crm-field-label">
                      Contact
                    </p>

                    <strong>
                      {inquiry.first_name}{' '}
                      {inquiry.last_name}
                    </strong>

                    <div className="crm-inquiry-contact">

                      <a
                        href={`mailto:${inquiry.email}`}
                      >
                        <Mail size={14} />
                        {inquiry.email}
                      </a>

                      {inquiry.phone && (
                        <a
                          href={`tel:${inquiry.phone}`}
                        >
                          <Phone size={14} />
                          {inquiry.phone}
                        </a>
                      )}

                    </div>

                  </div>


                  <div className="crm-inquiry-website">

                    <p className="crm-field-label">
                      Website
                    </p>

                    {inquiry.website ? (

                      <div className="crm-website-preview">

                        <div className="crm-website-preview-bar">

                          <div className="crm-website-preview-dots">
                            <span />
                            <span />
                            <span />
                          </div>

                          <span className="crm-website-preview-url">
                            {inquiry.website
                              .replace(/^https?:\/\//, '')
                              .replace(/\/$/, '')}
                          </span>

                        </div>

                        <div className="crm-website-preview-frame">

                          <iframe
                            src={inquiry.website}
                            title={`${inquiry.business_name} website preview`}
                            loading="lazy"
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                          />

                        </div>

                        <div className="crm-website-preview-footer">

                          <a
                            href={inquiry.website}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Open Website
                          </a>

                        </div>

                      </div>

                    ) : (

                      <div className="crm-website-preview-empty">
                        No website provided
                      </div>

                    )}

                  </div>


                  <div className="crm-inquiry-support">

                    <p className="crm-field-label">
                      Interests
                    </p>

                    <div className="crm-inquiry-tags">

                      {inquiry.support_interests?.length ? (

                        inquiry.support_interests.map(
                          (
                            interest: string
                          ) => (
                            <span
                              key={
                                interest
                              }
                            >
                              {interest}
                            </span>
                          )
                        )

                      ) : (
                        <span>
                          None selected
                        </span>
                      )}

                    </div>

                  </div>

                </div>


                {inquiry.message && (

                  <div className="crm-inquiry-message">

                    <p className="crm-field-label">
                      Message
                    </p>

                    <p>
                      {inquiry.message}
                    </p>

                  </div>

                )}


                <div className="crm-inquiry-actions">

                  {inquiry.status ===
                    'new' && (

                    <form
                      action={
                        markInquiryReviewing
                      }
                    >
                      <input
                        type="hidden"
                        name="inquiry_id"
                        value={
                          inquiry.id
                        }
                      />

                      <button
                        className="crm-button crm-button-secondary"
                        type="submit"
                      >
                        Mark Reviewing
                      </button>
                    </form>

                  )}


                  {inquiry.status !==
                    'converted' &&
                    inquiry.status !==
                      'declined' && (

                    <form
                      action={
                        convertInquiryToProspect
                      }
                    >
                      <input
                        type="hidden"
                        name="inquiry_id"
                        value={
                          inquiry.id
                        }
                      />

                      <button
                        className="crm-button"
                        type="submit"
                      >
                        <CheckCircle2
                          size={15}
                        />
                        Convert to Prospect
                      </button>
                    </form>

                  )}


                  {inquiry.status !==
                    'converted' &&
                    inquiry.status !==
                      'declined' && (

                    <form
                      action={
                        declineInquiry
                      }
                    >
                      <input
                        type="hidden"
                        name="inquiry_id"
                        value={
                          inquiry.id
                        }
                      />

                      <button
                        className="crm-button crm-button-danger"
                        type="submit"
                      >
                        <XCircle
                          size={15}
                        />
                        Decline
                      </button>
                    </form>

                  )}

                </div>

              </article>

            )
          )}

        </div>

      )}

    </div>
  );
}
