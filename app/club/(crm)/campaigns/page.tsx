import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function CampaignsPage() {
  const supabase = await createClient();

  const { data: campaigns, error } = await supabase
    .from('campaigns')
    .select(`
      *,
      donations (
        id,
        amount
      )
    `)
    .order('name');

  if (error) {
    return (
      <div className="crm-error">
        Unable to load campaigns: {error.message}
      </div>
    );
  }

  return (
    <div>

      <div className="crm-page-header crm-page-header-row">

        <div>
          <h2 className="crm-page-title">
            Campaigns & Funds
          </h2>

          <p className="crm-page-description">
            Organize donations by fund,
            fundraiser, program, or project.
          </p>
        </div>

        <Link
          href="/club/campaigns/new"
          className="crm-button"
        >
          + Add Campaign
        </Link>

      </div>


      <div className="crm-table-card">
        <table className="crm-table">

          <thead>
            <tr>
              <th>Campaign</th>
              <th>Type</th>
              <th>Status</th>
              <th>Goal</th>
              <th>Raised</th>
              <th>Donations</th>
            </tr>
          </thead>

          <tbody>

            {campaigns?.map((campaign: any) => {

              const raised =
                campaign.donations?.reduce(
                  (
                    total: number,
                    donation: any
                  ) =>
                    total +
                    Number(donation.amount || 0),
                  0
                ) ?? 0;

              return (
                <tr key={campaign.id}>

                  <td>
                    <Link
                      href={`/club/campaigns/${campaign.id}`}
                      className="crm-contact-name"
                    >
                      {campaign.name}
                    </Link>
                  </td>

                  <td>
                    {campaign.campaign_type}
                  </td>

                  <td>
                    {campaign.status}
                  </td>

                  <td className="crm-money">
                    {campaign.goal_amount !== null
                      ? `$${Number(
                          campaign.goal_amount
                        ).toFixed(2)}`
                      : '—'}
                  </td>

                  <td className="crm-money">
                    ${raised.toFixed(2)}
                  </td>

                  <td>
                    {campaign.donations?.length ?? 0}
                  </td>

                </tr>
              );
            })}

          </tbody>
        </table>
      </div>

    </div>
  );
}
