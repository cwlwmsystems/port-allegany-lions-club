import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CampaignForm from '@/components/crm/campaign-form';
import { updateCampaign } from '../../actions/campaign-actions';
import { requireCRMRole } from '@/lib/crm-permissions';

export default async function EditCampaignPage({
params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireCRMRole(['admin', 'officer', 'treasurer']);

  const { id } = await params;

  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single();

  if (!campaign) {
    notFound();
  }

  const updateAction =
    updateCampaign.bind(null, id);

  return (
    <div>

      <div className="crm-record-breadcrumb">
        <Link href="/club/campaigns">
          Campaigns
        </Link>

        <span>/</span>

        <Link href={`/club/campaigns/${id}`}>
          {campaign.name}
        </Link>

        <span>/</span>

        <span>Edit</span>
      </div>

      <div className="crm-page-header">
        <h2 className="crm-page-title">
          Edit Campaign
        </h2>
      </div>

      <CampaignForm
        action={updateAction}
        campaign={campaign}
        submitLabel="Save Campaign"
      />

    </div>
  );
}