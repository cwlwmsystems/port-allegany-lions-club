import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const MAX_BODY_BYTES = 8192;
const VALID_INTERESTS = new Set([
  'membership',
  'volunteer',
  'partner',
  'general'
]);

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    { status, headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function POST(req: Request) {
  const contentType = req.headers.get('content-type') || '';

  if (!contentType.toLowerCase().includes('application/json')) {
    return errorResponse('JSON content is required.', 415);
  }

  const declaredLength = Number(req.headers.get('content-length'));

  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return errorResponse('Request is too large.', 413);
  }

  let body: Record<string, unknown>;

  try {
    // Read as text so oversized requests are rejected before JSON parsing.
    const reader = req.body?.getReader();

    if (!reader) {
      return errorResponse('Invalid request.', 400);
    }

    const chunks: Uint8Array[] = [];
    let total = 0;

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      total += value.byteLength;

      if (total > MAX_BODY_BYTES) {
        await reader.cancel();
        return errorResponse('Request is too large.', 413);
      }

      chunks.push(value);
    }

    const bytes = new Uint8Array(total);
    let offset = 0;

    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }

    const parsed: unknown = JSON.parse(
      new TextDecoder().decode(bytes)
    );

    if (
      !parsed ||
      typeof parsed !== 'object' ||
      Array.isArray(parsed)
    ) {
      return errorResponse('Invalid request.', 400);
    }

    body = parsed as Record<string, unknown>;
  } catch {
    return errorResponse('Invalid request.', 400);
  }

  const field = (value: unknown) =>
    typeof value === 'string' ? value.trim() : '';

  const name = field(body.name);
  const email = field(body.email);
  const phone = field(body.phone);
  const message = field(body.message);
  const interest = field(body.interest);
  const website = field(body.website);

  // Honeypot: do not forward suspected automated submissions.
  if (website) {
    return NextResponse.json({ ok: true });
  }

  if (
    !name ||
    name.length > 120 ||
    !email ||
    email.length > 200 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    phone.length > 35 ||
    message.length > 2000 ||
    !VALID_INTERESTS.has(interest) ||
    body.consent !== true
  ) {
    return errorResponse('Please check the form fields and consent.', 400);
  }

  const endpoint = process.env.FORMSPREE_ENDPOINT;

  if (
    !endpoint ||
    !/^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(endpoint)
  ) {
    return errorResponse(
      'Online inquiries are not yet configured by the club.',
      503
    );
  }

  const payload = new FormData();

  payload.set('name', name);
  payload.set('email', email);
  payload.set('phone', phone);
  payload.set('interest', interest);
  payload.set('message', message);
  payload.set(
    '_subject',
    'Port Allegany Lions inquiry: ' + interest
  );

  try {
    const result = await fetch(endpoint, {
      method: 'POST',
      body: payload,
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(10000)
    });

    if (!result.ok) {
      return errorResponse(
        'The inquiry service did not accept this message. Please try again later.',
        502
      );
    }

    return NextResponse.json(
      { ok: true },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch {
    return errorResponse(
      'The inquiry service is unavailable. Please try again later.',
      502
    );
  }
}
