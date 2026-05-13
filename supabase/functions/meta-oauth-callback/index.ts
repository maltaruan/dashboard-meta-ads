import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { getAdminClient } from '../_shared/supabase-admin.ts';
import { exchangeCodeForToken, exchangeForLongLivedToken } from '../_shared/meta.ts';

const FRONTEND_BASE = Deno.env.get('FRONTEND_URL') ?? 'http://localhost:8080';

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const errorParam = url.searchParams.get('error');
  const errorDesc = url.searchParams.get('error_description');

  if (errorParam) {
    return redirectToUI(`/integracao?status=error&reason=${encodeURIComponent(errorDesc ?? errorParam)}`);
  }
  if (!code || !state) {
    return redirectToUI('/integracao?status=error&reason=missing_code_or_state');
  }

  const admin = getAdminClient();

  const { data: stateRow, error: stateError } = await admin
    .from('oauth_state')
    .select('id, account_id, integration_id, user_id, expires_at')
    .eq('state', state)
    .single();

  if (stateError || !stateRow) {
    return redirectToUI('/integracao?status=error&reason=invalid_state');
  }
  if (new Date(stateRow.expires_at) < new Date()) {
    return redirectToUI('/integracao?status=error&reason=state_expired');
  }

  await admin.from('oauth_state').delete().eq('id', stateRow.id);

  const { data: credsData, error: credsError } = await admin.rpc('get_app_credentials', {
    p_integration_id: stateRow.integration_id,
  });

  if (credsError || !credsData || credsData.length === 0) {
    console.error('get_app_credentials failed:', credsError);
    await markIntegrationError(admin, stateRow.integration_id, 'Failed to retrieve app credentials');
    return redirectToUI('/integracao?status=error&reason=missing_credentials');
  }

  const { app_id: appId, app_secret: appSecret } = credsData[0];
  const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/meta-oauth-callback`;

  let shortToken;
  try {
    shortToken = await exchangeCodeForToken({ appId, appSecret, redirectUri, code });
  } catch (err) {
    console.error('exchangeCodeForToken failed:', err);
    await markIntegrationError(admin, stateRow.integration_id, String(err));
    return redirectToUI('/integracao?status=error&reason=code_exchange_failed');
  }

  let longToken;
  try {
    longToken = await exchangeForLongLivedToken({
      appId,
      appSecret,
      shortLivedToken: shortToken.access_token,
    });
  } catch (err) {
    console.error('exchangeForLongLivedToken failed:', err);
    await markIntegrationError(admin, stateRow.integration_id, String(err));
    return redirectToUI('/integracao?status=error&reason=long_token_exchange_failed');
  }

  const expiresAt = longToken.expires_in
    ? new Date(Date.now() + longToken.expires_in * 1000).toISOString()
    : null;

  const { error: upsertError } = await admin
    .from('oauth_tokens')
    .upsert(
      {
        integration_id: stateRow.integration_id,
        account_id: stateRow.account_id,
        access_token: longToken.access_token,
        token_type: longToken.token_type ?? 'Bearer',
        expires_at: expiresAt,
        scope: 'ads_read,business_management',
      },
      { onConflict: 'integration_id' }
    );

  if (upsertError) {
    console.error('oauth_tokens upsert failed:', upsertError);
    await markIntegrationError(admin, stateRow.integration_id, String(upsertError));
    return redirectToUI('/integracao?status=error&reason=token_save_failed');
  }

  await admin
    .from('integrations')
    .update({ status: 'connected', last_error: null })
    .eq('id', stateRow.integration_id);

  return redirectToUI('/integracao?status=success');
});

async function markIntegrationError(admin: any, integrationId: string, message: string) {
  await admin
    .from('integrations')
    .update({ status: 'error', last_error: message.slice(0, 1000) })
    .eq('id', integrationId);
}

function redirectToUI(path: string): Response {
  return new Response(null, {
    status: 302,
    headers: { ...corsHeaders, Location: `${FRONTEND_BASE}${path}` },
  });
}
