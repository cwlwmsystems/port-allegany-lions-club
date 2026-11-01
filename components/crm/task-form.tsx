type Contact = {
  id: string;
  first_name: string;
  last_name: string;
};

type Organization = {
  id: string;
  name: string;
};

type Task = {
  title?: string | null;
  description?: string | null;
  contact_id?: string | null;
  organization_id?: string | null;
  due_date?: string | null;
  priority?: string | null;
  status?: string | null;
};

export default function TaskForm({
  action,
  contacts,
  organizations,
  task,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  contacts: Contact[];
  organizations: Organization[];
  task?: Task;
  submitLabel: string;
}) {
  return (
    <form action={action} className="crm-form">

      <section className="crm-panel">

        <div className="crm-panel-header">
          <h3>Task Information</h3>
        </div>

        <div className="crm-form-grid">

          <label className="crm-field crm-field-wide">
            <span>Task *</span>

            <input
              name="title"
              required
              defaultValue={task?.title || ''}
              placeholder="Follow up about membership..."
            />
          </label>

          <label className="crm-field">
            <span>Due Date</span>

            <input
              type="date"
              name="due_date"
              defaultValue={task?.due_date || ''}
            />
          </label>

          <label className="crm-field">
            <span>Priority</span>

            <select
              name="priority"
              defaultValue={task?.priority || 'normal'}
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </label>

          <label className="crm-field">
            <span>Status</span>

            <select
              name="status"
              defaultValue={task?.status || 'open'}
            >
              <option value="open">Open</option>
              <option value="in_progress">
                In Progress
              </option>
              <option value="completed">
                Completed
              </option>
              <option value="cancelled">
                Cancelled
              </option>
            </select>
          </label>

          <label className="crm-field">
            <span>Contact</span>

            <select
              name="contact_id"
              defaultValue={task?.contact_id || ''}
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
              defaultValue={task?.organization_id || ''}
            >
              <option value="">
                No organization
              </option>

              {organizations.map(
                (organization) => (
                  <option
                    key={organization.id}
                    value={organization.id}
                  >
                    {organization.name}
                  </option>
                )
              )}
            </select>
          </label>

          <label className="crm-field crm-field-wide">
            <span>Description / Notes</span>

            <textarea
              name="description"
              defaultValue={task?.description || ''}
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
