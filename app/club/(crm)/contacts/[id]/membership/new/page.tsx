import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import MembershipForm from '@/components/crm/membership-form';
import { createMembership } from '../../../../members/actions/membership-actions';
import { requireCRMRole } from '@/lib/crm-permissions';

export default async function NewMembershipPage({
params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireCRMRole(['admin', 'officer', 'membership_chair']);

  const { id } = await params;

  const supabase = await createClient();

  const { data: contact } = await supabase
    .from('contacts')
    .select('id, first_name, last_name')
    .eq('id', id)
    .single();

  if (!contact) {
    notFound();
  }

  return (
    <div>

      <div className="crm-record-breadcrumb">
        <Link href="/club/contacts">
          Contacts
        </Link>

        <span>/</span>

        <Link href={`/club/contacts/${contact.id}`}>
          {contact.first_name} {contact.last_name}
        </Link>

        <span>/</span>

        <span>Add Membership</span>
      </div>


      <div className="crm-page-header">

        <h2 className="crm-page-title">
          Add Membership
        </h2>

        <p className="crm-page-description">
          Create a Lions Club membership record for{' '}
          {contact.first_name} {contact.last_name}.
        </p>

      </div>


      <MembershipForm
        action={createMembership}
        contactId={contact.id}
        submitLabel="Create Membership"
      />

    </div>
  );
}