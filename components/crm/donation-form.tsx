type SimpleRecord = {
  id: string;
  name?: string;
  first_name?: string;
  last_name?: string;
};

type Donation = {
  contact_id?: string | null;
  organization_id?: string | null;
  campaign_id?: string | null;
  donation_date?: string | null;
  amount?: number | null;
  donation_type?: string | null;
  payment_method?: string | null;
  receipt_number?: string | null;
  receipt_sent?: boolean | null;
  anonymous?: boolean | null;
  notes?: string | null;
};

export default function DonationForm({
  action,
  contacts,
  organizations,
  campaigns,
  donation,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  contacts: SimpleRecord[];
  organizations: SimpleRecord[];
  campaigns: SimpleRecord[];
  donation?: Donation;
  submitLabel: string;
}) {
  return (
    <form action={action} className="crm-form">

      <section className="crm-panel">
        <div className="crm-panel-header">
          <h3>Donation</h3>
        </div>

        <div className="crm-form-grid">

          <label className="crm-field">
            <span>Donation Date *</span>
            <input
              type="date"
              name="donation_date"
              required
              defaultValue={donation?.donation_date || ''}
            />
          </label>

          <label className="crm-field">
            <span>Amount *</span>
            <input
              type="number"
              name="amount"
              min="0"
              step="0.01"
              required
              defaultValue={donation?.amount ?? ''}
            />
          </label>

          <label className="crm-field">
            <span>Donation Type</span>
            <select
              name="donation_type"
              defaultValue={
                donation?.donation_type || 'Monetary'
              }
            >
              <option value="Monetary">Monetary</option>
              <option value="In-Kind">In-Kind</option>
              <option value="Sponsorship">Sponsorship</option>
              <option value="Grant">Grant</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label className="crm-field">
            <span>Payment Method</span>
            <select
              name="payment_method"
              defaultValue={donation?.payment_method || ''}
            >
              <option value="">Select...</option>
              <option value="Cash">Cash</option>
              <option value="Check">Check</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Online">Online</option>
              <option value="ACH">ACH</option>
              <option value="Other">Other</option>
            </select>
          </label>

        </div>
      </section>


      <section className="crm-panel">
        <div className="crm-panel-header">
          <h3>Donor</h3>
        </div>

        <div className="crm-form-grid">

          <label className="crm-field">
            <span>Contact</span>
            <select
              name="contact_id"
              defaultValue={donation?.contact_id || ''}
            >
              <option value="">No contact</option>

              {contacts.map((contact) => (
                <option
                  key={contact.id}
                  value={contact.id}
                >
                  {contact.first_name}{' '}
                  {contact.last_name}
                </option>
              ))}
            </select>
          </label>

          <label className="crm-field">
            <span>Organization</span>
            <select
              name="organization_id"
              defaultValue={
                donation?.organization_id || ''
              }
            >
              <option value="">No organization</option>

              {organizations.map((organization) => (
                <option
                  key={organization.id}
                  value={organization.id}
                >
                  {organization.name}
                </option>
              ))}
            </select>
          </label>

          <label className="crm-field crm-field-wide">
            <span>Campaign / Fund</span>
            <select
              name="campaign_id"
              defaultValue={donation?.campaign_id || ''}
            >
              <option value="">No campaign</option>

              {campaigns.map((campaign) => (
                <option
                  key={campaign.id}
                  value={campaign.id}
                >
                  {campaign.name}
                </option>
              ))}
            </select>
          </label>

        </div>
      </section>


      <section className="crm-panel">
        <div className="crm-panel-header">
          <h3>Receipt & Notes</h3>
        </div>

        <div className="crm-form-grid">

          <label className="crm-field">
            <span>Receipt Number</span>
            <input
              name="receipt_number"
              defaultValue={
                donation?.receipt_number || ''
              }
            />
          </label>

          <label className="crm-field crm-checkbox-field">
            <input
              type="checkbox"
              name="receipt_sent"
              defaultChecked={
                Boolean(donation?.receipt_sent)
              }
            />
            <span>Receipt Sent</span>
          </label>

          <label className="crm-field crm-checkbox-field">
            <input
              type="checkbox"
              name="anonymous"
              defaultChecked={
                Boolean(donation?.anonymous)
              }
            />
            <span>Anonymous Donation</span>
          </label>

          <label className="crm-field crm-field-wide">
            <span>Notes</span>
            <textarea
              name="notes"
              defaultValue={donation?.notes || ''}
            />
          </label>

        </div>
      </section>

      <div className="crm-form-actions">
        <button className="crm-button" type="submit">
          {submitLabel}
        </button>
      </div>

    </form>
  );
}
