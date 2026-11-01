import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

import OrganizationForm from '@/components/crm/organization-form';
import { requireCRMRole } from '@/lib/crm-permissions';

import {
  updateOrganization,
} from '../../actions/organization-actions';

export default async function EditOrganizationPage({
params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireCRMRole(['admin', 'officer']);

  const { id } = await params;

  const supabase = await createClient();

  const { data: organization } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single();

  if (!organization) {
    notFound();
  }

  const updateAction =
    updateOrganization.bind(null, id);

  return (
    <div>

      <div className="crm-record-breadcrumb">

        <Link href="/club/organizations">
          Organizations
        </Link>

        <span>/</span>

        <Link href={`/club/organizations/${id}`}>
          {organization.name}
        </Link>

        <span>/</span>

        <span>Edit</span>

      </div>


      <div className="crm-page-header">

        <h2 className="crm-page-title">
          Edit Organization
        </h2>

        <p className="crm-page-description">
          Update organization information and CRM details.
        </p>

      </div>


      <OrganizationForm
        action={updateAction}
        organization={organization}
        submitLabel="Save Changes"
      />

    </div>
  );
}