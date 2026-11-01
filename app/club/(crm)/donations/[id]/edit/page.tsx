import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DonationForm from '@/components/crm/donation-form';
import { updateDonation } from '../../actions/donation-actions';
import { requireCRMRole } from '@/lib/crm-permissions';

export default async function EditDonationPage({
params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireCRMRole(['admin', 'officer', 'treasurer']);

  const { id } = await params;

  const supabase = await createClient();

  const [
    donationResult,
    contactsResult,
    organizationsResult,
    campaignsResult,
  ] = await Promise.all([
    supabase
      .from('donations')
      .select('*')
      .eq('id', id)
      .single(),

    supabase
      .from('contacts')
      .select('id, first_name, last_name')
      .order('last_name'),

    supabase
      .from('organizations')
      .select('id, name')
      .order('name'),

    supabase
      .from('campaigns')
      .select('id, name')
      .order('name'),
  ]);

  const donation =
    donationResult.data;

  if (!donation) {
    notFound();
  }

  const updateAction =
    updateDonation.bind(null, id);

  return (
    <div>

      <div className="crm-record-breadcrumb">
        <Link href="/club/donations">
          Donations
        </Link>
        <span>/</span>
        <span>Edit Donation</span>
      </div>

      <div className="crm-page-header">
        <h2 className="crm-page-title">
          Edit Donation
        </h2>
      </div>

      <DonationForm
        action={updateAction}
        contacts={contactsResult.data ?? []}
        organizations={
          organizationsResult.data ?? []
        }
        campaigns={campaignsResult.data ?? []}
        donation={donation}
        submitLabel="Save Donation"
      />

    </div>
  );
}