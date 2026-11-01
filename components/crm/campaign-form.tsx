type Campaign = {
  name?: string | null;
  campaign_type?: string | null;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  goal_amount?: number | null;
  status?: string | null;
};

export default function CampaignForm({
  action,
  campaign,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  campaign?: Campaign;
  submitLabel: string;
}) {
  return (
    <form action={action} className="crm-form">

      <section className="crm-panel">
        <div className="crm-panel-header">
          <h3>Campaign Information</h3>
        </div>

        <div className="crm-form-grid">

          <label className="crm-field crm-field-wide">
            <span>Campaign Name *</span>
            <input
              name="name"
              required
              defaultValue={campaign?.name || ''}
            />
          </label>

          <label className="crm-field">
            <span>Type</span>
            <select
              name="campaign_type"
              defaultValue={
                campaign?.campaign_type ||
                'General Fund'
              }
            >
              <option value="General Fund">
                General Fund
              </option>
              <option value="Community Projects">
                Community Projects
              </option>
              <option value="Christmas Program">
                Christmas Program
              </option>
              <option value="Scholarship Fund">
                Scholarship Fund
              </option>
              <option value="Eyeglass Assistance">
                Eyeglass Assistance
              </option>
              <option value="Fundraiser">
                Fundraiser
              </option>
              <option value="Special Project">
                Special Project
              </option>
              <option value="Other">
                Other
              </option>
            </select>
          </label>

          <label className="crm-field">
            <span>Status</span>
            <select
              name="status"
              defaultValue={campaign?.status || 'active'}
            >
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>

          <label className="crm-field">
            <span>Start Date</span>
            <input
              type="date"
              name="start_date"
              defaultValue={campaign?.start_date || ''}
            />
          </label>

          <label className="crm-field">
            <span>End Date</span>
            <input
              type="date"
              name="end_date"
              defaultValue={campaign?.end_date || ''}
            />
          </label>

          <label className="crm-field">
            <span>Goal Amount</span>
            <input
              type="number"
              step="0.01"
              min="0"
              name="goal_amount"
              defaultValue={campaign?.goal_amount ?? ''}
            />
          </label>

          <label className="crm-field crm-field-wide">
            <span>Description</span>
            <textarea
              name="description"
              defaultValue={
                campaign?.description || ''
              }
            />
          </label>

        </div>
      </section>

      <div className="crm-form-actions">
        <button type="submit" className="crm-button">
          {submitLabel}
        </button>
      </div>

    </form>
  );
}
