type OrganizationValues = {
  name?: string | null;
  organization_type?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address_line_1?: string | null;
  address_line_2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  notes?: string | null;

  community_partner_status?: string | null;
  community_partner_support_types?: string[] | null;
  community_partner_since?: string | null;
  community_partner_end_date?: string | null;
  community_partner_public?: boolean | null;
  community_partner_public_description?: string | null;
  community_partner_logo_url?: string | null;
  facebook_url?: string | null;
  community_partner_last_contacted?: string | null;
  community_partner_next_follow_up?: string | null;
  community_partner_notes?: string | null;
};

export default function OrganizationForm({
  action,
  organization,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  organization?: OrganizationValues;
  submitLabel: string;
}) {
  return (
    <form action={action} className="crm-form">

      <section className="crm-panel">
        <div className="crm-panel-header">
          <h3>Organization Information</h3>
        </div>

        <div className="crm-form-grid">

          <label className="crm-field crm-field-wide">
            <span>Organization Name *</span>

            <input
              name="name"
              required
              defaultValue={organization?.name || ''}
            />
          </label>

          <label className="crm-field">
            <span>Organization Type</span>

            <select
              name="organization_type"
              defaultValue={organization?.organization_type || ''}
            >
              <option value="">Select...</option>
              <option value="Business">Business</option>
              <option value="School">School</option>
              <option value="Nonprofit">Nonprofit</option>
              <option value="Government">Government</option>
              <option value="Church">Church</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Community Organization">
                Community Organization
              </option>
              <option value="Vendor">Vendor</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label className="crm-field">
            <span>Website</span>

            <input
              name="website"
              type="url"
              placeholder="https://..."
              defaultValue={organization?.website || ''}
            />
          </label>

          <label className="crm-field">
            <span>Email</span>

            <input
              name="email"
              type="email"
              defaultValue={organization?.email || ''}
            />
          </label>

          <label className="crm-field">
            <span>Phone</span>

            <input
              name="phone"
              defaultValue={organization?.phone || ''}
            />
          </label>

        </div>
      </section>


      <section className="crm-panel">

        <div className="crm-panel-header">
          <h3>Address</h3>
        </div>

        <div className="crm-form-grid">

          <label className="crm-field crm-field-wide">
            <span>Address Line 1</span>

            <input
              name="address_line_1"
              defaultValue={organization?.address_line_1 || ''}
            />
          </label>

          <label className="crm-field crm-field-wide">
            <span>Address Line 2</span>

            <input
              name="address_line_2"
              defaultValue={organization?.address_line_2 || ''}
            />
          </label>

          <label className="crm-field">
            <span>City</span>

            <input
              name="city"
              defaultValue={organization?.city || ''}
            />
          </label>

          <label className="crm-field">
            <span>State</span>

            <input
              name="state"
              defaultValue={organization?.state || ''}
            />
          </label>

          <label className="crm-field">
            <span>ZIP Code</span>

            <input
              name="postal_code"
              defaultValue={organization?.postal_code || ''}
            />
          </label>

        </div>

      </section>


      <section className="crm-panel">

        <div className="crm-panel-header">
          <h3>Community Partner</h3>
        </div>

        <div className="crm-form-grid">

          <label className="crm-field">
            <span>Partner Status</span>

            <select
              name="community_partner_status"
              defaultValue={
                organization?.community_partner_status ||
                'not_prospect'
              }
            >
              <option value="not_prospect">
                Not a Prospect
              </option>
              <option value="prospect">
                Prospect
              </option>
              <option value="contacted">
                Contacted
              </option>
              <option value="interested">
                Interested
              </option>
              <option value="follow_up_later">
                Follow Up Later
              </option>
              <option value="active">
                Active Partner
              </option>
              <option value="inactive">
                Inactive
              </option>
              <option value="not_interested">
                Not Interested
              </option>
            </select>
          </label>

          <label className="crm-field">
            <span>Facebook URL</span>

            <input
              name="facebook_url"
              type="url"
              placeholder="https://facebook.com/..."
              defaultValue={organization?.facebook_url || ''}
            />
          </label>

          <label className="crm-field">
            <span>Last Contacted</span>

            <input
              name="community_partner_last_contacted"
              type="date"
              defaultValue={
                organization?.community_partner_last_contacted || ''
              }
            />
          </label>

          <label className="crm-field">
            <span>Next Follow-up</span>

            <input
              name="community_partner_next_follow_up"
              type="date"
              defaultValue={
                organization?.community_partner_next_follow_up || ''
              }
            />
          </label>

          <label className="crm-field">
            <span>Partner Since</span>

            <input
              name="community_partner_since"
              type="date"
              defaultValue={
                organization?.community_partner_since || ''
              }
            />
          </label>

          <label className="crm-field">
            <span>Partner End Date</span>

            <input
              name="community_partner_end_date"
              type="date"
              defaultValue={
                organization?.community_partner_end_date || ''
              }
            />
          </label>

          <div className="crm-field crm-field-wide">
            <span>Support Types</span>

            <div className="crm-checkbox-grid">

              {[
                'Donation',
                'Sponsorship',
                'Volunteer Support',
                'Event Support',
                'Project Support',
                'Collection Location',
                'In-Kind Donation',
                'Meeting Participation',
              ].map((supportType) => (
                <label
                  key={supportType}
                  className="crm-checkbox-option"
                >
                  <input
                    type="checkbox"
                    name="community_partner_support_types"
                    value={supportType}
                    defaultChecked={
                      organization?.community_partner_support_types
                        ?.includes(supportType) || false
                    }
                  />

                  <span>{supportType}</span>
                </label>
              ))}

            </div>
          </div>

          <label className="crm-field crm-field-wide">
            <span>Public Partner Description</span>

            <textarea
              name="community_partner_public_description"
              rows={4}
              placeholder="Short public-facing description for the Community Partners page."
              defaultValue={
                organization?.community_partner_public_description || ''
              }
            />
          </label>

          <label className="crm-field crm-field-wide">
            <span>Logo URL</span>

            <input
              name="community_partner_logo_url"
              type="url"
              placeholder="https://..."
              defaultValue={
                organization?.community_partner_logo_url || ''
              }
            />
          </label>

          <label className="crm-checkbox-option crm-field-wide">
            <input
              type="checkbox"
              name="community_partner_public"
              defaultChecked={
                organization?.community_partner_public || false
              }
            />

            <span>
              Show this organization on the public Community Partners page
            </span>
          </label>

          <label className="crm-field crm-field-wide">
            <span>Partner / Outreach Notes</span>

            <textarea
              name="community_partner_notes"
              rows={5}
              placeholder="Outreach notes, interests, follow-up details, sponsorship conversations, etc."
              defaultValue={
                organization?.community_partner_notes || ''
              }
            />
          </label>

        </div>

      </section>


      <section className="crm-panel">

        <div className="crm-panel-header">
          <h3>Internal Notes</h3>
        </div>

        <div className="crm-form-grid">

          <label className="crm-field crm-field-wide">
            <span>Notes</span>

            <textarea
              name="notes"
              defaultValue={organization?.notes || ''}
            />
          </label>

        </div>

      </section>


      <div className="crm-form-actions">

        <button
          type="submit"
          className="crm-button"
        >
          {submitLabel}
        </button>

      </div>

    </form>
  );
}
