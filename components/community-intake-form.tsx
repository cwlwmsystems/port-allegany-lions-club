
'use client';

import {useState, type FormEvent} from 'react';

type Mode = 'need' | 'suggestion';

export default function CommunityIntakeForm({mode}:{mode:Mode}) {
  const [status,setStatus] = useState<'idle'|'sending'|'sent'|'error'>('idle');
  const [feedback,setFeedback] = useState('');

  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const values = new FormData(form);

    setStatus('sending');
    setFeedback('');

    const body = {
      type: mode,
      name: String(values.get('name') || '').trim(),
      email: String(values.get('email') || '').trim(),
      organization: String(values.get('organization') || '').trim(),
      title: String(values.get('title') || '').trim(),
      description: String(values.get('description') || '').trim(),
      location: String(values.get('location') || '').trim(),
      timing: String(values.get('timing') || '').trim(),
      website: String(values.get('website') || ''),
      consent: values.get('consent') === 'yes'
    };

    try {
      const response = await fetch('/api/community-intake', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(body)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Unable to send your request.');
      }

      form.reset();
      setStatus('sent');
    } catch (error) {
      setStatus('error');
      setFeedback(
        error instanceof Error ? error.message : 'An unexpected error occurred.'
      );
    }
  }

  const isNeed = mode === 'need';

  return (
    <form className="community-intake-form" onSubmit={submit}>
      <h2>{isNeed ? 'Request volunteer help' : 'Suggest a community project'}</h2>

      <p className="community-form-intro">
        {isNeed
          ? 'Tell us what your organization needs. The club will review your request before making any commitments.'
          : 'Have a practical idea that could improve Port Allegany? We would like to hear it.'}
      </p>

      <label htmlFor={mode + '-name'}>Your name *</label>
      <input
        id={mode + '-name'}
        name="name"
        type="text"
        autoComplete="name"
        maxLength={120}
        required
      />

      <label htmlFor={mode + '-email'}>Email address *</label>
      <input
        id={mode + '-email'}
        name="email"
        type="email"
        autoComplete="email"
        maxLength={200}
        required
      />

      <label htmlFor={mode + '-organization'}>
        {isNeed ? 'Organization name *' : 'Organization (optional)'}
      </label>
      <input
        id={mode + '-organization'}
        name="organization"
        type="text"
        maxLength={160}
        required={isNeed}
      />

      <label htmlFor={mode + '-title'}>
        {isNeed ? 'What help do you need? *' : 'Project idea title *'}
      </label>
      <input
        id={mode + '-title'}
        name="title"
        type="text"
        maxLength={160}
        required
        placeholder={isNeed ? 'Example: Help with a community cleanup' : 'Example: Monthly neighborhood cleanup'}
      />

      <label htmlFor={mode + '-description'}>
        {isNeed ? 'Describe the assistance needed *' : 'Describe your idea *'}
      </label>
      <textarea
        id={mode + '-description'}
        name="description"
        rows={5}
        maxLength={2000}
        required
        placeholder="What would the project involve, and how could volunteers help?"
      />

      <label htmlFor={mode + '-location'}>Location or area (optional)</label>
      <input
        id={mode + '-location'}
        name="location"
        maxLength={160}
        placeholder="Port Allegany or a nearby area"
      />

      <label htmlFor={mode + '-timing'}>
        {isNeed ? 'Preferred date or timeframe (optional)' : 'Suggested timeframe (optional)'}
      </label>
      <input
        id={mode + '-timing'}
        name="timing"
        maxLength={160}
        placeholder="Example: Next month or flexible"
      />

      <div className="community-honeypot" aria-hidden="true">
        <label htmlFor={mode + '-website'}>Leave blank</label>
        <input
          id={mode + '-website'}
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <label className="community-consent">
        <input type="checkbox" name="consent" value="yes" required />
        <span>
          I agree to be contacted by the Port Allegany Lions Club
          regarding this submission. *
        </span>
      </label>

      <button type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending...' : 'Submit for review →'}
      </button>

      {status === 'sent' && (
        <p className="community-feedback success" role="status">
          Thank you. Your submission was received for club review.
          We will follow up if additional details are needed.
        </p>
      )}

      {status === 'error' && (
        <p className="community-feedback error" role="alert">
          {feedback}
        </p>
      )}

      <p className="community-form-note">
        Submission does not guarantee that the club can take on a project.
        Please do not include sensitive personal information or details
        about someone else's private circumstances.
      </p>
    </form>
  );
}
