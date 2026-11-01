import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function DonationsPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string;
    payment?: string;
    campaign?: string;
  }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id, name')
    .order('name');

  let query = supabase
    .from('donations')
    .select(`
      id,
      donation_date,
      amount,
      donation_type,
      payment_method,
      anonymous,
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
    });

  if (params.type) {
    query = query.eq(
      'donation_type',
      params.type
    );
  }

  if (params.payment) {
    query = query.eq(
      'payment_method',
      params.payment
    );
  }

  if (params.campaign) {
    query = query.eq(
      'campaign_id',
      params.campaign
    );
  }

  const { data: donations, error } =
    await query;

  if (error) {
    return (
      <div className="crm-error">
        Unable to load donations: {error.message}
      </div>
    );
  }

  return (
    <div>

      <div className="crm-page-header crm-page-header-row">

        <div>
          <h2 className="crm-page-title">
            Donations
          </h2>

          <p className="crm-page-description">
            Track donations, sponsorships, grants,
            and other financial support.
          </p>
        </div>

        <Link
          href="/club/donations/new"
          className="crm-button"
        >
          + Add Donation
        </Link>

      </div>


      <form
        method="get"
        className="crm-search-filter-bar"
      >
        <select
          name="campaign"
          defaultValue={params.campaign || ''}
        >
          <option value="">All Campaigns</option>

          {campaigns?.map((campaign) => (
            <option
              key={campaign.id}
              value={campaign.id}
            >
              {campaign.name}
            </option>
          ))}
        </select>

        <select
          name="type"
          defaultValue={params.type || ''}
        >
          <option value="">
            All Donation Types
          </option>
          <option value="Monetary">
            Monetary
          </option>
          <option value="In-Kind">
            In-Kind
          </option>
          <option value="Sponsorship">
            Sponsorship
          </option>
          <option value="Grant">
            Grant
          </option>
          <option value="Other">
            Other
          </option>
        </select>

        <select
          name="payment"
          defaultValue={params.payment || ''}
        >
          <option value="">
            All Payment Methods
          </option>
          <option value="Cash">Cash</option>
          <option value="Check">Check</option>
          <option value="Credit Card">
            Credit Card
          </option>
          <option value="Online">
            Online
          </option>
          <option value="ACH">ACH</option>
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
          href="/club/donations"
          className="crm-filter-clear"
        >
          Clear
        </Link>
      </form>

      <div className="crm-result-count">
        {donations?.length ?? 0}
        {' '}
        donation
        {(donations?.length ?? 0) === 1
          ? ''
          : 's'}
      </div>

      <div className="crm-table-card">
        <table className="crm-table">

          <thead>
            <tr>
              <th>Date</th>
              <th>Donor</th>
              <th>Campaign</th>
              <th>Type</th>
              <th>Payment</th>
              <th>Amount</th>
              <th></th>
            </tr>
          </thead>

          <tbody>

            {donations?.map((donation: any) => {

              const contact =
                donation.contacts as any;

              const organization =
                donation.organizations as any;

              const campaign =
                donation.campaigns as any;

              const donorName =
                donation.anonymous
                  ? 'Anonymous'
                  : contact
                    ? `${contact.first_name} ${contact.last_name}`
                    : organization?.name || 'Unknown';

              return (
                <tr key={donation.id}>

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
                        `${donation.donation_date}T00:00:00`
                      )
                    )}
                  </td>

                  <td>
                    {contact && !donation.anonymous ? (
                      <Link
                        href={`/club/contacts/${contact.id}`}
                        className="crm-contact-name"
                      >
                        {donorName}
                      </Link>
                    ) : (
                      donorName
                    )}
                  </td>

                  <td>
                    {campaign?.name || '—'}
                  </td>

                  <td>
                    {donation.donation_type}
                  </td>

                  <td>
                    {donation.payment_method || '—'}
                  </td>

                  <td className="crm-money">
                    ${Number(donation.amount).toFixed(2)}
                  </td>

                  <td>
                    <Link
                      href={`/club/donations/${donation.id}/edit`}
                      className="crm-small-action"
                    >
                      Edit
                    </Link>
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
