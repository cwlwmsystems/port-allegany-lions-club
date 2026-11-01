type Tag = {
  id: string;
  name: string;
};

type ContactFormValues = {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  mobile_phone?: string | null;
  address_line_1?: string | null;
  address_line_2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  preferred_contact_method?: string | null;
  status?: string | null;
  birthday?: string | null;
  occupation?: string | null;
  employer_name?: string | null;
  source?: string | null;
  general_notes?: string | null;
  do_not_contact?: boolean | null;
};

export default function ContactForm({
  action,
  tags,
  selectedTagIds = [],
  contact,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  tags: Tag[];
  selectedTagIds?: string[];
  contact?: ContactFormValues;
  submitLabel: string;
}) {
  return (
    <form action={action} className="crm-form">

      <section className="crm-panel">
        <div className="crm-panel-header">
          <h3>Basic Information</h3>
        </div>

        <div className="crm-form-grid">

          <label className="crm-field">
            <span>First Name *</span>
            <input
              name="first_name"
              required
              defaultValue={contact?.first_name || ''}
            />
          </label>

          <label className="crm-field">
            <span>Last Name *</span>
            <input
              name="last_name"
              required
              defaultValue={contact?.last_name || ''}
            />
          </label>

          <label className="crm-field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              defaultValue={contact?.email || ''}
            />
          </label>

          <label className="crm-field">
            <span>Mobile Phone</span>
            <input
              name="mobile_phone"
              defaultValue={contact?.mobile_phone || ''}
            />
          </label>

          <label className="crm-field">
            <span>Phone</span>
            <input
              name="phone"
              defaultValue={contact?.phone || ''}
            />
          </label>

          <label className="crm-field">
            <span>Preferred Contact Method</span>
            <select
              name="preferred_contact_method"
              defaultValue={contact?.preferred_contact_method || ''}
            >
              <option value="">Select...</option>
              <option value="Email">Email</option>
              <option value="Phone">Phone</option>
              <option value="Text">Text</option>
              <option value="Mail">Mail</option>
            </select>
          </label>

          <label className="crm-field">
            <span>Status</span>
            <select
              name="status"
              defaultValue={contact?.status || 'active'}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>

          <label className="crm-field">
            <span>Birthday</span>
            <input
              type="date"
              name="birthday"
              defaultValue={contact?.birthday || ''}
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
              defaultValue={contact?.address_line_1 || ''}
            />
          </label>

          <label className="crm-field crm-field-wide">
            <span>Address Line 2</span>
            <input
              name="address_line_2"
              defaultValue={contact?.address_line_2 || ''}
            />
          </label>

          <label className="crm-field">
            <span>City</span>
            <input
              name="city"
              defaultValue={contact?.city || ''}
            />
          </label>

          <label className="crm-field">
            <span>State</span>
            <input
              name="state"
              defaultValue={contact?.state || ''}
            />
          </label>

          <label className="crm-field">
            <span>ZIP Code</span>
            <input
              name="postal_code"
              defaultValue={contact?.postal_code || ''}
            />
          </label>

        </div>
      </section>


      <section className="crm-panel">
        <div className="crm-panel-header">
          <h3>Club & CRM Details</h3>
        </div>

        <div className="crm-form-grid">

          <label className="crm-field">
            <span>Occupation</span>
            <input
              name="occupation"
              defaultValue={contact?.occupation || ''}
            />
          </label>

          <label className="crm-field">
            <span>Employer</span>
            <input
              name="employer_name"
              defaultValue={contact?.employer_name || ''}
            />
          </label>

          <label className="crm-field">
            <span>Source</span>
            <select
              name="source"
              defaultValue={contact?.source || ''}
            >
              <option value="">Select...</option>
              <option value="Manual Entry">Manual Entry</option>
              <option value="Website">Website</option>
              <option value="Event">Event</option>
              <option value="Referral">Referral</option>
              <option value="Membership">Membership</option>
              <option value="Donation">Donation</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label className="crm-field crm-checkbox-field">
            <input
              type="checkbox"
              name="do_not_contact"
              defaultChecked={Boolean(contact?.do_not_contact)}
            />
            <span>Do Not Contact</span>
          </label>

          <label className="crm-field crm-field-wide">
            <span>General Notes</span>
            <textarea
              name="general_notes"
              defaultValue={contact?.general_notes || ''}
            />
          </label>

        </div>
      </section>


      <section className="crm-panel">
        <div className="crm-panel-header">
          <h3>Tags</h3>
        </div>

        <div className="crm-tag-selector">
          {tags.map((tag) => (
            <label
              key={tag.id}
              className="crm-tag-option"
            >
              <input
                type="checkbox"
                name="tag_ids"
                value={tag.id}
                defaultChecked={selectedTagIds.includes(tag.id)}
              />

              <span>{tag.name}</span>
            </label>
          ))}
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
