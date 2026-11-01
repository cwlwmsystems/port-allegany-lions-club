'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Resend } from 'resend';

import { createClient } from '@/lib/supabase/server';
import { assertCRMRole, type CRMRole } from '@/lib/crm-permissions';
import { mergeCommunicationTemplate } from '@/lib/communications/merge-fields';

const COMMUNICATION_ROLES: CRMRole[] = [
  'admin',
  'officer',
  'membership_chair',
  'treasurer',
];

function textValue(
  formData: FormData,
  key: string
) {
  const value = formData.get(key);

  return typeof value === 'string'
    ? value.trim()
    : '';
}

export async function createCommunicationTemplate(
  formData: FormData
) {
  await assertCRMRole(COMMUNICATION_ROLES);

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/club/login');
  }

  const name = textValue(formData, 'name');
  const templateType =
    textValue(formData, 'template_type');
  const subject =
    textValue(formData, 'subject') || null;
  const body = textValue(formData, 'body');
  const description =
    textValue(formData, 'description') || null;

  if (!name || !body) {
    throw new Error(
      'Template name and body are required.'
    );
  }

  if (
    !['letter', 'email'].includes(templateType)
  ) {
    throw new Error(
      'Invalid communication template type.'
    );
  }

  const { error } = await supabase
    .from('communication_templates')
    .insert({
      name,
      template_type: templateType,
      subject,
      body,
      description,
      created_by: user.id,
    });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(
    '/club/communications/templates'
  );

  redirect('/club/communications/templates');
}

export async function createCommunication(
  formData: FormData
) {
  await assertCRMRole(COMMUNICATION_ROLES);

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/club/login');
  }

  const communicationType =
    textValue(
      formData,
      'communication_type'
    );

  if (
    !['letter', 'email'].includes(
      communicationType
    )
  ) {
    throw new Error(
      'Invalid communication type.'
    );
  }

  const contactId =
    textValue(formData, 'contact_id') ||
    null;

  const organizationId =
    textValue(
      formData,
      'organization_id'
    ) || null;

  const templateId =
    textValue(formData, 'template_id') ||
    null;

  const customMessage =
    textValue(formData, 'custom_message');

  const customBody =
    textValue(formData, 'custom_body');

  const customSubject =
    textValue(formData, 'subject');

  let contact: any = null;
  let organization: any = null;
  let template: any = null;

  if (contactId) {
    const { data, error } = await supabase
      .from('contacts')
      .select(`
        id,
        first_name,
        last_name,
        email,
        phone,
        address_line_1,
        address_line_2,
        city,
        state,
        postal_code
      `)
      .eq('id', contactId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    contact = data;
  }

  if (organizationId) {
    const { data, error } = await supabase
      .from('organizations')
      .select(`
        id,
        name,
        email,
        phone,
        website,
        address_line_1,
        address_line_2,
        city,
        state,
        postal_code
      `)
      .eq('id', organizationId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    organization = data;
  }

  if (templateId) {
    const { data, error } = await supabase
      .from('communication_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    template = data;
  }

  const mergeData = {
    contact,
    organization,
    custom: {
      message: customMessage,
    },
  };

  let body = customBody;

  if (template?.body) {
    body = mergeCommunicationTemplate(
      template.body,
      mergeData
    );
  }

  if (!body) {
    throw new Error(
      'Communication body is required.'
    );
  }

  let subject =
    customSubject ||
    template?.subject ||
    null;

  if (subject) {
    subject =
      mergeCommunicationTemplate(
        subject,
        mergeData
      );
  }

  const recipientName = contact
    ? [
        contact.first_name,
        contact.last_name,
      ]
        .filter(Boolean)
        .join(' ')
    : organization?.name || null;

  const recipientEmail =
    contact?.email ||
    organization?.email ||
    null;

  const initialStatus =
    communicationType === 'letter'
      ? 'generated'
      : 'draft';

  const { data, error } = await supabase
    .from('communications')
    .insert({
      communication_type:
        communicationType,
      contact_id: contactId,
      organization_id: organizationId,
      template_id: templateId,
      recipient_name: recipientName,
      recipient_email: recipientEmail,
      subject,
      body,
      status: initialStatus,
      created_by: user.id,
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/club/communications');

  redirect(
    `/club/communications/${data.id}`
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export async function sendCommunicationEmail(
  formData: FormData
) {
  await assertCRMRole(COMMUNICATION_ROLES);

  const id =
    textValue(
      formData,
      'communication_id'
    );

  if (!id) {
    throw new Error(
      'Communication ID is required.'
    );
  }

  const supabase = await createClient();

  const {
    data: communication,
    error,
  } = await supabase
    .from('communications')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !communication) {
    throw new Error(
      error?.message ||
        'Communication not found.'
    );
  }

  if (
    communication.communication_type !==
    'email'
  ) {
    throw new Error(
      'Only email communications can be sent.'
    );
  }

  if (!communication.recipient_email) {
    throw new Error(
      'This communication does not have a recipient email address.'
    );
  }

  const apiKey =
    process.env.RESEND_API_KEY;

  const fromEmail =
    process.env.RESEND_FROM_EMAIL;

  const fromName =
    process.env.RESEND_FROM_NAME ||
    'Port Allegany Lions Club';

  if (!apiKey || !fromEmail) {
    throw new Error(
      'Resend environment variables are not configured.'
    );
  }

  const resend = new Resend(apiKey);

  const bodyHtml = escapeHtml(
    communication.body
  ).replaceAll('\n', '<br />');

  const { data, error: sendError } =
    await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [
        communication.recipient_email,
      ],
      subject:
        communication.subject ||
        'Port Allegany Lions Club',
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222;max-width:680px;margin:auto">
          ${bodyHtml}
        </div>
      `,
    });

  if (sendError) {
    await supabase
      .from('communications')
      .update({
        status: 'failed',
        error_message:
          sendError.message,
      })
      .eq('id', id);

    throw new Error(
      sendError.message
    );
  }

  await supabase
    .from('communications')
    .update({
      status: 'sent',
      sent_at:
        new Date().toISOString(),
      resend_message_id:
        data?.id || null,
      error_message: null,
    })
    .eq('id', id);

  revalidatePath(
    `/club/communications/${id}`
  );

  revalidatePath(
    '/club/communications'
  );

  redirect(
    `/club/communications/${id}?sent=1`
  );
}
