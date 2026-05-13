import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { getAdminClient, getUserClient } from '../_shared/supabase-admin.ts';
import { buildAuthorizeUrl } from '../_shared/meta.ts';

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse(401, { error: 'Missing Authorization header' });
    }

    const userClient = getUserClient(authHeader);
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) {
      return jsonResponse(401, { error: 'Invalid token' });
    }
    const userId = userData.user.id;

    const body = await req.json().catch(() => ({}));
    const integrationId = body.integration_id as string | undefined;
    if (!integrationId) {
      return jsonResponse(400, { error: 'Missing integration_id' });
    }

    const admin = getAdminClient();

    const { data: integration, error: integrationError } = await admin
      .from('integrations')
      .select('id, account_id, provider, external_app_id, status')
      .eq('id', integrationId)
      .single();

    if (integrationError || !integration) {
      return jsonResponse(404, { error: 'Integration not found' });
    }
    if (integration.provider !== 'meta_ads') {
      return jsonResponse(400, { error: 'Integration is not meta_ads' });
    }
    if (!integration.external_app_id) {
      return jsonResponse(400, { error: 'Integration has no external_app_id' });
    }

    const { data: membership } = await admin
      .from('account_members')
      .select('role')
      .eq('account_id', integration.account_id)
      .eq('user_id', userId)
      .in('role', ['owner', 'operator'])
      .maybeSingle();

    if (!membership) {
      return jsonResponse(403, { error: 'User does not have permission on this account' });
    }

    const state = crypto.randomUUID() + '-' + crypto.randomUUID();

    const { error: stateError } = await admin
      .from('oauth_state')
      .insert({
        state,
        account_id: integration.account_id,
        integration_id: integration.id,
        user_id: userId,
      });

    if (stateError) {
      console.error('Failed to persist state:', stateError);
      return jsonResponse(500, { error: 'Failed to persist OAuth state' });
    }

    const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/meta-oauth-callback`;
    const authorizeUrl = buildAuthorizeUrl({
      appId: integration.external_app_id,
      redirectUri,
      state,
    });

    return jsonResponse(200, { authorize_url: authorizeUrl });
  } catch (err) {
    console.error('meta-oauth-start error:', err);
    return jsonResponse(500, { error: err instanceof Error ? err.message : String(err) });
  }
});

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
