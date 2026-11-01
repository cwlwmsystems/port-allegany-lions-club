import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import MembershipForm from '@/components/crm/membership-form';
import { updateMembership } from '../../actions/membership-actions';
import { requireCRMRole } from '@/lib/crm-permissions';

export default async function EditMembershipPage({
params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireCRMRole(['admin', 'officer', 'membership_chair']);

  const { id } = await params;

  const supabase = await createClient();

  const { data: membership } = await supabase
    .from('memberships')
    .select(`
      *,
      contacts (
        id,
        first_name,
        last_name
      )
    `)
    .eq('id', id)
    .single();

  if (!membership) {
    notFound();
  }

  const contact = membership.contacts;

  const updateAction =
    updateMembership.bind(null, membership.id);

  return (
    <div>

      <div className="crm-record-breadcrumb">

        <Link href="/club/members">
          Members
        </Link>

        <span>/</span>

        <Link href={`/club/contacts/${contact.id}`}>
          {contact.first_name} {contact.last_name}
        </Link>

        <span>/</span>

        <span>Edit Membership</span>

      </div>


      <div className="crm-page-header">

        <h2 className="crm-page-title">
          Edit Membership
        </h2>

        <p className="crm-page-description">
          Update membership details for{' '}
          {contact.first_name} {contact.last_name}.
        </p>

      </div>


      <MembershipForm
        action={updateAction}
        contactId={contact.id}
        membership={membership}
        submitLabel="Save Membership"
      />

    </div>
  );
}