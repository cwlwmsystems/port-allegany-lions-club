import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from('campaigns')
    .select(`
      *,
      donations (
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
        )
      )
    `)
    .eq('id', id)
    .single();

  if (!campaign) {
    notFound();
  }

  const raised =
    campaign.donations?.reduce(
      (total: number, donation: any) =>
        total + Number(donation.amount || 0),
      0
    ) ?? 0;

  const goal =
    campaign.goal_amount !== null
      ? Number(campaign.goal_amount)
      : null;

  return (
    <div>

      <div className="crm-record-breadcrumb">
        <Link href="/club/campaigns">
          Campaigns
        </Link>
        <span>/</span>
        <span>{campaign.name}</span>
      </div>


      <div className="crm-record-header">

        <div>
          <h2 className="crm-record-title">
            {campaign.name}
          </h2>

          <div className="crm-record-subtitle">
            {campaign.campaign_type}
            {' '}•{' '}
            {campaign.status}
          </div>
        </div>

        <Link
          href={`/club/campaigns/${campaign.id}/edit`}
          className="crm-button crm-button-secondary"
        >
          Edit Campaign
        </Link>

      </div>


      <div className="crm-stat-grid crm-event-stat-grid">

        <div className="crm-stat-card">
          <p className="crm-stat-label">
            Raised
          </p>
          <p className="crm-stat-number">
            ${raised.toFixed(2)}
          </p>
        </div>

        <div className="crm-stat-card">
          <p className="crm-stat-label">
            Goal
          </p>
          <p className="crm-stat-number">
            {goal !== null
              ? `$${goal.toFixed(2)}`
              : '—'}
          </p>
        </div>

        <div className="crm-stat-card">
          <p className="crm-stat-label">
            Donations
          </p>
          <p className="crm-stat-number">
            {campaign.donations?.length ?? 0}
          </p>
        </div>

      </div>


      <section className="crm-panel">

        <div className="crm-panel-header">
          <h3>Donations</h3>
        </div>

        {campaign.donations?.length ? (

          <div className="crm-association-list">

            {campaign.donations.map(
              (donation: any) => {

                const contact =
                  donation.contacts as any;

                const organization =
                  donation.organizations as any;

                const donor =
                  contact
                    ? `${contact.first_name} ${contact.last_name}`
                    : organization?.name || 'Unknown';

                return (
                  <div
                    key={donation.id}
                    className="crm-donation-history-item"
                  >

                    <div>
                      <strong>
                        {donor}
                      </strong>

                      <div className="crm-association-meta">
                        {donation.donation_date}
                        {' '}•{' '}
                        {donation.donation_type}
                      </div>
                    </div>

                    <div className="crm-donation-amount">
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
            No donations have been recorded for this campaign.
          </div>

        )}

      </section>

    </div>
  );
}
