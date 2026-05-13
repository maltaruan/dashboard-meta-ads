export const META_API_VERSION = 'v21.0';
export const META_GRAPH_BASE = `https://graph.facebook.com/${META_API_VERSION}`;
export const META_OAUTH_BASE = `https://www.facebook.com/${META_API_VERSION}/dialog/oauth`;

export const META_SCOPES = ['ads_read', 'business_management'].join(',');

export function buildAuthorizeUrl(params: {
  appId: string;
  redirectUri: string;
  state: string;
}): string {
  const url = new URL(META_OAUTH_BASE);
  url.searchParams.set('client_id', params.appId);
  url.searchParams.set('redirect_uri', params.redirectUri);
  url.searchParams.set('state', params.state);
  url.searchParams.set('scope', META_SCOPES);
  url.searchParams.set('response_type', 'code');
  return url.toString();
}

export async function exchangeCodeForToken(params: {
  appId: string;
  appSecret: string;
  redirectUri: string;
  code: string;
}): Promise<{ access_token: string; expires_in?: number; token_type: string }> {
  const url = new URL(`${META_GRAPH_BASE}/oauth/access_token`);
  url.searchParams.set('client_id', params.appId);
  url.searchParams.set('client_secret', params.appSecret);
  url.searchParams.set('redirect_uri', params.redirectUri);
  url.searchParams.set('code', params.code);

  const res = await fetch(url.toString(), { method: 'GET' });
  const body = await res.json();

  if (!res.ok) {
    throw new Error(`Meta token exchange failed: ${JSON.stringify(body)}`);
  }
  return body;
}

export async function exchangeForLongLivedToken(params: {
  appId: string;
  appSecret: string;
  shortLivedToken: string;
}): Promise<{ access_token: string; expires_in: number; token_type: string }> {
  const url = new URL(`${META_GRAPH_BASE}/oauth/access_token`);
  url.searchParams.set('grant_type', 'fb_exchange_token');
  url.searchParams.set('client_id', params.appId);
  url.searchParams.set('client_secret', params.appSecret);
  url.searchParams.set('fb_exchange_token', params.shortLivedToken);

  const res = await fetch(url.toString(), { method: 'GET' });
  const body = await res.json();

  if (!res.ok) {
    throw new Error(`Meta long-lived exchange failed: ${JSON.stringify(body)}`);
  }
  return body;
}
