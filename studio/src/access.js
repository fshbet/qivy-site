/**
 * Cloudflare Access gate.
 *
 * Access authenticates at the edge and forwards a signed JWT in the
 * `Cf-Access-Jwt-Assertion` header. This module verifies that signature
 * rather than trusting the header's presence, because a header is trivial to
 * forge if a request ever reaches the Worker by another route.
 *
 * Two locks, deliberately:
 *   1. wrangler.toml sets `workers_dev = false`, so there is no
 *      *.workers.dev URL that bypasses Access entirely.
 *   2. This check, so a mistake in (1) is not on its own enough to expose
 *      the app.
 *
 * It FAILS CLOSED. If ACCESS_TEAM_DOMAIN or ACCESS_AUD is unset, every
 * request is refused. An unconfigured gate is an open door, and this app can
 * spend money and write to a public repository.
 */

let cachedKeys = null;
let cachedAt = 0;
const KEY_TTL_MS = 60 * 60 * 1000;

function b64urlToBytes(input) {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function b64urlToJson(input) {
  return JSON.parse(new TextDecoder().decode(b64urlToBytes(input)));
}

async function getKeys(teamDomain) {
  const now = Date.now();
  if (cachedKeys && now - cachedAt < KEY_TTL_MS) return cachedKeys;

  const res = await fetch(`https://${teamDomain}/cdn-cgi/access/certs`);
  if (!res.ok) throw new Error(`Access certs fetch failed: HTTP ${res.status}`);

  const body = await res.json();
  cachedKeys = body.keys || [];
  cachedAt = now;
  return cachedKeys;
}

/**
 * @returns {Promise<{ok: true, email: string} | {ok: false, status: number, message: string}>}
 */
export async function requireAccess(request, env) {
  const team = (env.ACCESS_TEAM_DOMAIN || '').trim();
  const aud = (env.ACCESS_AUD || '').trim();

  if (!team || !aud) {
    return {
      ok: false,
      status: 503,
      message:
        'Cloudflare Access is not configured. Set ACCESS_TEAM_DOMAIN and ' +
        'ACCESS_AUD, then redeploy. Refusing to serve until then — an ' +
        'unprotected dashboard can spend your credits and write to your repo.',
    };
  }

  const token =
    request.headers.get('Cf-Access-Jwt-Assertion') ||
    (request.headers.get('Cookie') || '').match(/CF_Authorization=([^;]+)/)?.[1];

  if (!token) {
    return {
      ok: false,
      status: 401,
      message:
        'No Cloudflare Access token on this request. Reach this app through ' +
        'its Access-protected hostname.',
    };
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return { ok: false, status: 401, message: 'Malformed Access token.' };
  }

  let header;
  let payload;
  try {
    header = b64urlToJson(parts[0]);
    payload = b64urlToJson(parts[1]);
  } catch {
    return { ok: false, status: 401, message: 'Unreadable Access token.' };
  }

  let keys;
  try {
    keys = await getKeys(team);
  } catch (err) {
    // Can't verify means can't trust. Never fall through to "allow".
    return { ok: false, status: 503, message: `Access key lookup failed: ${err.message}` };
  }

  const jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk) {
    return { ok: false, status: 401, message: 'Access token signed by an unknown key.' };
  }

  const cryptoKey = await crypto.subtle.importKey(
    'jwk',
    { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: 'RS256', ext: true },
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify'],
  );

  const signed = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
  const valid = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    b64urlToBytes(parts[2]),
    signed,
  );
  if (!valid) {
    return { ok: false, status: 401, message: 'Access token signature is not valid.' };
  }

  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== 'number' || payload.exp < now) {
    return { ok: false, status: 401, message: 'Access token has expired. Reload the page.' };
  }
  if (typeof payload.nbf === 'number' && payload.nbf > now + 60) {
    return { ok: false, status: 401, message: 'Access token is not valid yet.' };
  }

  // `aud` pins the token to THIS application. Without it, a valid token for
  // any other app on the same Access team would open this one.
  const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!audiences.includes(aud)) {
    return { ok: false, status: 403, message: 'Access token is for a different application.' };
  }

  if (payload.iss !== `https://${team}`) {
    return { ok: false, status: 403, message: 'Access token issued by a different team.' };
  }

  return { ok: true, email: payload.email || 'unknown' };
}
