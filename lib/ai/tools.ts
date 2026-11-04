import { tool } from 'ai';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysISO(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function subtractDaysISO(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

function daysOld(value: string | null) {
  if (!value) {
    return null;
  }

  const created = new Date(value).getTime();
  const now = Date.now();

  if (Number.isNaN(created)) {
    return null;
  }

  return Math.max(
    0,
    Math.floor(
      (now - created) /
        (1000 * 60 * 60 * 24)
    )
  );
}

async function getCurrentRole() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      role: null,
    };
  }

  const { data: profile } = await supabase
    .from('crm_user_profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  return {
    user,
    role: profile?.role ?? 'viewer',
  };
}

export const lionsAiTools = {
  searchContacts: tool({
    description:
      'Search CRM contacts by first name, last name, email, mobile phone, or phone number.',

    inputSchema: z.object({
      query: z
        .string()
        .min(1)
        .max(100),

      status: z
        .enum(['active', 'inactive'])
        .optional(),
    }),

    execute: async ({
      query,
      status,
    }: {
      query: string;
      status?: 'active' | 'inactive';
    }) => {
      const supabase = await createClient();

      const safeQuery =
        query.trim().replace(/[%(),]/g, '');

      let dbQuery = supabase
        .from('contacts')
        .select(`
          id,
          first_name,
          last_name,
          email,
          mobile_phone,
          phone,
          status,
          do_not_contact,
          contact_tags (
            tag_id,
            tags (
              id,
              name
            )
          ),
          contact_organizations (
            organizations (
              id,
              name
            )
          )
        `)
        .or(
          [
            `first_name.ilike.%${safeQuery}%`,
            `last_name.ilike.%${safeQuery}%`,
            `email.ilike.%${safeQuery}%`,
            `mobile_phone.ilike.%${safeQuery}%`,
            `phone.ilike.%${safeQuery}%`,
          ].join(',')
        )
        .order('last_name')
        .order('first_name')
        .limit(25);

      if (status) {
        dbQuery =
          dbQuery.eq('status', status);
      }

      const {
        data,
        error,
      } = await dbQuery;

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        count: data?.length ?? 0,

        contacts:
          data?.map((contact: any) => ({
            id: contact.id,

            name: [
              contact.first_name,
              contact.last_name,
            ]
              .filter(Boolean)
              .join(' '),

            email: contact.email,
            mobilePhone: contact.mobile_phone,
            phone: contact.phone,
            status: contact.status,
            doNotContact: contact.do_not_contact,

            tags:
              contact.contact_tags
                ?.map(
                  (relationship: any) =>
                    relationship.tags?.name
                )
                .filter(Boolean) ?? [],

            organizations:
              contact.contact_organizations
                ?.map(
                  (relationship: any) =>
                    relationship
                      .organizations?.name
                )
                .filter(Boolean) ?? [],
          })) ?? [],
      };
    },
  }),

  getMembers: tool({
    description:
      'Get Lions Club memberships, optionally filtered by membership status or dues status.',

    inputSchema: z.object({
      membershipStatus: z
        .enum([
          'active',
          'inactive',
          'former',
          'deceased',
        ])
        .optional(),

      duesStatus: z
        .enum([
          'current',
          'due',
          'overdue',
          'waived',
          'not_applicable',
        ])
        .optional(),

      limit: z
        .number()
        .int()
        .min(1)
        .max(100)
        .default(50),
    }),

    execute: async ({
      membershipStatus,
      duesStatus,
      limit,
    }: {
      membershipStatus?:
        | 'active'
        | 'inactive'
        | 'former'
        | 'deceased';

      duesStatus?:
        | 'current'
        | 'due'
        | 'overdue'
        | 'waived'
        | 'not_applicable';

      limit: number;
    }) => {
      const supabase = await createClient();

      let dbQuery = supabase
        .from('memberships')
        .select(`
          id,
          member_number,
          membership_status,
          membership_type,
          join_date,
          officer_role,
          committee,
          dues_status,
          contacts (
            id,
            first_name,
            last_name,
            email,
            mobile_phone
          )
        `)
        .order(
          'join_date',
          {
            ascending: false,
          }
        )
        .limit(limit);

      if (membershipStatus) {
        dbQuery = dbQuery.eq(
          'membership_status',
          membershipStatus
        );
      }

      if (duesStatus) {
        dbQuery = dbQuery.eq(
          'dues_status',
          duesStatus
        );
      }

      const {
        data,
        error,
      } = await dbQuery;

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        count: data?.length ?? 0,

        memberships:
          data?.map((membership: any) => ({
            id: membership.id,
            memberNumber:
              membership.member_number,

            membershipStatus:
              membership.membership_status,

            membershipType:
              membership.membership_type,

            joinDate:
              membership.join_date,

            officerRole:
              membership.officer_role,

            committee:
              membership.committee,

            duesStatus:
              membership.dues_status,

            contact:
              membership.contacts
                ? {
                    id:
                      membership.contacts.id,

                    name: [
                      membership.contacts
                        .first_name,

                      membership.contacts
                        .last_name,
                    ]
                      .filter(Boolean)
                      .join(' '),

                    email:
                      membership.contacts
                        .email,

                    mobilePhone:
                      membership.contacts
                        .mobile_phone,
                  }
                : null,
          })) ?? [],
      };
    },
  }),

  getUpcomingEvents: tool({
    description:
      'Get upcoming Lions Club events within a specified number of days.',

    inputSchema: z.object({
      days: z
        .number()
        .int()
        .min(1)
        .max(365)
        .default(30),
    }),

    execute: async ({
      days,
    }: {
      days: number;
    }) => {
      const supabase = await createClient();

      const startDate = todayISO();
      const endDate = addDaysISO(days);

      const {
        data,
        error,
      } = await supabase
        .from('events')
        .select(`
          id,
          name,
          event_type,
          event_date,
          location,
          status,
          event_participants (
            id,
            volunteer_hours
          )
        `)
        .gte(
          'event_date',
          startDate
        )
        .lte(
          'event_date',
          endDate
        )
        .neq(
          'status',
          'cancelled'
        )
        .order(
          'event_date',
          {
            ascending: true,
          }
        )
        .limit(100);

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,

        range: {
          startDate,
          endDate,
        },

        count:
          data?.length ?? 0,

        events:
          data?.map((event: any) => ({
            id: event.id,
            name: event.name,
            type: event.event_type,
            date: event.event_date,
            location: event.location,
            status: event.status,

            participantCount:
              event.event_participants
                ?.length ?? 0,

            volunteerHours:
              event.event_participants
                ?.reduce(
                  (
                    total: number,
                    participant: any
                  ) =>
                    total +
                    Number(
                      participant
                        .volunteer_hours ||
                        0
                    ),
                  0
                ) ?? 0,
          })) ?? [],
      };
    },
  }),

  searchOrganizations: tool({
    description:
      'Search Lions CRM organizations such as businesses, schools, nonprofits, sponsors, and community organizations.',

    inputSchema: z.object({
      query: z
        .string()
        .min(1)
        .max(100),
    }),

    execute: async ({
      query,
    }: {
      query: string;
    }) => {
      const supabase = await createClient();

      const safeQuery =
        query.trim().replace(/[%(),]/g, '');

      const {
        data,
        error,
      } = await supabase
        .from('organizations')
        .select(`
          id,
          name,
          organization_type,
          phone,
          website,
          city,
          state,
          contact_organizations (
            id
          )
        `)
        .ilike(
          'name',
          `%${safeQuery}%`
        )
        .order('name')
        .limit(25);

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: true,
        count:
          data?.length ?? 0,

        organizations:
          data?.map(
            (organization: any) => ({
              id: organization.id,
              name: organization.name,

              type:
                organization
                  .organization_type,

              phone:
                organization.phone,

              website:
                organization.website,

              city:
                organization.city,

              state:
                organization.state,

              contactCount:
                organization
                  .contact_organizations
                  ?.length ?? 0,
            })
          ) ?? [],
      };
    },
  }),

  getRecentDonations: tool({
    description:
      'Get recent Lions Club donations and sponsorships from the CRM.',

    inputSchema: z.object({
      days: z
        .number()
        .int()
        .min(1)
        .max(3650)
        .default(90),

      limit: z
        .number()
        .int()
        .min(1)
        .max(100)
        .default(25),
    }),

    execute: async ({
      days,
      limit,
    }: {
      days: number;
      limit: number;
    }) => {
      const supabase = await createClient();

      const startDate =
        subtractDaysISO(days);

      const {
        data,
        error,
      } = await supabase
        .from('donations')
        .select(`
          id,
          donation_date,
          amount,
          donation_type,
          payment_method,
          anonymous,
          contacts (
            id,
            first_name,
            last_name
          ),
          organizations (
            id,
            name
          ),
          campaigns (
            id,
            name
          )
        `)
        .gte(
          'donation_date',
          startDate
        )
        .order(
          'donation_date',
          {
            ascending: false,
          }
        )
        .limit(limit);

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      const donations =
        data?.map(
          (donation: any) => {
            const contact =
              donation.contacts;

            const organization =
              donation.organizations;

            const campaign =
              donation.campaigns;

            let donor =
              'Anonymous';

            if (
              !donation.anonymous
            ) {
              if (
                organization?.name
              ) {
                donor =
                  organization.name;
              } else if (contact) {
                donor = [
                  contact.first_name,
                  contact.last_name,
                ]
                  .filter(Boolean)
                  .join(' ');
              } else {
                donor =
                  'Unknown donor';
              }
            }

            return {
              id: donation.id,

              date:
                donation
                  .donation_date,

              amount:
                Number(
                  donation.amount || 0
                ),

              type:
                donation
                  .donation_type,

              paymentMethod:
                donation
                  .payment_method,

              anonymous:
                donation.anonymous,

              donor,

              campaign:
                campaign?.name ??
                null,
            };
          }
        ) ?? [];

      return {
        success: true,
        startDate,
        count: donations.length,

        totalAmount:
          donations.reduce(
            (
              total: number,
              donation: any
            ) =>
              total +
              donation.amount,
            0
          ),

        donations,
      };
    },
  }),

  getOpenTasks: tool({
    description:
      'Get open and in-progress CRM tasks, including overdue status, due dates, priority, contacts, and organizations.',

    inputSchema: z.object({
      priority: z
        .enum([
          'urgent',
          'high',
          'normal',
          'low',
        ])
        .optional(),

      overdueOnly: z
        .boolean()
        .default(false),

      limit: z
        .number()
        .int()
        .min(1)
        .max(100)
        .default(50),
    }),

    execute: async ({
      priority,
      overdueOnly,
      limit,
    }: {
      priority?:
        | 'urgent'
        | 'high'
        | 'normal'
        | 'low';

      overdueOnly: boolean;
      limit: number;
    }) => {
      const supabase =
        await createClient();

      const today =
        todayISO();

      let query =
        supabase
          .from('tasks')
          .select(`
            id,
            title,
            description,
            due_date,
            priority,
            status,
            contacts (
              id,
              first_name,
              last_name
            ),
            organizations (
              id,
              name
            )
          `)
          .in(
            'status',
            [
              'open',
              'in_progress',
            ]
          )
          .order(
            'due_date',
            {
              ascending: true,
              nullsFirst: false,
            }
          )
          .limit(limit);

      if (priority) {
        query =
          query.eq(
            'priority',
            priority
          );
      }

      if (overdueOnly) {
        query =
          query.lt(
            'due_date',
            today
          );
      }

      const {
        data,
        error,
      } = await query;

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      const tasks =
        data?.map((task: any) => {
          const overdue =
            Boolean(
              task.due_date &&
                task.due_date <
                  today
            );

          const contact =
            task.contacts;

          const organization =
            task.organizations;

          return {
            id: task.id,
            title: task.title,

            description:
              task.description,

            dueDate:
              task.due_date,

            priority:
              task.priority,

            status:
              task.status,

            overdue,

            relatedContact:
              contact
                ? {
                    id: contact.id,

                    name: [
                      contact.first_name,
                      contact.last_name,
                    ]
                      .filter(Boolean)
                      .join(' '),
                  }
                : null,

            relatedOrganization:
              organization
                ? {
                    id:
                      organization.id,

                    name:
                      organization.name,
                  }
                : null,
          };
        }) ?? [];

      return {
        success: true,
        generatedForDate: today,
        count: tasks.length,

        overdueCount:
          tasks.filter(
            (task) =>
              task.overdue
          ).length,

        tasks,
      };
    },
  }),

  getPartnerInquiries: tool({
    description:
      'Get Community Partner inquiries that need review. Access is limited by the CRM to admin and officer roles.',

    inputSchema: z.object({
      status: z
        .enum([
          'new',
          'reviewing',
          'converted',
          'declined',
          'open',
          'all',
        ])
        .default('open'),

      limit: z
        .number()
        .int()
        .min(1)
        .max(100)
        .default(50),
    }),

    execute: async ({
      status,
      limit,
    }: {
      status:
        | 'new'
        | 'reviewing'
        | 'converted'
        | 'declined'
        | 'open'
        | 'all';

      limit: number;
    }) => {
      const {
        role,
      } =
        await getCurrentRole();

      if (
        role !== 'admin' &&
        role !== 'officer'
      ) {
        return {
          success: false,
          accessDenied: true,

          message:
            'Community Partner inquiries are restricted to admin and officer roles.',
        };
      }

      const supabase =
        await createClient();

      let query =
        supabase
          .from(
            'community_partner_inquiries'
          )
          .select(`
            id,
            business_name,
            first_name,
            last_name,
            email,
            phone,
            website,
            support_interests,
            message,
            status,
            source,
            created_at,
            reviewed_at
          `)
          .order(
            'created_at',
            {
              ascending: false,
            }
          )
          .limit(limit);

      if (status === 'open') {
        query =
          query.in(
            'status',
            [
              'new',
              'reviewing',
            ]
          );
      } else if (
        status !== 'all'
      ) {
        query =
          query.eq(
            'status',
            status
          );
      }

      const {
        data,
        error,
      } = await query;

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      const inquiries =
        data?.map(
          (inquiry: any) => ({
            id: inquiry.id,

            businessName:
              inquiry.business_name,

            contactName: [
              inquiry.first_name,
              inquiry.last_name,
            ]
              .filter(Boolean)
              .join(' '),

            email:
              inquiry.email,

            phone:
              inquiry.phone,

            website:
              inquiry.website,

            supportInterests:
              inquiry
                .support_interests ??
              [],

            message:
              inquiry.message,

            status:
              inquiry.status,

            source:
              inquiry.source,

            createdAt:
              inquiry.created_at,

            reviewedAt:
              inquiry.reviewed_at,

            ageDays:
              daysOld(
                inquiry.created_at
              ),
          })
        ) ?? [];

      return {
        success: true,
        count:
          inquiries.length,

        newCount:
          inquiries.filter(
            (item) =>
              item.status === 'new'
          ).length,

        reviewingCount:
          inquiries.filter(
            (item) =>
              item.status ===
              'reviewing'
          ).length,

        inquiries,
      };
    },
  }),

  getContactRecord: tool({
    description:
      'Get a detailed CRM summary for one contact record by record ID. Use this when the current page is a contact or the user asks about this contact.',

    inputSchema: z.object({
      recordId: z.string().min(1),
    }),

    execute: async ({
      recordId,
    }: {
      recordId: string;
    }) => {
      const supabase =
        await createClient();

      const {
        data: contact,
        error,
      } = await supabase
        .from('contacts')
        .select(`
          id,
          first_name,
          last_name,
          email,
          phone,
          mobile_phone,
          address_line_1,
          address_line_2,
          city,
          state,
          postal_code,
          preferred_contact_method,
          status,
          birthday,
          occupation,
          employer_name,
          source,
          general_notes,
          do_not_contact,
          created_at,

          contact_tags (
            id,
            tags (
              id,
              name
            )
          ),

          contact_organizations (
            id,
            relationship_type,
            job_title,
            is_primary,
            organizations (
              id,
              name,
              organization_type
            )
          ),

          contact_notes (
            id,
            note,
            created_at
          ),

          memberships (
            id,
            member_number,
            membership_status,
            membership_type,
            join_date,
            end_date,
            end_reason,
            officer_role,
            committee,
            dues_status,
            last_dues_payment_date,
            notes
          ),

          event_participants (
            id,
            participant_role,
            attendance_status,
            volunteer_hours,
            notes,
            events (
              id,
              name,
              event_type,
              event_date,
              location,
              status
            )
          ),

          donations (
            id,
            donation_date,
            amount,
            donation_type,
            payment_method,
            receipt_sent,
            anonymous,
            notes,
            campaigns (
              id,
              name
            )
          )
        `)
        .eq('id', recordId)
        .single();

      if (error || !contact) {
        return {
          success: false,
          error:
            error?.message ||
            'Contact record not found.',
        };
      }

      const {
        data: tasks,
        error: taskError,
      } = await supabase
        .from('tasks')
        .select(`
          id,
          title,
          description,
          due_date,
          priority,
          status
        `)
        .eq('contact_id', recordId)
        .in(
          'status',
          ['open', 'in_progress']
        )
        .order(
          'due_date',
          {
            ascending: true,
            nullsFirst: false,
          }
        );

      const participations =
        (contact.event_participants as any[]) ??
        [];

      const attended =
        participations
          .filter(
            (item: any) =>
              item.attendance_status ===
              'attended'
          )
          .sort(
            (a: any, b: any) =>
              (
                b.events?.event_date ||
                ''
              ).localeCompare(
                a.events?.event_date ||
                ''
              )
          );

      const volunteerHours =
        attended.reduce(
          (
            total: number,
            item: any
          ) =>
            total +
            Number(
              item.volunteer_hours || 0
            ),
          0
        );

      const donations =
        [
          ...(
            (contact.donations as any[]) ??
            []
          ),
        ].sort(
          (a: any, b: any) =>
            (
              b.donation_date || ''
            ).localeCompare(
              a.donation_date || ''
            )
        );

      const lifetimeGiving =
        donations.reduce(
          (
            total: number,
            donation: any
          ) =>
            total +
            Number(
              donation.amount || 0
            ),
          0
        );

      const memberships =
        [
          ...(
            (contact.memberships as any[]) ??
            []
          ),
        ].sort(
          (a: any, b: any) =>
            (
              b.join_date || ''
            ).localeCompare(
              a.join_date || ''
            )
        );

      const currentMembership =
        memberships.find(
          (membership: any) =>
            membership.membership_status ===
            'active'
        ) ??
        memberships[0] ??
        null;

      return {
        success: true,

        contact: {
          name: [
            contact.first_name,
            contact.last_name,
          ]
            .filter(Boolean)
            .join(' '),

          email:
            contact.email,

          phone:
            contact.phone,

          mobilePhone:
            contact.mobile_phone,

          preferredContactMethod:
            contact.preferred_contact_method,

          status:
            contact.status,

          occupation:
            contact.occupation,

          employerName:
            contact.employer_name,

          source:
            contact.source,

          generalNotes:
            contact.general_notes,

          doNotContact:
            contact.do_not_contact,

          address: [
            contact.address_line_1,
            contact.address_line_2,
            contact.city,
            contact.state,
            contact.postal_code,
          ]
            .filter(Boolean)
            .join(', '),

          tags:
            contact.contact_tags
              ?.map(
                (item: any) =>
                  item.tags?.name
              )
              .filter(Boolean) ??
            [],

          organizations:
            contact.contact_organizations
              ?.map(
                (item: any) => ({
                  name:
                    item.organizations
                      ?.name,

                  type:
                    item.organizations
                      ?.organization_type,

                  relationshipType:
                    item.relationship_type,

                  jobTitle:
                    item.job_title,

                  primary:
                    item.is_primary,
                })
              )
              .filter(
                (item: any) =>
                  item.name
              ) ?? [],

          membership:
            currentMembership
              ? {
                  status:
                    currentMembership
                      .membership_status,

                  type:
                    currentMembership
                      .membership_type,

                  memberNumber:
                    currentMembership
                      .member_number,

                  joinDate:
                    currentMembership
                      .join_date,

                  officerRole:
                    currentMembership
                      .officer_role,

                  committee:
                    currentMembership
                      .committee,

                  duesStatus:
                    currentMembership
                      .dues_status,

                  lastDuesPaymentDate:
                    currentMembership
                      .last_dues_payment_date,
                }
              : null,

          volunteerHistory: {
            attendedEvents:
              attended.length,

            lifetimeHours:
              volunteerHours,

            lastVolunteerDate:
              attended[0]
                ?.events
                ?.event_date ??
              null,

            recentEvents:
              attended
                .slice(0, 5)
                .map(
                  (item: any) => ({
                    name:
                      item.events
                        ?.name,

                    date:
                      item.events
                        ?.event_date,

                    role:
                      item.participant_role,

                    hours:
                      Number(
                        item.volunteer_hours ||
                          0
                      ),
                  })
                ),
          },

          giving: {
            donationCount:
              donations.length,

            lifetimeGiving,

            lastDonationDate:
              donations[0]
                ?.donation_date ??
              null,

            recentDonations:
              donations
                .slice(0, 5)
                .map(
                  (donation: any) => ({
                    date:
                      donation
                        .donation_date,

                    amount:
                      Number(
                        donation.amount ||
                          0
                      ),

                    type:
                      donation
                        .donation_type,

                    campaign:
                      donation
                        .campaigns
                        ?.name ??
                      null,
                  })
                ),
          },

          notes:
            (
              contact.contact_notes as any[]
            )
              ?.sort(
                (
                  a: any,
                  b: any
                ) =>
                  (
                    b.created_at ||
                    ''
                  ).localeCompare(
                    a.created_at ||
                    ''
                  )
              )
              .slice(0, 5)
              .map(
                (note: any) => ({
                  note:
                    note.note,

                  createdAt:
                    note.created_at,
                })
              ) ?? [],

          openTasks:
            taskError
              ? []
              : (
                  tasks ?? []
                ).map(
                  (task: any) => ({
                    title:
                      task.title,

                    dueDate:
                      task.due_date,

                    priority:
                      task.priority,

                    status:
                      task.status,
                  })
                ),
        },
      };
    },
  }),

  getOrganizationRecord: tool({
    description:
      'Get a detailed CRM summary for one organization record by record ID. Use this when the current page is an organization or the user asks about this organization.',

    inputSchema: z.object({
      recordId: z.string().min(1),
    }),

    execute: async ({
      recordId,
    }: {
      recordId: string;
    }) => {
      const supabase =
        await createClient();

      const {
        data: organization,
        error,
      } = await supabase
        .from('organizations')
        .select(`
          id,
          name,
          organization_type,
          phone,
          email,
          website,
          address_line_1,
          address_line_2,
          city,
          state,
          postal_code,

          community_partner_status,
          community_partner_public,
          community_partner_since,
          community_partner_last_contacted,
          community_partner_next_follow_up,
          community_partner_support_types,
          community_partner_public_description,
          community_partner_notes,

          contact_organizations (
            id,
            relationship_type,
            job_title,
            is_primary,
            contacts (
              id,
              first_name,
              last_name,
              email,
              mobile_phone
            )
          )
        `)
        .eq('id', recordId)
        .single();

      if (error || !organization) {
        return {
          success: false,
          error:
            error?.message ||
            'Organization record not found.',
        };
      }

      const [
        donationResult,
        taskResult,
        outreachResult,
      ] =
        await Promise.all([
          supabase
            .from('donations')
            .select(`
              id,
              donation_date,
              amount,
              donation_type,
              campaigns (
                id,
                name
              )
            `)
            .eq(
              'organization_id',
              recordId
            )
            .order(
              'donation_date',
              {
                ascending: false,
              }
            )
            .limit(50),

          supabase
            .from('tasks')
            .select(`
              id,
              title,
              due_date,
              priority,
              status
            `)
            .eq(
              'organization_id',
              recordId
            )
            .in(
              'status',
              [
                'open',
                'in_progress',
              ]
            )
            .order(
              'due_date',
              {
                ascending: true,
                nullsFirst: false,
              }
            ),

          supabase
            .from(
              'community_partner_outreach'
            )
            .select(`
              id,
              outreach_type,
              outcome,
              notes,
              contacted_at,
              next_follow_up
            `)
            .eq(
              'organization_id',
              recordId
            )
            .order(
              'contacted_at',
              {
                ascending: false,
              }
            )
            .limit(20),
        ]);

      const donations =
        donationResult.data ?? [];

      return {
        success: true,

        organization: {
          name:
            organization.name,

          type:
            organization.organization_type,

          phone:
            organization.phone,

          email:
            organization.email,

          website:
            organization.website,

          address: [
            organization.address_line_1,
            organization.address_line_2,
            organization.city,
            organization.state,
            organization.postal_code,
          ]
            .filter(Boolean)
            .join(', '),

          contacts:
            organization
              .contact_organizations
              ?.map(
                (item: any) => ({
                  name: [
                    item.contacts
                      ?.first_name,

                    item.contacts
                      ?.last_name,
                  ]
                    .filter(Boolean)
                    .join(' '),

                  email:
                    item.contacts
                      ?.email,

                  mobilePhone:
                    item.contacts
                      ?.mobile_phone,

                  relationshipType:
                    item.relationship_type,

                  jobTitle:
                    item.job_title,

                  primary:
                    item.is_primary,
                })
              )
              .filter(
                (item: any) =>
                  item.name
              ) ?? [],

          communityPartner: {
            status:
              organization
                .community_partner_status,

            public:
              organization
                .community_partner_public,

            since:
              organization
                .community_partner_since,

            lastContacted:
              organization
                .community_partner_last_contacted,

            nextFollowUp:
              organization
                .community_partner_next_follow_up,

            supportTypes:
              organization
                .community_partner_support_types ??
              [],

            publicDescription:
              organization
                .community_partner_public_description,

            notes:
              organization
                .community_partner_notes,
          },

          giving: {
            donationCount:
              donations.length,

            lifetimeGiving:
              donations.reduce(
                (
                  total: number,
                  donation: any
                ) =>
                  total +
                  Number(
                    donation.amount ||
                      0
                  ),
                0
              ),

            recentDonations:
              donations
                .slice(0, 5)
                .map(
                  (donation: any) => ({
                    date:
                      donation
                        .donation_date,

                    amount:
                      Number(
                        donation.amount ||
                          0
                      ),

                    type:
                      donation
                        .donation_type,

                    campaign:
                      donation
                        .campaigns
                        ?.name ??
                      null,
                  })
                ),
          },

          openTasks:
            (
              taskResult.data ?? []
            ).map(
              (task: any) => ({
                title:
                  task.title,

                dueDate:
                  task.due_date,

                priority:
                  task.priority,

                status:
                  task.status,
              })
            ),

          recentOutreach:
            (
              outreachResult.data ??
              []
            ).map(
              (item: any) => ({
                type:
                  item.outreach_type,

                outcome:
                  item.outcome,

                contactedAt:
                  item.contacted_at,

                nextFollowUp:
                  item.next_follow_up,

                notes:
                  item.notes,
              })
            ),
        },
      };
    },
  }),

  getEventRecord: tool({
    description:
      'Get a detailed CRM summary for one event record by record ID. Use this when the current page is an event or the user asks about this event.',

    inputSchema: z.object({
      recordId: z.string().min(1),
    }),

    execute: async ({
      recordId,
    }: {
      recordId: string;
    }) => {
      const supabase =
        await createClient();

      const {
        data: event,
        error,
      } = await supabase
        .from('events')
        .select(`
          id,
          name,
          event_type,
          event_date,
          location,
          status,
          start_time,
          end_time,
          description,
          volunteer_goal,

          coordinator:contacts!events_coordinator_contact_id_fkey (
            id,
            first_name,
            last_name
          ),

          event_participants (
            id,
            participant_role,
            attendance_status,
            volunteer_hours,
            notes,
            contacts (
              id,
              first_name,
              last_name,
              email
            )
          )
        `)
        .eq('id', recordId)
        .single();

      if (error || !event) {
        return {
          success: false,
          error:
            error?.message ||
            'Event record not found.',
        };
      }

      const participants =
        (
          event.event_participants as any[]
        ) ?? [];

      const attended =
        participants.filter(
          (participant: any) =>
            participant.attendance_status ===
            'attended'
        );

      const volunteerHours =
        participants.reduce(
          (
            total: number,
            participant: any
          ) =>
            total +
            Number(
              participant.volunteer_hours ||
                0
            ),
          0
        );

      const coordinator: any =
        event.coordinator;

      return {
        success: true,

        event: {
          name:
            event.name,

          type:
            event.event_type,

          date:
            event.event_date,

          location:
            event.location,

          status:
            event.status,

          startTime:
            event.start_time,

          endTime:
            event.end_time,

          description:
            event.description,

          volunteerGoal:
            event.volunteer_goal,

          coordinator:
            coordinator
              ? [
                  coordinator.first_name,
                  coordinator.last_name,
                ]
                  .filter(Boolean)
                  .join(' ')
              : null,

          participantCount:
            participants.length,

          attendedCount:
            attended.length,

          volunteerHours,

          participants:
            participants.map(
              (participant: any) => ({
                name: [
                  participant.contacts
                    ?.first_name,

                  participant.contacts
                    ?.last_name,
                ]
                  .filter(Boolean)
                  .join(' '),

                role:
                  participant.participant_role,

                attendance:
                  participant.attendance_status,

                hours:
                  Number(
                    participant.volunteer_hours ||
                      0
                  ),

                notes:
                  participant.notes,
              })
            ),
        },
      };
    },
  }),

  getMembershipRecord: tool({
    description:
      'Get one membership record and its associated contact. Use this when the current page is a membership record.',

    inputSchema: z.object({
      recordId: z.string().min(1),
    }),

    execute: async ({
      recordId,
    }: {
      recordId: string;
    }) => {
      const supabase =
        await createClient();

      const {
        data: membership,
        error,
      } = await supabase
        .from('memberships')
        .select(`
          id,
          member_number,
          membership_status,
          membership_type,
          join_date,
          end_date,
          end_reason,
          officer_role,
          committee,
          dues_status,
          last_dues_payment_date,
          notes,

          contacts (
            id,
            first_name,
            last_name,
            email,
            mobile_phone
          )
        `)
        .eq(
          'id',
          recordId
        )
        .single();

      if (
        error ||
        !membership
      ) {
        return {
          success: false,

          error:
            error?.message ||
            'Membership record not found.',
        };
      }

      const contact: any =
        membership.contacts;

      return {
        success: true,

        membership: {
          memberNumber:
            membership.member_number,

          status:
            membership.membership_status,

          type:
            membership.membership_type,

          joinDate:
            membership.join_date,

          endDate:
            membership.end_date,

          endReason:
            membership.end_reason,

          officerRole:
            membership.officer_role,

          committee:
            membership.committee,

          duesStatus:
            membership.dues_status,

          lastDuesPaymentDate:
            membership.last_dues_payment_date,

          notes:
            membership.notes,

          contact:
            contact
              ? {
                  name: [
                    contact.first_name,
                    contact.last_name,
                  ]
                    .filter(Boolean)
                    .join(' '),

                  email:
                    contact.email,

                  mobilePhone:
                    contact.mobile_phone,
                }
              : null,
        },
      };
    },
  }),

  getCRMOverview: tool({
    description:
      'Get the main Lions CRM operational snapshot. Use this first for questions such as what needs attention, CRM status, priorities, or daily briefing.',

    inputSchema: z.object({}),

    execute: async () => {
      const supabase =
        await createClient();

      const today =
        todayISO();

      const ninetyDaysAgo =
        subtractDaysISO(90);

      const {
        role,
      } =
        await getCurrentRole();

      const [
        contactsResult,
        organizationsResult,
        activeMembersResult,
        duesDueResult,
        upcomingEventsResult,
        recentDonationsResult,
        openTasksResult,
        overdueTasksResult,
      ] = await Promise.all([
        supabase
          .from('contacts')
          .select('*', {
            count: 'exact',
            head: true,
          }),

        supabase
          .from('organizations')
          .select('*', {
            count: 'exact',
            head: true,
          }),

        supabase
          .from('memberships')
          .select('*', {
            count: 'exact',
            head: true,
          })
          .eq(
            'membership_status',
            'active'
          ),

        supabase
          .from('memberships')
          .select('*', {
            count: 'exact',
            head: true,
          })
          .in(
            'dues_status',
            [
              'due',
              'overdue',
            ]
          ),

        supabase
          .from('events')
          .select('*', {
            count: 'exact',
            head: true,
          })
          .gte(
            'event_date',
            today
          )
          .neq(
            'status',
            'cancelled'
          ),

        supabase
          .from('donations')
          .select(
            'amount, donation_date'
          )
          .gte(
            'donation_date',
            ninetyDaysAgo
          ),

        supabase
          .from('tasks')
          .select('*', {
            count: 'exact',
            head: true,
          })
          .in(
            'status',
            [
              'open',
              'in_progress',
            ]
          ),

        supabase
          .from('tasks')
          .select('*', {
            count: 'exact',
            head: true,
          })
          .in(
            'status',
            [
              'open',
              'in_progress',
            ]
          )
          .lt(
            'due_date',
            today
          ),
      ]);

      const error =
        contactsResult.error ||
        organizationsResult.error ||
        activeMembersResult.error ||
        duesDueResult.error ||
        upcomingEventsResult.error ||
        recentDonationsResult.error ||
        openTasksResult.error ||
        overdueTasksResult.error;

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      const recentDonations =
        recentDonationsResult
          .data ?? [];

      let partnerInquiries:
        | {
            open: number;
            new: number;
            reviewing: number;
          }
        | null = null;

      if (
        role === 'admin' ||
        role === 'officer'
      ) {
        const {
          data: inquiryData,
          error:
            inquiryError,
        } =
          await supabase
            .from(
              'community_partner_inquiries'
            )
            .select(
              'status'
            )
            .in(
              'status',
              [
                'new',
                'reviewing',
              ]
            );

        if (!inquiryError) {
          partnerInquiries = {
            open:
              inquiryData
                ?.length ?? 0,

            new:
              inquiryData
                ?.filter(
                  (item) =>
                    item.status ===
                    'new'
                ).length ?? 0,

            reviewing:
              inquiryData
                ?.filter(
                  (item) =>
                    item.status ===
                    'reviewing'
                ).length ?? 0,
          };
        }
      }

      return {
        success: true,
        generatedForDate: today,
        role,

        contacts:
          contactsResult.count ??
          0,

        organizations:
          organizationsResult
            .count ?? 0,

        activeMembers:
          activeMembersResult
            .count ?? 0,

        membershipsWithDuesDue:
          duesDueResult.count ??
          0,

        upcomingEvents:
          upcomingEventsResult
            .count ?? 0,

        tasks: {
          open:
            openTasksResult
              .count ?? 0,

          overdue:
            overdueTasksResult
              .count ?? 0,
        },

        donationsLast90Days: {
          count:
            recentDonations.length,

          totalAmount:
            recentDonations.reduce(
              (
                total,
                donation
              ) =>
                total +
                Number(
                  donation.amount ||
                    0
                ),
              0
            ),
        },

        partnerInquiryAccess:
          role === 'admin' ||
          role === 'officer',

        partnerInquiries,
      };
    },
  }),
};
