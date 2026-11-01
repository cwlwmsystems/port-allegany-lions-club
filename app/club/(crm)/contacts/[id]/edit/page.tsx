import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ContactForm from '@/components/crm/contact-form';
import { updateContact } from '../../actions/contact-actions';
import { requireCRMRole } from '@/lib/crm-permissions';

export default async function EditContactPage({
params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireCRMRole(['admin', 'officer', 'membership_chair']);

  const { id } = await params;

  const supabase = await createClient();

  const { data: contact } = await supabase
    .from('contacts')
    .select(`
      *,
      contact_tags (
        tag_id
      )
    `)
    .eq('id', id)
    .single();

  if (!contact) {
    notFound();
  }

  const { data: tags } = await supabase
    .from('tags')
    .select('id, name')
    .order('name');

  const selectedTagIds =
    contact.contact_tags?.map(
      (relationship: any) => relationship.tag_id
    ) ?? [];

  const updateAction = updateContact.bind(null, id);

  return (
    <div>

      <div className="crm-record-breadcrumb">
        <Link href="/club/contacts">
          Contacts
        </Link>

        <span>/</span>

        <Link href={`/club/contacts/${id}`}>
          {contact.first_name} {contact.last_name}
        </Link>

        <span>/</span>

        <span>Edit</span>
      </div>

      <div className="crm-page-header">
        <h2 className="crm-page-title">
          Edit Contact
        </h2>

        <p className="crm-page-description">
          Update contact information, CRM details, and classifications.
        </p>
      </div>

      <ContactForm
        action={updateAction}
        tags={tags ?? []}
        selectedTagIds={selectedTagIds}
        contact={contact}
        submitLabel="Save Changes"
      />

    </div>
  );
}