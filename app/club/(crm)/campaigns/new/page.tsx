import Link from 'next/link';
import CampaignForm from '@/components/crm/campaign-form';
import { createCampaign } from '../actions/campaign-actions';
import { requireCRMRole } from '@/lib/crm-permissions';

export default async function NewCampaignPage() {
  await requireCRMRole(['admin', 'officer', 'treasurer']);

return (
    <div>

      <div className="crm-record-breadcrumb">
        <Link href="/club/campaigns">
          Campaigns
        </Link>
        <span>/</span>
        <span>New Campaign</span>
      </div>

      <div className="crm-page-header">
        <h2 className="crm-page-title">
          Add Campaign
        </h2>
      </div>

      <CampaignForm
        action={createCampaign}
        submitLabel="Create Campaign"
      />

    </div>
  );
}