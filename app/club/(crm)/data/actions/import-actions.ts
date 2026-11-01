'use server';

import { redirect } from 'next/navigation';
import { parse } from 'csv-parse/sync';

import { createClient } from '@/lib/supabase/server';

import { assertCRMRole } from '@/lib/crm-permissions';


type CSVRow = {
  [key: string]: string | undefined;
};


function clean(
  value: string | undefined
) {
  const cleaned =
    value?.toString().trim();

  return cleaned || null;
}


function getField(
  row: CSVRow,
  names: string[]
) {
  for (const name of names) {
    const value = row[name];

    if (value !== undefined) {
      return value;
    }
  }

  return undefined;
}


export async function importContacts(
  formData: FormData
) {
  await assertCRMRole([
    'admin',
    'officer',
    'membership_chair',
  ]);

  const file = formData.get('file');

  if (!(file instanceof File)) {
    throw new Error(
      'Please select a CSV file.'
    );
  }

  if (!file.name
    .toLowerCase()
    .endsWith('.csv')) {
    throw new Error(
      'The import file must be a CSV.'
    );
  }

  const rawText =
    await file.text();

  const rows = parse(
    rawText,
    {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
      relax_column_count: true,
    }
  ) as CSVRow[];


  if (!rows.length) {
    redirect(
      '/club/data?imported=0&skipped=0&errors=0'
    );
  }


  const supabase =
    await createClient();


  const {
    data: existingContacts,
  } = await supabase
    .from('contacts')
    .select('email');


  const knownEmails =
    new Set(
      (existingContacts ?? [])
        .map((contact) =>
          contact.email
            ?.trim()
            .toLowerCase()
        )
        .filter(Boolean)
    );


  let imported = 0;
  let skipped = 0;
  let errors = 0;


  for (const row of rows) {

    const firstName = clean(
      getField(row, [
        'First Name',
        'first_name',
        'First name',
        'firstname',
      ])
    );

    const lastName = clean(
      getField(row, [
        'Last Name',
        'last_name',
        'Last name',
        'lastname',
      ])
    );


    if (!firstName || !lastName) {
      errors += 1;
      continue;
    }


    const rawEmail = clean(
      getField(row, [
        'Email',
        'email',
        'Email Address',
      ])
    );

    const email =
      rawEmail?.toLowerCase() || null;


    if (
      email &&
      knownEmails.has(email)
    ) {
      skipped += 1;
      continue;
    }


    const status =
      clean(
        getField(row, [
          'Status',
          'status',
        ])
      ) || 'active';


    const { error } = await supabase
      .from('contacts')
      .insert({
        first_name: firstName,
        last_name: lastName,

        email,

        phone: clean(
          getField(row, [
            'Phone',
            'phone',
          ])
        ),

        mobile_phone: clean(
          getField(row, [
            'Mobile Phone',
            'mobile_phone',
            'Mobile',
          ])
        ),

        address_line_1: clean(
          getField(row, [
            'Address',
            'Address Line 1',
            'address_line_1',
          ])
        ),

        address_line_2: clean(
          getField(row, [
            'Address Line 2',
            'address_line_2',
          ])
        ),

        city: clean(
          getField(row, [
            'City',
            'city',
          ])
        ),

        state: clean(
          getField(row, [
            'State',
            'state',
          ])
        ),

        postal_code: clean(
          getField(row, [
            'Postal Code',
            'Zip',
            'ZIP',
            'postal_code',
          ])
        ),

        preferred_contact_method: clean(
          getField(row, [
            'Preferred Contact Method',
            'preferred_contact_method',
          ])
        ),

        occupation: clean(
          getField(row, [
            'Occupation',
            'occupation',
          ])
        ),

        source: clean(
          getField(row, [
            'Source',
            'source',
          ])
        ),

        general_notes: clean(
          getField(row, [
            'Notes',
            'General Notes',
            'general_notes',
          ])
        ),

        status,
      });


    if (error) {
      console.error(
        'Contact import error:',
        error
      );

      errors += 1;
      continue;
    }


    if (email) {
      knownEmails.add(email);
    }

    imported += 1;
  }


  redirect(
    `/club/data?imported=${imported}&skipped=${skipped}&errors=${errors}`
  );
}
