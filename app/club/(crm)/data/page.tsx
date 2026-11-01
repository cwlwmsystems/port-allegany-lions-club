import Link from 'next/link';

import {
  getCurrentCRMRole,
  requireCRMRole,
} from '@/lib/crm-permissions';

import {
  importContacts,
} from './actions/import-actions';


export default async function DataToolsPage({
  searchParams,
}: {
  searchParams: Promise<{
    imported?: string;
    skipped?: string;
    errors?: string;
  }>;
}) {
  await requireCRMRole([
    'admin',
    'officer',
    'membership_chair',
    'treasurer',
  ]);

  const params =
    await searchParams;

  const role =
    await getCurrentCRMRole();

  const canManageContacts =
    [
      'admin',
      'officer',
      'membership_chair',
    ].includes(role);

  const canManageFinance =
    [
      'admin',
      'officer',
      'treasurer',
    ].includes(role);

  const showResults =
    params.imported !== undefined ||
    params.skipped !== undefined ||
    params.errors !== undefined;


  return (
    <div>

      <div className="crm-page-header">

        <h2 className="crm-page-title">
          Data Tools
        </h2>

        <p className="crm-page-description">
          Import CRM records and export
          structured club data.
        </p>

      </div>


      {showResults && (

        <div className="crm-import-results">

          <div>
            <strong>
              {params.imported || '0'}
            </strong>
            <span>Imported</span>
          </div>

          <div>
            <strong>
              {params.skipped || '0'}
            </strong>
            <span>Duplicates Skipped</span>
          </div>

          <div>
            <strong>
              {params.errors || '0'}
            </strong>
            <span>Rows With Errors</span>
          </div>

        </div>

      )}


      <div className="crm-data-grid">


        <section className="crm-panel">

          <div className="crm-panel-header">
            <h3>Exports</h3>
          </div>

          <div className="crm-data-actions">

            {canManageContacts && (
              <>
                <Link
                  href="/club/exports/contacts"
                  className="crm-data-action"
                >
                  <strong>
                    Export Contacts
                  </strong>

                  <span>
                    Contact information and CRM fields
                  </span>
                </Link>


                <Link
                  href="/club/exports/members"
                  className="crm-data-action"
                >
                  <strong>
                    Export Members
                  </strong>

                  <span>
                    Membership, dues, officer,
                    and committee information
                  </span>
                </Link>
              </>
            )}


            {canManageFinance && (
              <Link
                href="/club/exports/donations"
                className="crm-data-action"
              >
                <strong>
                  Export Donations
                </strong>

                <span>
                  Donation history, campaigns,
                  payment methods, and donors
                </span>
              </Link>
            )}

          </div>

        </section>


        {canManageContacts && (

          <section className="crm-panel">

            <div className="crm-panel-header">
              <h3>Import Contacts</h3>
            </div>

            <div className="crm-import-panel">

              <p>
                Upload a CSV containing at least
                <strong> First Name</strong> and
                <strong> Last Name</strong>.
                Existing email addresses are skipped
                rather than overwritten.
              </p>


              <form
                action={importContacts}
                className="crm-import-form"
              >

                <label className="crm-file-field">

                  <span>
                    Contact CSV
                  </span>

                  <input
                    type="file"
                    name="file"
                    accept=".csv,text/csv"
                    required
                  />

                </label>


                <button
                  type="submit"
                  className="crm-button"
                >
                  Import Contacts
                </button>

              </form>


              <div className="crm-import-fields">

                <strong>
                  Recognized columns
                </strong>

                <p>
                  First Name, Last Name, Email,
                  Phone, Mobile Phone, Address,
                  Address Line 2, City, State,
                  Postal Code, Preferred Contact
                  Method, Occupation, Source,
                  Status, Notes.
                </p>

              </div>

            </div>

          </section>

        )}

      </div>

    </div>
  );
}
