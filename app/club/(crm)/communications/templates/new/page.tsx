import Link from 'next/link';

import { requireCRMRole, type CRMRole } from '@/lib/crm-permissions';
import { COMMUNICATION_MERGE_FIELDS } from '@/lib/communications/merge-fields';

import { createCommunicationTemplate } from '../../actions/communication-actions';

const ROLES: CRMRole[] = [
  'admin',
  'officer',
  'membership_chair',
  'treasurer',
];

export default async function NewCommunicationTemplatePage() {
  await requireCRMRole(ROLES);

  return (
    <div className="crm-form-page">
      <div className="crm-page-header">
        <div>
          <h2 className="crm-page-title">
            New Communication Template
          </h2>

          <p className="crm-page-description">
            Create reusable personalized
            letter or email content.
          </p>
        </div>

        <Link
          href="/club/communications/templates"
          className="crm-button crm-button-secondary"
        >
          Back
        </Link>
      </div>

      <form
        action={
          createCommunicationTemplate
        }
        className="crm-form-card"
      >
        <div className="crm-form-grid">
          <label className="crm-field">
            <span>Template Name</span>

            <input
              name="name"
              required
            />
          </label>

          <label className="crm-field">
            <span>Type</span>

            <select
              name="template_type"
              required
            >
              <option value="letter">
                Letter
              </option>

              <option value="email">
                Email
              </option>
            </select>
          </label>

          <label className="crm-field crm-field-full">
            <span>
              Subject
              <small>
                {' '}
                — primarily used for email
              </small>
            </span>

            <input name="subject" />
          </label>

          <label className="crm-field crm-field-full">
            <span>Description</span>

            <input
              name="description"
            />
          </label>

          <label className="crm-field crm-field-full">
            <span>Template Body</span>

            <textarea
              name="body"
              required
              rows={16}
              placeholder={`Dear {{contact.first_name}},

Thank you for supporting the Port Allegany Lions Club.

{{custom.message}}

Sincerely,

Port Allegany Lions Club`}
            />
          </label>
        </div>

        <div className="crm-merge-field-panel">
          <strong>
            Available Merge Fields
          </strong>

          <div className="crm-merge-field-list">
            {COMMUNICATION_MERGE_FIELDS.map(
              (field) => (
                <code key={field}>
                  {field}
                </code>
              )
            )}
          </div>
        </div>

        <div className="crm-form-actions">
          <button
            type="submit"
            className="crm-button crm-button-primary"
          >
            Save Template
          </button>
        </div>
      </form>
    </div>
  );
}
