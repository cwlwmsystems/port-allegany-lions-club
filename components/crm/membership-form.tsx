type MembershipValues = {
  id?: string;
  contact_id?: string;
  member_number?: string | null;
  membership_status?: string | null;
  membership_type?: string | null;
  join_date?: string | null;
  end_date?: string | null;
  end_reason?: string | null;
  officer_role?: string | null;
  committee?: string | null;
  dues_status?: string | null;
  last_dues_payment_date?: string | null;
  notes?: string | null;
};

export default function MembershipForm({
  action,
  contactId,
  membership,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  contactId: string;
  membership?: MembershipValues;
  submitLabel: string;
}) {
  return (
    <form action={action} className="crm-form">

      <input
        type="hidden"
        name="contact_id"
        value={contactId}
      />

      <section className="crm-panel">

        <div className="crm-panel-header">
          <h3>Membership Information</h3>
        </div>

        <div className="crm-form-grid">

          <label className="crm-field">
            <span>Member Number</span>
            <input
              name="member_number"
              defaultValue={membership?.member_number || ''}
            />
          </label>

          <label className="crm-field">
            <span>Membership Status</span>
            <select
              name="membership_status"
              defaultValue={
                membership?.membership_status || 'active'
              }
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="former">Former</option>
              <option value="deceased">Deceased</option>
            </select>
          </label>

          <label className="crm-field">
            <span>Membership Type</span>
            <select
              name="membership_type"
              defaultValue={membership?.membership_type || ''}
            >
              <option value="">Select...</option>
              <option value="Regular">Regular</option>
              <option value="Family">Family</option>
              <option value="Student">Student</option>
              <option value="Life">Life</option>
              <option value="Associate">Associate</option>
              <option value="Affiliate">Affiliate</option>
              <option value="Honorary">Honorary</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label className="crm-field">
            <span>Join Date</span>
            <input
              type="date"
              name="join_date"
              defaultValue={membership?.join_date || ''}
            />
          </label>

        </div>

      </section>


      <section className="crm-panel">

        <div className="crm-panel-header">
          <h3>Club Role</h3>
        </div>

        <div className="crm-form-grid">

          <label className="crm-field">
            <span>Officer Role</span>
            <input
              name="officer_role"
              placeholder="President, Treasurer, Secretary..."
              defaultValue={membership?.officer_role || ''}
            />
          </label>

          <label className="crm-field">
            <span>Committee</span>
            <input
              name="committee"
              placeholder="Membership, Service, Fundraising..."
              defaultValue={membership?.committee || ''}
            />
          </label>

        </div>

      </section>


      <section className="crm-panel">

        <div className="crm-panel-header">
          <h3>Dues</h3>
        </div>

        <div className="crm-form-grid">

          <label className="crm-field">
            <span>Dues Status</span>
            <select
              name="dues_status"
              defaultValue={membership?.dues_status || 'current'}
            >
              <option value="current">Current</option>
              <option value="due">Due</option>
              <option value="overdue">Overdue</option>
              <option value="waived">Waived</option>
              <option value="not_applicable">Not Applicable</option>
            </select>
          </label>

          <label className="crm-field">
            <span>Last Dues Payment Date</span>
            <input
              type="date"
              name="last_dues_payment_date"
              defaultValue={
                membership?.last_dues_payment_date || ''
              }
            />
          </label>

        </div>

      </section>


      <section className="crm-panel">

        <div className="crm-panel-header">
          <h3>End of Membership</h3>
        </div>

        <div className="crm-form-grid">

          <label className="crm-field">
            <span>End Date</span>
            <input
              type="date"
              name="end_date"
              defaultValue={membership?.end_date || ''}
            />
          </label>

          <label className="crm-field">
            <span>Reason Ended</span>
            <input
              name="end_reason"
              defaultValue={membership?.end_reason || ''}
            />
          </label>

        </div>

      </section>


      <section className="crm-panel">

        <div className="crm-panel-header">
          <h3>Membership Notes</h3>
        </div>

        <div className="crm-form-grid">
          <label className="crm-field crm-field-wide">
            <span>Notes</span>
            <textarea
              name="notes"
              defaultValue={membership?.notes || ''}
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
