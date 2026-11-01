'use client';

import { useState } from 'react';
import Link from 'next/link';

export type ActivityItem = {
  id: string;
  type:
    | 'note'
    | 'task'
    | 'event'
    | 'donation'
    | 'membership';
  date: string;
  title: string;
  description?: string | null;
  meta?: string | null;
  href?: string | null;
  amount?: number | null;
  status?: string | null;
};

const filters = [
  { key: 'all', label: 'All' },
  { key: 'note', label: 'Notes' },
  { key: 'task', label: 'Tasks' },
  { key: 'event', label: 'Events' },
  { key: 'donation', label: 'Donations' },
  { key: 'membership', label: 'Membership' },
] as const;

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

function labelForType(type: ActivityItem['type']) {
  switch (type) {
    case 'note':
      return 'Note';
    case 'task':
      return 'Task';
    case 'event':
      return 'Event';
    case 'donation':
      return 'Donation';
    case 'membership':
      return 'Membership';
  }
}

export default function ContactActivityTimelineClient({
  items,
}: {
  items: ActivityItem[];
}) {
  const [filter, setFilter] = useState<
    | 'all'
    | 'note'
    | 'task'
    | 'event'
    | 'donation'
    | 'membership'
  >('all');

  const filteredItems =
    filter === 'all'
      ? items
      : items.filter((item) => item.type === filter);

  return (
    <section className="crm-panel crm-activity-panel">

      <div className="crm-panel-header crm-panel-header-row">

        <div>
          <h3>Activity</h3>

          <div className="crm-activity-subtitle">
            Unified history across this CRM record
          </div>
        </div>

        <div className="crm-activity-filters">
          {filters.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={
                filter === item.key
                  ? 'crm-activity-filter crm-activity-filter-active'
                  : 'crm-activity-filter'
              }
            >
              {item.label}
            </button>
          ))}
        </div>

      </div>


      {filteredItems.length ? (

        <div className="crm-activity-timeline">

          {filteredItems.map((item) => (

            <div
              key={`${item.type}-${item.id}`}
              className={`crm-activity-item crm-activity-${item.type}`}
            >

              <div className="crm-activity-marker">
                <span />
              </div>


              <div className="crm-activity-body">

                <div className="crm-activity-topline">

                  <div className="crm-activity-heading">

                    <span
                      className={`crm-activity-type crm-activity-type-${item.type}`}
                    >
                      {labelForType(item.type)}
                    </span>

                    {item.href ? (
                      <Link
                        href={item.href}
                        className="crm-activity-title crm-link"
                      >
                        {item.title}
                      </Link>
                    ) : (
                      <strong className="crm-activity-title">
                        {item.title}
                      </strong>
                    )}

                  </div>


                  <time className="crm-activity-date">
                    {formatDate(item.date)}
                  </time>

                </div>


                {item.description && (
                  <div className="crm-activity-description">
                    {item.description}
                  </div>
                )}


                <div className="crm-activity-footer">

                  {item.meta && (
                    <span className="crm-activity-meta">
                      {item.meta}
                    </span>
                  )}

                  {typeof item.amount === 'number' && (
                    <strong className="crm-activity-amount">
                      ${item.amount.toFixed(2)}
                    </strong>
                  )}

                  {item.status && (
                    <span className="crm-activity-status">
                      {item.status.replaceAll('_', ' ')}
                    </span>
                  )}

                </div>

              </div>

            </div>

          ))}

        </div>

      ) : (

        <div className="crm-empty-state">
          No activity matches this filter.
        </div>

      )}

    </section>
  );
}
