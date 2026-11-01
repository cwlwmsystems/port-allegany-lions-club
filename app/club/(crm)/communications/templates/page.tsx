import Link from 'next/link';

import { createClient } from '@/lib/supabase/server';
import { requireCRMRole, type CRMRole } from '@/lib/crm-permissions';

const ROLES: CRMRole[] = [
  'admin',
  'officer',
  'membership_chair',
  'treasurer',
];

export default async function CommunicationTemplatesPage() {
  await requireCRMRole(ROLES);

  const supabase =
    await createClient();

  const { data: templates } =
    await supabase
      .from('communication_templates')
      .select('*')
      .order('name');

  return (
    <div>
      <div className="crm-page-header">
        <div>
          <h2 className="crm-page-title">
            Communication Templates
          </h2>

          <p className="crm-page-description">
            Reusable letter and email
            content with CRM merge fields.
          </p>
        </div>

        <Link
          href="/club/communications/templates/new"
          className="crm-button crm-button-primary"
        >
          New Template
        </Link>
      </div>

      <div className="crm-table-card">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Subject</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {templates?.map(
              (template) => (
                <tr key={template.id}>
                  <td>
                    <strong>
                      {template.name}
                    </strong>

                    {template.description && (
                      <div className="crm-table-subtext">
                        {
                          template.description
                        }
                      </div>
                    )}
                  </td>

                  <td>
                    {template.template_type ===
                    'email'
                      ? 'Email'
                      : 'Letter'}
                  </td>

                  <td>
                    {template.subject ||
                      '—'}
                  </td>

                  <td>
                    {template.is_active
                      ? 'Active'
                      : 'Inactive'}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
