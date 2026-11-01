import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import DonationForm from '@/components/crm/donation-form';
import { createDonation } from '../actions/donation-actions';
import { requireCRMRole } from '@/lib/crm-permissions';

export default async function NewDonationPage({
searchParams,
}: {
  searchParams: Promise<{
    contact?: string;
    organization?: string;
    campaign?: string;
  }>;
}) {
  await requireCRMRole(['admin', 'officer', 'treasurer']);

  const params = await searchParams;

  const supabase = await createClient();

  const [
    contactsResult,
    organizationsResult,
    campaignsResult,
  ] = await Promise.all([

    supabase
      .from('contacts')
      .select(
        'id, first_name, last_name'
      )
      .order('last_name'),

    supabase
      .from('organizations')
      .select('id, name')
      .order('name'),

    supabase
      .from('campaigns')
      .select('id, name')
      .eq('status', 'active')
      .order('name'),

  ]);

  return (
    <div>

      <div className="crm-record-breadcrumb">

        <Link href="/club/donations">
          Donations
        </Link>

        <span>/</span>

        <span>
          New Donation
        </span>

      </div>


      <div className="crm-page-header">

        <h2 className="crm-page-title">
          Add Donation
        </h2>

        <p className="crm-page-description">
          Record a donation,
          sponsorship, grant,
          or in-kind contribution.
        </p>

      </div>


      <DonationForm
        action={createDonation}
        contacts={
          contactsResult.data ?? []
        }
        organizations={
          organizationsResult.data ?? []
        }
        campaigns={
          campaignsResult.data ?? []
        }
        donation={{
          contact_id:
            params.contact || null,
          organization_id:
            params.organization || null,
          campaign_id:
            params.campaign || null,
        }}
        submitLabel="Create Donation"
      />

    </div>
  );
}