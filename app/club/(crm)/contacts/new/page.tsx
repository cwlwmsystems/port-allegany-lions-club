import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import ContactForm from '@/components/crm/contact-form';
import { createContact } from '../actions/contact-actions';
import { requireCRMRole } from '@/lib/crm-permissions';

export default async function NewContactPage() {
  await requireCRMRole(['admin', 'officer', 'membership_chair']);

const supabase = await createClient();

  const { data: tags } = await supabase
    .from('tags')
    .select('id, name')
    .order('name');

  return (
    <div>

      <div className="crm-record-breadcrumb">
        <Link href="/club/contacts">
          Contacts
        </Link>

        <span>/</span>

        <span>New Contact</span>
      </div>

      <div className="crm-page-header">
        <h2 className="crm-page-title">
          Add Contact
        </h2>

        <p className="crm-page-description">
          Create a new person record in the Lions Club CRM.
        </p>
      </div>

      <ContactForm
        action={createContact}
        tags={tags ?? []}
        submitLabel="Create Contact"
      />

    </div>
  );
}