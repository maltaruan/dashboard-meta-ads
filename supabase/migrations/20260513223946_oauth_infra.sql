-- =============================================================================
-- Migration: oauth_infra
-- Adiciona infra para OAuth multi-tenant (um app Meta por account).
-- Idempotente.
-- =============================================================================

BEGIN;

-- 1. external_app_id em integrations -----------------------------------------
ALTER TABLE dashboard.integrations
  ADD COLUMN IF NOT EXISTS external_app_id TEXT;

COMMENT ON COLUMN dashboard.integrations.external_app_id IS
  'META_APP_ID (ou equivalente em outros providers). Público. Secret vive no vault.';

-- 2. oauth_state (CSRF, TTL 10min) -------------------------------------------
CREATE TABLE IF NOT EXISTS dashboard.oauth_state (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state          TEXT NOT NULL UNIQUE,
  account_id     UUID NOT NULL REFERENCES dashboard.accounts(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES dashboard.integrations(id) ON DELETE CASCADE,
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  redirect_to    TEXT,
  expires_at     TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '10 minutes'),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_oauth_state_expires ON dashboard.oauth_state(expires_at);

ALTER TABLE dashboard.oauth_state ENABLE ROW LEVEL SECURITY;
-- Sem policies para authenticated: só service_role acessa.

-- 3. Função: dashboard.get_app_credentials(integration_id) -------------------
CREATE OR REPLACE FUNCTION dashboard.get_app_credentials(p_integration_id UUID)
RETURNS TABLE(app_id TEXT, app_secret TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = dashboard, vault, pg_temp
AS $$
DECLARE
  v_app_id TEXT;
  v_secret TEXT;
  v_secret_name TEXT;
BEGIN
  SELECT external_app_id INTO v_app_id
  FROM dashboard.integrations
  WHERE id = p_integration_id;

  IF v_app_id IS NULL THEN
    RAISE EXCEPTION 'Integration % has no external_app_id', p_integration_id;
  END IF;

  v_secret_name := 'meta_app_secret:' || p_integration_id::TEXT;

  SELECT decrypted_secret INTO v_secret
  FROM vault.decrypted_secrets
  WHERE name = v_secret_name;

  IF v_secret IS NULL THEN
    RAISE EXCEPTION 'Secret % not found in vault', v_secret_name;
  END IF;

  RETURN QUERY SELECT v_app_id, v_secret;
END;
$$;

COMMENT ON FUNCTION dashboard.get_app_credentials(UUID) IS
  'Retorna (app_id, app_secret) de uma integration. Restrito a service_role.';

REVOKE ALL ON FUNCTION dashboard.get_app_credentials(UUID) FROM PUBLIC, authenticated;
GRANT EXECUTE ON FUNCTION dashboard.get_app_credentials(UUID) TO service_role;

-- 4. Função utilitária: limpa states expirados -------------------------------
CREATE OR REPLACE FUNCTION dashboard.cleanup_expired_oauth_states()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = dashboard, pg_temp
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM dashboard.oauth_state
    WHERE expires_at < now()
    RETURNING id
  )
  SELECT COUNT(*) INTO v_count FROM deleted;
  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION dashboard.cleanup_expired_oauth_states() FROM PUBLIC, authenticated;
GRANT EXECUTE ON FUNCTION dashboard.cleanup_expired_oauth_states() TO service_role;

-- 5. Seed: Azure Cloud Brasil + integration Meta -----------------------------
DO $$
DECLARE
  v_azure_id UUID;
  v_integration_id UUID;
BEGIN
  INSERT INTO dashboard.accounts (name, slug, is_internal)
  VALUES ('Azure Cloud Brasil', 'azure-cloud-brasil', FALSE)
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_azure_id;

  IF v_azure_id IS NULL THEN
    SELECT id INTO v_azure_id FROM dashboard.accounts WHERE slug = 'azure-cloud-brasil';
  END IF;

  INSERT INTO dashboard.integrations (account_id, provider, status, external_app_id, external_account_name)
  VALUES (v_azure_id, 'meta_ads', 'disconnected', '2755797204771791', 'Azure Cloud Brasil — Meta Ads')
  ON CONFLICT (account_id, provider, external_account_id) DO UPDATE
    SET external_app_id = EXCLUDED.external_app_id
  RETURNING id INTO v_integration_id;

  RAISE NOTICE 'Azure account_id: %', v_azure_id;
  RAISE NOTICE 'Azure integration_id: %', v_integration_id;
END $$;

COMMIT;
