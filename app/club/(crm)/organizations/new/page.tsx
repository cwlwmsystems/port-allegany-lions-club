import Link from 'next/link';
import OrganizationForm from '@/components/crm/organization-form';
import { createOrganization } from '../actions/organization-actions';
import { requireCRMRole } from '@/lib/crm-permissions';

export default async function NewOrganizationPage() {
  await requireCRMRole(['admin', 'officer']);

return (
    <div>

      <div className="crm-record-breadcrumb">
        <Link href="/club/organizations">
          Organizations
        </Link>

        <span>/</span>

        <span>New Organization</span>
      </div>

      <div className="crm-page-header">
        <h2 className="crm-page-title">
          Add Organization
        </h2>

        <p className="crm-page-description">
          Create a business, nonprofit, school, sponsor,
          or community organization record.
        </p>
      </div>

      <OrganizationForm
        action={createOrganization}
        submitLabel="Create Organization"
      />

    </div>
  );
}