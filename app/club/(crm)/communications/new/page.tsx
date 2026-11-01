import Link from 'next/link';

import { createClient } from '@/lib/supabase/server';
import { requireCRMRole, type CRMRole } from '@/lib/crm-permissions';

import { createCommunication } from '../actions/communication-actions';

const ROLES: CRMRole[] = [
  'admin',
  'officer',
  'membership_chair',
  'treasurer',
];

export default async function NewCommunicationPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string;
    contact?: string;
    organization?: string;
  }>;
}) {
  await requireCRMRole(ROLES);

  const params =
    await searchParams;

  const type =
    params.type === 'email'
      ? 'email'
      : 'letter';

  const supabase =
    await createClient();

  const [
    contactsResult,
    organizationsResult,
    templatesResult,
  ] = await Promise.all([
    supabase
      .from('contacts')
      .select(
        'id, first_name, last_name, email'
      )
      .order('last_name'),

    supabase
      .from('organizations')
      .select('id, name, email')
      .order('name'),

    supabase
      .from('communication_templates')
      .select(
        'id, name, template_type, subject'
      )
      .eq(
        'template_type',
        type
      )
      .eq('is_active', true)
      .order('name'),
  ]);

  const contacts =
    contactsResult.data || [];

  const organizations =
    organizationsResult.data || [];

  const templates =
    templatesResult.data || [];

  return (
    <div className="crm-form-page">
      <div className="crm-page-header">
        <div>
          <h2 className="crm-page-title">
            Create{' '}
            {type === 'email'
              ? 'Email'
              : 'Letter'}
          </h2>

          <p className="crm-page-description">
            Select a recipient and template,
            add the personalized message, then
            generate the communication.
          </p>
        </div>

        <Link
          href="/club/communications"
          className="crm-button crm-button-secondary"
        >
          Back
        </Link>
      </div>

      <form
        action={createCommunication}
        className="crm-form-card"
      >
        <input
          type="hidden"
          name="communication_type"
          value={type}
        />

        <div className="crm-form-grid">
          <label className="crm-field">
            <span>Contact</span>

            <select
              name="contact_id"
              defaultValue={
                params.contact || ''
              }
            >
              <option value="">
                Select Contact
              </option>

              {contacts.map(
                (contact) => (
                  <option
                    key={contact.id}
                    value={contact.id}
                  >
                    {contact.first_name}{' '}
                    {contact.last_name}
                    {contact.email
                      ? ` — ${contact.email}`
                      : ''}
                  </option>
                )
              )}
            </select>
          </label>

          <label className="crm-field">
            <span>
              Organization
            </span>

            <select
              name="organization_id"
              defaultValue={
                params.organization || ''
              }
            >
              <option value="">
                No Organization
              </option>

              {organizations.map(
                (organization) => (
                  <option
                    key={
                      organization.id
                    }
                    value={
                      organization.id
                    }
                  >
                    {
                      organization.name
                    }
                  </option>
                )
              )}
            </select>
          </label>

          <label className="crm-field crm-field-full">
            <span>Template</span>

            <select name="template_id">
              <option value="">
                No Template / Custom
              </option>

              {templates.map(
                (template) => (
                  <option
                    key={template.id}
                    value={template.id}
                  >
                    {template.name}
                  </option>
                )
              )}
            </select>
          </label>

          {type === 'email' && (
            <label className="crm-field crm-field-full">
              <span>Custom Subject</span>

              <input
                name="subject"
                placeholder="Leave blank to use template subject"
              />
            </label>
          )}

          <label className="crm-field crm-field-full">
            <span>
              Personalized Message
            </span>

            <textarea
              name="custom_message"
              rows={8}
              placeholder="This replaces {{custom.message}} inside the selected template."
            />
          </label>

          <label className="crm-field crm-field-full">
            <span>
              Custom Body
            </span>

            <textarea
              name="custom_body"
              rows={14}
              placeholder="Use this when no template is selected."
            />
          </label>
        </div>

        <div className="crm-form-actions">
          <button
            type="submit"
            className="crm-button crm-button-primary"
          >
            {type === 'email'
              ? 'Create Email'
              : 'Generate Letter'}
          </button>
        </div>
      </form>
    </div>
  );
}
