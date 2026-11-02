'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Role =
  | 'admin'
  | 'officer'
  | 'treasurer'
  | 'membership_chair'
  | 'volunteer_coordinator'
  | 'viewer';

const items = [
  {
    href: '/club/dashboard',
    label: 'Dashboard',
  },
  {
    href: '/club/contacts',
    label: 'Contacts',
  },
  {
    href: '/club/members',
    label: 'Members',
  },
  {
    href: '/club/organizations',
    label: 'Organizations',
  },
  {
    href: '/club/community-partners',
    label: 'Community Partners',
  },
  {
    href: '/club/community-partner-inquiries',
    label: 'Partner Inquiries',
  },
  {
    href: '/club/events',
    label: 'Events',
  },
  {
    href: '/club/donations',
    label: 'Donations',
  },
  {
    href: '/club/campaigns',
    label: 'Campaigns',
  },
  {
    href: '/club/tasks',
    label: 'Tasks',
  },
  {
    href: '/club/communications',
    label: 'Communications',
  },
];

export default function SidebarNav({
  role,
}: {
  role: Role;
}) {
  const pathname = usePathname();

  return (
    <nav className="crm-nav">

      {items.map((item) => {

        const active =
          pathname === item.href ||
          pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              active
                ? 'crm-nav-link crm-nav-link-active'
                : 'crm-nav-link'
            }
          >
            {item.label}
          </Link>
        );
      })}

      {[
        'admin',
        'officer',
        'treasurer',
        'membership_chair',
      ].includes(role) && (
        <Link
          href="/club/data"
          className={
            pathname.startsWith('/club/data')
              ? 'crm-nav-link crm-nav-link-active'
              : 'crm-nav-link'
          }
        >
          Data Tools
        </Link>
      )}


      {role === 'admin' && (
        <>
          <div className="crm-nav-divider" />

          <Link
            href="/club/admin/users"
            className={
              pathname.startsWith(
                '/club/admin/users'
              )
                ? 'crm-nav-link crm-nav-link-active'
                : 'crm-nav-link'
            }
          >
            Users & Roles
          </Link>

          <Link
            href="/club/admin/audit"
            className={
              pathname.startsWith(
                '/club/admin/audit'
              )
                ? 'crm-nav-link crm-nav-link-active'
                : 'crm-nav-link'
            }
          >
            Audit Log
          </Link>
        </>
      )}

    </nav>
  );
}
