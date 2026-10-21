
import {NextResponse} from 'next/server';

export const runtime = 'nodejs';

const MAX_BYTES = 8192;

function respond(error:string,status:number) {
  return NextResponse.json(
    {error},
    {status,headers:{'Cache-Control':'no-store'}}
  );
}

export async function POST(req:Request) {
  if (!(req.headers.get('content-type') || '').toLowerCase().includes('application/json')) {
    return respond('JSON is required.',415);
  }

  const declared = Number(req.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > MAX_BYTES) {
    return respond('Request is too large.',413);
  }

  let data:Record<string,unknown>;

  try {
    const reader = req.body?.getReader();
    if (!reader) return respond('Invalid submission.',400);

    const chunks:Uint8Array[] = [];
    let size = 0;

    while (true) {
      const {done,value} = await reader.read();
      if (done) break;

      size += value.byteLength;
      if (size > MAX_BYTES) {
        await reader.cancel();
        return respond('Request is too large.',413);
      }
      chunks.push(value);
    }

    const bytes = new Uint8Array(size);
    let pos = 0;
    for (const chunk of chunks) {
      bytes.set(chunk,pos);
      pos += chunk.byteLength;
    }

    const parsed:unknown = JSON.parse(new TextDecoder().decode(bytes));

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return respond('Invalid submission.',400);
    }

    data = parsed as Record<string,unknown>;
  } catch {
    return respond('Invalid submission.',400);
  }

  const field = (key:string) =>
    typeof data[key] === 'string' ? (data[key] as string).trim() : '';

  const type = field('type');
  const name = field('name');
  const email = field('email');
  const organization = field('organization');
  const title = field('title');
  const description = field('description');
  const location = field('location');
  const timing = field('timing');

  if (field('website')) {
    return NextResponse.json({ok:true});
  }

  if (
    !['need','suggestion'].includes(type) ||
    !name || name.length > 120 ||
    !email || email.length > 200 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    organization.length > 160 ||
    (type === 'need' && !organization) ||
    !title || title.length > 160 ||
    !description || description.length > 2000 ||
    location.length > 160 ||
    timing.length > 160 ||
    data.consent !== true
  ) {
    return respond('Please review the required fields and consent.',400);
  }

  const endpoint = process.env.FORMSPREE_ENDPOINT;

  if (!endpoint || !/^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(endpoint)) {
    return respond('Submissions are not configured yet.',503);
  }

  const payload = new FormData();

  payload.set('_subject',type === 'need'
    ? 'Lions Community Volunteer Request'
    : 'Lions Community Project Suggestion'
  );

  payload.set('submission_type',type);
  payload.set('name',name);
  payload.set('email',email);
  payload.set('organization',organization);
  payload.set('title',title);
  payload.set('description',description);
  payload.set('location',location);
  payload.set('timing',timing);
  payload.set('consent','yes');

  try {
    const result = await fetch(endpoint,{
      method:'POST',
      body:payload,
      headers:{Accept:'application/json'},
      cache:'no-store',
      signal:AbortSignal.timeout(10000)
    });

    if (!result.ok) {
      return respond('The submission service is unavailable. Please try later.',502);
    }

    return NextResponse.json(
      {ok:true},
      {headers:{'Cache-Control':'no-store'}}
    );
  } catch {
    return respond('Unable to deliver the submission. Please try later.',502);
  }
}
