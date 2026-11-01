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
