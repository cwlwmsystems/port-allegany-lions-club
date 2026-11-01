type Contact = {
  id: string;
  first_name: string;
  last_name: string;
};

type EventValues = {
  name?: string | null;
  event_type?: string | null;
  event_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  location?: string | null;
  description?: string | null;
  status?: string | null;
  volunteer_goal?: number | null;
  coordinator_contact_id?: string | null;
};

export default function EventForm({
  action,
  contacts,
  event,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  contacts: Contact[];
  event?: EventValues;
  submitLabel: string;
}) {
  return (
    <form action={action} className="crm-form">

      <section className="crm-panel">
        <div className="crm-panel-header">
          <h3>Event Information</h3>
        </div>

        <div className="crm-form-grid">

          <label className="crm-field crm-field-wide">
            <span>Event Name *</span>
            <input
              name="name"
              required
              defaultValue={event?.name || ''}
            />
          </label>

          <label className="crm-field">
            <span>Event Type</span>
            <select
              name="event_type"
              defaultValue={event?.event_type || 'Service Project'}
            >
              <option value="Service Project">Service Project</option>
              <option value="Fundraiser">Fundraiser</option>
              <option value="Club Meeting">Club Meeting</option>
              <option value="Community Event">Community Event</option>
              <option value="Membership Event">Membership Event</option>
              <option value="Social Event">Social Event</option>
              <option value="Youth Program">Youth Program</option>
              <option value="District Event">Lions District Event</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label className="crm-field">
            <span>Status</span>
            <select
              name="status"
              defaultValue={event?.status || 'planned'}
            >
              <option value="planned">Planned</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>

          <label className="crm-field">
            <span>Event Date *</span>
            <input
              type="date"
              name="event_date"
              required
              defaultValue={event?.event_date || ''}
            />
          </label>

          <label className="crm-field">
            <span>Volunteer Goal</span>
            <input
              type="number"
              min="0"
              name="volunteer_goal"
              defaultValue={event?.volunteer_goal ?? ''}
            />
          </label>

          <label className="crm-field">
            <span>Start Time</span>
            <input
              type="time"
              name="start_time"
              defaultValue={event?.start_time || ''}
            />
          </label>

          <label className="crm-field">
            <span>End Time</span>
            <input
              type="time"
              name="end_time"
              defaultValue={event?.end_time || ''}
            />
          </label>

          <label className="crm-field crm-field-wide">
            <span>Location</span>
            <input
              name="location"
              defaultValue={event?.location || ''}
            />
          </label>

          <label className="crm-field crm-field-wide">
            <span>Coordinator</span>
            <select
              name="coordinator_contact_id"
              defaultValue={event?.coordinator_contact_id || ''}
            >
              <option value="">No coordinator selected</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.first_name} {contact.last_name}
                </option>
              ))}
            </select>
          </label>

          <label className="crm-field crm-field-wide">
            <span>Description</span>
            <textarea
              name="description"
              defaultValue={event?.description || ''}
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
