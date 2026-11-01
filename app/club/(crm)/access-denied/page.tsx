import Link from 'next/link';

export default function AccessDeniedPage() {
  return (
    <div className="crm-access-denied">

      <div className="crm-access-denied-card">

        <div className="crm-access-denied-code">
          403
        </div>

        <h2>
          Access Denied
        </h2>

        <p>
          Your Lions CRM role does not have
          permission to access or modify this area.
        </p>

        <div className="crm-access-denied-actions">

          <Link
            href="/club/dashboard"
            className="crm-button"
          >
            Return to Dashboard
          </Link>

        </div>

      </div>

    </div>
  );
}
