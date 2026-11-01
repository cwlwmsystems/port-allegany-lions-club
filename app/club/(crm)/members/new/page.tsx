import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createMembership } from '../actions/membership-actions';
import { requireCRMRole } from '@/lib/crm-permissions';

export default async function NewMembershipPage() {
  await requireCRMRole(['admin', 'officer', 'membership_chair']);

const supabase = await createClient();

  const { data: contacts, error } = await supabase
    .from('contacts')
    .select(`
      id,
      first_name,
      last_name,
      email,
      memberships (
        id,
        membership_status
      )
    `)
    .order('last_name')
    .order('first_name');

  if (error) {
    return (
      <div className="crm-error">
        Unable to load contacts: {error.message}
      </div>
    );
  }

  const availableContacts =
    contacts?.filter((contact: any) => {
      const memberships = contact.memberships ?? [];

      return !memberships.some(
        (membership: any) =>
          membership.membership_status === 'active'
      );
    }) ?? [];

  return (
    <div>

      <div className="crm-record-breadcrumb">
        <Link href="/club/members">
          Members
        </Link>

        <span>/</span>

        <span>Add Membership</span>
      </div>

      <div className="crm-page-header">
        <h2 className="crm-page-title">
          Add Membership
        </h2>

        <p className="crm-page-description">
          Create a Lions Club membership for an existing CRM contact.
        </p>
      </div>

      <form
        action={createMembership}
        className="crm-form"
      >

        <section className="crm-panel">

          <div className="crm-panel-header">
            <h3>Member</h3>
          </div>

          <div className="crm-form-grid">

            <label className="crm-field crm-field-wide">
              <span>Contact *</span>

              <select
                name="contact_id"
                required
                defaultValue=""
              >
                <option value="">
                  Select contact...
                </option>

                {availableContacts.map((contact: any) => (
                  <option
                    key={contact.id}
                    value={contact.id}
                  >
                    {contact.first_name} {contact.last_name}
                    {contact.email
                      ? ` — ${contact.email}`
                      : ''}
                  </option>
                ))}
              </select>

            </label>

          </div>

        </section>


        <section className="crm-panel">

          <div className="crm-panel-header">
            <h3>Membership Information</h3>
          </div>

          <div className="crm-form-grid">

            <label className="crm-field">
              <span>Member Number</span>
              <input name="member_number" />
            </label>

            <label className="crm-field">
              <span>Membership Status</span>

              <select
                name="membership_status"
                defaultValue="active"
              >
                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>

                <option value="former">
                  Former
                </option>

                <option value="deceased">
                  Deceased
                </option>
              </select>

            </label>


            <label className="crm-field">
              <span>Membership Type</span>

              <select
                name="membership_type"
                defaultValue=""
              >
                <option value="">
                  Select...
                </option>

                <option value="Regular">
                  Regular
                </option>

                <option value="Family">
                  Family
                </option>

                <option value="Student">
                  Student
                </option>

                <option value="Life">
                  Life
                </option>

                <option value="Associate">
                  Associate
                </option>

                <option value="Affiliate">
                  Affiliate
                </option>

                <option value="Honorary">
                  Honorary
                </option>

                <option value="Other">
                  Other
                </option>
              </select>

            </label>


            <label className="crm-field">
              <span>Join Date</span>
              <input
                type="date"
                name="join_date"
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
              />
            </label>

            <label className="crm-field">
              <span>Committee</span>

              <input
                name="committee"
                placeholder="Membership, Service, Fundraising..."
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
                defaultValue="current"
              >
                <option value="current">
                  Current
                </option>

                <option value="due">
                  Due
                </option>

                <option value="overdue">
                  Overdue
                </option>

                <option value="waived">
                  Waived
                </option>

                <option value="not_applicable">
                  Not Applicable
                </option>
              </select>

            </label>

            <label className="crm-field">
              <span>Last Dues Payment Date</span>

              <input
                type="date"
                name="last_dues_payment_date"
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
              <textarea name="notes" />
            </label>

          </div>

        </section>


        <div className="crm-form-actions">
          <button
            type="submit"
            className="crm-button"
          >
            Create Membership
          </button>
        </div>

      </form>

    </div>
  );
}