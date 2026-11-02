'use client';

import {
  FormEvent,
  useState,
} from 'react';

const SUPPORT_OPTIONS = [
  'Donation',
  'Sponsorship',
  'Volunteer Support',
  'Event Support',
  'Project Support',
  'Collection Location',
  'In-Kind Donation',
  'Meeting Participation',
];

export default function CommunityPartnerForm() {
  const [status, setStatus] =
    useState<
      'idle' |
      'sending' |
      'sent' |
      'error'
    >('idle');

  const [message, setMessage] =
    useState('');

  async function submit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setStatus('sending');
    setMessage('');

    const form =
      event.currentTarget;

    const formData =
      new FormData(form);

    const supportInterests =
      formData
        .getAll(
          'support_interests'
        )
        .map(
          (value) =>
            value.toString()
        );

    const payload = {
      business_name:
        formData.get(
          'business_name'
        ),

      first_name:
        formData.get(
          'first_name'
        ),

      last_name:
        formData.get(
          'last_name'
        ),

      email:
        formData.get('email'),

      phone:
        formData.get('phone'),

      website:
        formData.get('website'),

      message:
        formData.get('message'),

      company_website_check:
        formData.get(
          'company_website_check'
        ),

      support_interests:
        supportInterests,
    };

    try {

      const response =
        await fetch(
          '/api/community-partner',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify(
                payload
              ),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            'Unable to submit form.'
        );
      }

      form.reset();

      setStatus('sent');

    } catch (error) {

      setStatus('error');

      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to submit form.'
      );

    }
  }

  return (
    <form
      onSubmit={submit}
      className="partner-interest-form"
    >
      <div className="partner-form-grid">

        <label>
          <span>
            Business or Organization *
          </span>

          <input
            name="business_name"
            required
            maxLength={160}
          />
        </label>


        <label>
          <span>
            Website
          </span>

          <input
            name="website"
            type="url"
            placeholder="https://..."
          />
        </label>


        <label>
          <span>
            First Name *
          </span>

          <input
            name="first_name"
            required
            autoComplete="given-name"
          />
        </label>


        <label>
          <span>
            Last Name *
          </span>

          <input
            name="last_name"
            required
            autoComplete="family-name"
          />
        </label>


        <label>
          <span>
            Email *
          </span>

          <input
            name="email"
            type="email"
            required
            autoComplete="email"
          />
        </label>


        <label>
          <span>
            Phone
          </span>

          <input
            name="phone"
            type="tel"
            autoComplete="tel"
          />
        </label>

      </div>


      <fieldset className="partner-support-fieldset">

        <legend>
          How would you like to get involved?
        </legend>

        <p>
          Select any that interest you.
        </p>

        <div className="partner-support-options">

          {SUPPORT_OPTIONS.map(
            (option) => (

              <label key={option}>

                <input
                  type="checkbox"
                  name="support_interests"
                  value={option}
                />

                <span>
                  {option}
                </span>

              </label>

            )
          )}

        </div>

      </fieldset>


      <label className="partner-form-message">

        <span>
          Tell us a little more
        </span>

        <textarea
          name="message"
          rows={5}
          maxLength={2000}
          placeholder="Tell us how your business might like to support the Lions Club, volunteer, participate in a project, attend a meeting, or learn more."
        />

      </label>


      <div
        className="partner-form-honeypot"
        aria-hidden="true"
      >
        <label>
          Company Website Check

          <input
            name="company_website_check"
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
      </div>


      <label className="partner-form-consent">

        <input
          type="checkbox"
          required
        />

        <span>
          I agree to be contacted by the
          Port Allegany Lions Club about
          partnership, volunteer, sponsorship,
          and community service opportunities.
        </span>

      </label>


      <button
        type="submit"
        className="partner-form-submit"
        disabled={
          status === 'sending'
        }
      >
        {status === 'sending'
          ? 'Sending...'
          : 'Become a Community Partner'}
      </button>


      {status === 'sent' && (

        <div
          className="partner-form-success"
          role="status"
        >
          Thank you! Your information has
          been sent to the Port Allegany
          Lions Club. Someone from the club
          will be in touch.
        </div>

      )}


      {status === 'error' && (

        <div
          className="partner-form-error"
          role="alert"
        >
          {message}
        </div>

      )}

    </form>
  );
}
