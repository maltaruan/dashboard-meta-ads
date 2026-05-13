import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { getAdminClient } from '../_shared/supabase-admin.ts';
import { exchangeForLongLivedToken } from '../_shared/meta.ts';

const REFRESH_WINDOW_DAYS = 7;

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const authHeader = req.headers.get('Authorization');
  const cronSecret = req.headers.get('X-Cron-Secret');
  const isServiceRole =
    authHeader === `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`;
  const expectedCronSecret = Deno.env.get('CRON_SECRET');
  const isCron = expectedCronSecret && cronSecret === expectedCronSecret;

  if (!isServiceRole && !isCron) {
    return jsonResponse(401, { error: 'Unauthorized' });
  }

  const body = await req.json().catch(() => ({}));
  const integrationId = body.integration_id as string | undefined;

  const admin = getAdminClient();
  const cutoff = new Date(Date.now() + REFRESH_WINDOW_DAYS * 24 * 3600 * 1000).toISOString();

  let query = admin
    .from('oauth_tokens')
    .select('id, integration_id, account_id, expires_at, access_token, integrations!inner(provider, external_app_id, status)')
    .lt('expires_at', cutoff);

  if (integrationId) query = query.eq('integration_id', integrationId);

  const { data: tokens, error: queryError } = await query;

  if (queryError) return jsonResponse(500, { error: queryError.message });

  const results = { refreshed: 0, errors: [] as Array<{ integration_id: string; error: string }> };

  for (const token of tokens ?? []) {
    try {
      const integration = (token as any).integrations;
      if (integration.provider !== 'meta_ads' || integration.status !== 'connected') continue;

      const { data: credsData, error: credsError } = await admin.rpc('get_app_credentials', {
        p_integration_id: token.integration_id,
      });

      if (credsError || !credsData || credsData.length === 0) {
        results.errors.push({ integration_id: token.integration_id, error: 'missing_credentials' });
        continue;
      }

      const newToken = await exchangeForLongLivedToken({
        appId: credsData[0].app_id,
        appSecret: credsData[0].app_secret,
        shortLivedToken: (token as any).access_token,
      });

      const newExpiresAt = newToken.expires_in
        ? new Date(Date.now() + newToken.expires_in * 1000).toISOString()
        : null;

      await admin
        .from('oauth_tokens')
        .update({ access_token: newToken.access_token, expires_at: newExpiresAt })
        .eq('id', token.id);

      results.refreshed++;
    } catch (err) {
      results.errors.push({
        integration_id: token.integration_id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return jsonResponse(200, results);
});

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
