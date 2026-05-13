-- =============================================================================
-- Migration: create_dashboard_schema
-- Schema: dashboard
-- Modelo: single-schema multi-tenant via account_id + RLS
-- =============================================================================
-- Esta migration é idempotente: pode ser executada múltiplas vezes sem erro.
-- Todas as tabelas têm RLS ativo desde a criação.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. SCHEMA
-- -----------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS dashboard;
COMMENT ON SCHEMA dashboard IS 'Marketing Intelligence Dashboard da ySquad. Multi-tenant via account_id.';

-- Garante que o role anon e authenticated podem usar o schema (não dá acesso a
-- dados — isso é controlado por RLS individual em cada tabela).
GRANT USAGE ON SCHEMA dashboard TO anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 2. EXTENSÕES NECESSÁRIAS (caso ainda não estejam ativas no banco)
-- -----------------------------------------------------------------------------
-- pgcrypto já está ativo (visto na auditoria), mas garantimos via IF NOT EXISTS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 3. FUNÇÃO UTILITÁRIA: trigger genérico de updated_at
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION dashboard.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = dashboard, pg_temp
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION dashboard.set_updated_at() IS
  'Trigger function genérico que atualiza updated_at para now() em UPDATE.';

-- -----------------------------------------------------------------------------
-- 4. TABELA: accounts
-- Representa cada cliente da ySquad (incluindo a própria ySquad como tenant raiz)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dashboard.accounts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  is_internal BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT accounts_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT accounts_slug_format CHECK (slug ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$' OR slug ~ '^[a-z0-9]$')
);

COMMENT ON TABLE dashboard.accounts IS
  'Cada linha representa um tenant. A account com is_internal=true é a ySquad operadora.';
COMMENT ON COLUMN dashboard.accounts.is_internal IS
  'TRUE para a account da ySquad (operadora). FALSE para clientes finais.';

CREATE TRIGGER trg_accounts_updated_at
  BEFORE UPDATE ON dashboard.accounts
  FOR EACH ROW EXECUTE FUNCTION dashboard.set_updated_at();

ALTER TABLE dashboard.accounts ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 5. TABELA: account_members
-- Vincula auth.users a accounts com role. Mesmo user pode estar em N accounts.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dashboard.account_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES dashboard.accounts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('owner', 'operator', 'client')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (account_id, user_id)
);

COMMENT ON TABLE dashboard.account_members IS
  'Membership de usuários em accounts. Role determina nível de acesso na account.';
COMMENT ON COLUMN dashboard.account_members.role IS
  'owner = controla a account; operator = ySquad operando; client = vê só métricas visíveis.';

CREATE INDEX IF NOT EXISTS idx_account_members_user_id ON dashboard.account_members(user_id);
CREATE INDEX IF NOT EXISTS idx_account_members_account_id ON dashboard.account_members(account_id);

CREATE TRIGGER trg_account_members_updated_at
  BEFORE UPDATE ON dashboard.account_members
  FOR EACH ROW EXECUTE FUNCTION dashboard.set_updated_at();

ALTER TABLE dashboard.account_members ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 6. FUNÇÃO HELPER: retorna account_ids do usuário atual
-- Usada por todas as policies RLS para filtrar dados por account.
-- SECURITY DEFINER porque precisa ler account_members sem trigger RLS infinito.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION dashboard.current_user_account_ids()
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = dashboard, pg_temp
AS $$
  SELECT account_id
  FROM dashboard.account_members
  WHERE user_id = auth.uid();
$$;

COMMENT ON FUNCTION dashboard.current_user_account_ids() IS
  'Retorna todos os account_ids aos quais o usuário autenticado pertence. Base das policies RLS.';

REVOKE ALL ON FUNCTION dashboard.current_user_account_ids() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION dashboard.current_user_account_ids() TO authenticated;

-- -----------------------------------------------------------------------------
-- 7. FUNÇÃO HELPER: verifica se usuário atual tem role específico em uma account
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION dashboard.current_user_has_role(
  p_account_id UUID,
  p_roles TEXT[]
)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = dashboard, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM dashboard.account_members
    WHERE user_id = auth.uid()
      AND account_id = p_account_id
      AND role = ANY(p_roles)
  );
$$;

COMMENT ON FUNCTION dashboard.current_user_has_role(UUID, TEXT[]) IS
  'Retorna TRUE se o usuário atual tem qualquer um dos roles em p_roles na account p_account_id.';

REVOKE ALL ON FUNCTION dashboard.current_user_has_role(UUID, TEXT[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION dashboard.current_user_has_role(UUID, TEXT[]) TO authenticated;

-- -----------------------------------------------------------------------------
-- 8. POLICIES: accounts
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS accounts_select ON dashboard.accounts;
CREATE POLICY accounts_select ON dashboard.accounts
  FOR SELECT
  TO authenticated
  USING (id IN (SELECT dashboard.current_user_account_ids()));

DROP POLICY IF EXISTS accounts_insert ON dashboard.accounts;
CREATE POLICY accounts_insert ON dashboard.accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (FALSE); -- Inserção só via service_role (Edge Functions / admin SQL)

DROP POLICY IF EXISTS accounts_update ON dashboard.accounts;
CREATE POLICY accounts_update ON dashboard.accounts
  FOR UPDATE
  TO authenticated
  USING (dashboard.current_user_has_role(id, ARRAY['owner']))
  WITH CHECK (dashboard.current_user_has_role(id, ARRAY['owner']));

DROP POLICY IF EXISTS accounts_delete ON dashboard.accounts;
CREATE POLICY accounts_delete ON dashboard.accounts
  FOR DELETE
  TO authenticated
  USING (FALSE); -- Delete só via service_role

-- -----------------------------------------------------------------------------
-- 9. POLICIES: account_members
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS account_members_select ON dashboard.account_members;
CREATE POLICY account_members_select ON dashboard.account_members
  FOR SELECT
  TO authenticated
  USING (account_id IN (SELECT dashboard.current_user_account_ids()));

DROP POLICY IF EXISTS account_members_insert ON dashboard.account_members;
CREATE POLICY account_members_insert ON dashboard.account_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    dashboard.current_user_has_role(account_id, ARRAY['owner', 'operator'])
  );

DROP POLICY IF EXISTS account_members_update ON dashboard.account_members;
CREATE POLICY account_members_update ON dashboard.account_members
  FOR UPDATE
  TO authenticated
  USING (dashboard.current_user_has_role(account_id, ARRAY['owner']))
  WITH CHECK (dashboard.current_user_has_role(account_id, ARRAY['owner']));

DROP POLICY IF EXISTS account_members_delete ON dashboard.account_members;
CREATE POLICY account_members_delete ON dashboard.account_members
  FOR DELETE
  TO authenticated
  USING (dashboard.current_user_has_role(account_id, ARRAY['owner']));

-- -----------------------------------------------------------------------------
-- 10. TABELA: integrations
-- Uma integração por (account, provider). Ex: account X com Meta Ads.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dashboard.integrations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id      UUID NOT NULL REFERENCES dashboard.accounts(id) ON DELETE CASCADE,
  provider        TEXT NOT NULL CHECK (provider IN ('meta_ads', 'google_ads', 'youtube', 'ga4')),
  external_account_id TEXT,
  external_account_name TEXT,
  status          TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('disconnected', 'connected', 'error', 'expired')),
  last_sync_at    TIMESTAMPTZ,
  last_error      TEXT,
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (account_id, provider, external_account_id)
);

COMMENT ON TABLE dashboard.integrations IS
  'Uma integração ativa por (account, provider, external_account). Token vive em oauth_tokens.';

CREATE INDEX IF NOT EXISTS idx_integrations_account_id ON dashboard.integrations(account_id);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON dashboard.integrations(status) WHERE status = 'connected';

CREATE TRIGGER trg_integrations_updated_at
  BEFORE UPDATE ON dashboard.integrations
  FOR EACH ROW EXECUTE FUNCTION dashboard.set_updated_at();

ALTER TABLE dashboard.integrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS integrations_select ON dashboard.integrations;
CREATE POLICY integrations_select ON dashboard.integrations
  FOR SELECT
  TO authenticated
  USING (account_id IN (SELECT dashboard.current_user_account_ids()));

DROP POLICY IF EXISTS integrations_modify ON dashboard.integrations;
CREATE POLICY integrations_modify ON dashboard.integrations
  FOR ALL
  TO authenticated
  USING (dashboard.current_user_has_role(account_id, ARRAY['owner', 'operator']))
  WITH CHECK (dashboard.current_user_has_role(account_id, ARRAY['owner', 'operator']));

-- -----------------------------------------------------------------------------
-- 11. TABELA: oauth_tokens
-- Tokens NUNCA são lidos pelo frontend. Apenas service_role acessa.
-- RLS bloqueia TUDO para authenticated/anon.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dashboard.oauth_tokens (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id  UUID NOT NULL REFERENCES dashboard.integrations(id) ON DELETE CASCADE UNIQUE,
  account_id      UUID NOT NULL REFERENCES dashboard.accounts(id) ON DELETE CASCADE,
  access_token    TEXT NOT NULL,
  refresh_token   TEXT,
  token_type      TEXT NOT NULL DEFAULT 'Bearer',
  expires_at      TIMESTAMPTZ,
  scope           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE dashboard.oauth_tokens IS
  'Tokens OAuth. Acessível APENAS via service_role (Edge Functions). authenticated não pode ler.';

CREATE INDEX IF NOT EXISTS idx_oauth_tokens_expires_at ON dashboard.oauth_tokens(expires_at)
  WHERE expires_at IS NOT NULL;

CREATE TRIGGER trg_oauth_tokens_updated_at
  BEFORE UPDATE ON dashboard.oauth_tokens
  FOR EACH ROW EXECUTE FUNCTION dashboard.set_updated_at();

ALTER TABLE dashboard.oauth_tokens ENABLE ROW LEVEL SECURITY;

-- ZERO policies para authenticated/anon = ZERO acesso via PostgREST.
-- service_role bypassa RLS automaticamente.

-- -----------------------------------------------------------------------------
-- 12. TABELA: metrics_cache
-- Cache obrigatório de chamadas a APIs externas. Pivot: (account, provider, date, dim).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dashboard.metrics_cache (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id      UUID NOT NULL REFERENCES dashboard.accounts(id) ON DELETE CASCADE,
  integration_id  UUID NOT NULL REFERENCES dashboard.integrations(id) ON DELETE CASCADE,
  provider        TEXT NOT NULL CHECK (provider IN ('meta_ads', 'google_ads', 'youtube', 'ga4')),
  metric_date     DATE NOT NULL,
  dimension_key   TEXT NOT NULL,
  dimension_value TEXT NOT NULL,
  metrics         JSONB NOT NULL,
  fetched_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at      TIMESTAMPTZ,
  UNIQUE (account_id, provider, metric_date, dimension_key, dimension_value)
);

COMMENT ON TABLE dashboard.metrics_cache IS
  'Cache de métricas brutas vindas das APIs externas. Toda leitura do dashboard passa por aqui.';
COMMENT ON COLUMN dashboard.metrics_cache.dimension_key IS
  'Tipo de dimensão: campaign, adset, ad, channel, etc.';
COMMENT ON COLUMN dashboard.metrics_cache.dimension_value IS
  'ID externo da dimensão (ex: campaign_id do Meta).';
COMMENT ON COLUMN dashboard.metrics_cache.metrics IS
  'JSON com todas as métricas da plataforma para essa (data, dimensão). Schema livre por provider.';

CREATE INDEX IF NOT EXISTS idx_metrics_cache_account_date ON dashboard.metrics_cache(account_id, metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_cache_integration ON dashboard.metrics_cache(integration_id, metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_cache_provider ON dashboard.metrics_cache(account_id, provider, metric_date DESC);

ALTER TABLE dashboard.metrics_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS metrics_cache_select ON dashboard.metrics_cache;
CREATE POLICY metrics_cache_select ON dashboard.metrics_cache
  FOR SELECT
  TO authenticated
  USING (account_id IN (SELECT dashboard.current_user_account_ids()));

-- INSERT/UPDATE/DELETE só via service_role (Edge Functions). Sem policies para authenticated.

-- -----------------------------------------------------------------------------
-- 13. TABELA: sync_logs
-- Histórico de sincronizações executadas (sucesso e erro).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dashboard.sync_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id      UUID NOT NULL REFERENCES dashboard.accounts(id) ON DELETE CASCADE,
  integration_id  UUID REFERENCES dashboard.integrations(id) ON DELETE SET NULL,
  provider        TEXT NOT NULL,
  status          TEXT NOT NULL CHECK (status IN ('success', 'partial', 'error')),
  records_synced  INTEGER NOT NULL DEFAULT 0,
  duration_ms     INTEGER,
  error_message   TEXT,
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sync_logs_account ON dashboard.sync_logs(account_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_logs_integration ON dashboard.sync_logs(integration_id, started_at DESC);

ALTER TABLE dashboard.sync_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sync_logs_select ON dashboard.sync_logs;
CREATE POLICY sync_logs_select ON dashboard.sync_logs
  FOR SELECT
  TO authenticated
  USING (
    account_id IN (SELECT dashboard.current_user_account_ids())
    AND dashboard.current_user_has_role(account_id, ARRAY['owner', 'operator'])
  );

-- Cliente NÃO vê sync logs. Apenas owner/operator. Inserção só via service_role.

-- -----------------------------------------------------------------------------
-- 14. TABELA: client_metric_visibility
-- Define quais métricas o operador deixou visíveis para o perfil "client" da account.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dashboard.client_metric_visibility (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id  UUID NOT NULL REFERENCES dashboard.accounts(id) ON DELETE CASCADE,
  provider    TEXT NOT NULL CHECK (provider IN ('meta_ads', 'google_ads', 'youtube', 'ga4')),
  metric_key  TEXT NOT NULL,
  is_visible  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (account_id, provider, metric_key)
);

COMMENT ON TABLE dashboard.client_metric_visibility IS
  'Quais métricas de cada provider o cliente daquela account pode ver. Métricas de prioridade Alta são visíveis por default no app.';

CREATE INDEX IF NOT EXISTS idx_cmv_account ON dashboard.client_metric_visibility(account_id, provider);

CREATE TRIGGER trg_cmv_updated_at
  BEFORE UPDATE ON dashboard.client_metric_visibility
  FOR EACH ROW EXECUTE FUNCTION dashboard.set_updated_at();

ALTER TABLE dashboard.client_metric_visibility ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cmv_select ON dashboard.client_metric_visibility;
CREATE POLICY cmv_select ON dashboard.client_metric_visibility
  FOR SELECT
  TO authenticated
  USING (account_id IN (SELECT dashboard.current_user_account_ids()));

DROP POLICY IF EXISTS cmv_modify ON dashboard.client_metric_visibility;
CREATE POLICY cmv_modify ON dashboard.client_metric_visibility
  FOR ALL
  TO authenticated
  USING (dashboard.current_user_has_role(account_id, ARRAY['owner', 'operator']))
  WITH CHECK (dashboard.current_user_has_role(account_id, ARRAY['owner', 'operator']));

-- -----------------------------------------------------------------------------
-- 15. TRIGGER: auto-membership no signup
-- Todo novo usuário vira 'client' da account ySquad por default.
-- Promoção a operator/owner é manual via SQL.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION dashboard.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = dashboard, pg_temp
AS $$
DECLARE
  v_ysquad_account_id UUID;
  v_invite_account_id UUID;
  v_invite_role TEXT;
BEGIN
  -- Caso A: signup veio via convite (metadata tem invite_account_id e invite_role)
  v_invite_account_id := NULLIF(NEW.raw_user_meta_data->>'invite_account_id', '')::UUID;
  v_invite_role := NULLIF(NEW.raw_user_meta_data->>'invite_role', '');

  IF v_invite_account_id IS NOT NULL AND v_invite_role IN ('owner', 'operator', 'client') THEN
    INSERT INTO dashboard.account_members (account_id, user_id, role)
    VALUES (v_invite_account_id, NEW.id, v_invite_role)
    ON CONFLICT (account_id, user_id) DO NOTHING;
    RETURN NEW;
  END IF;

  -- Caso B: signup direto, sem convite. Vira 'client' da ySquad.
  SELECT id INTO v_ysquad_account_id
  FROM dashboard.accounts
  WHERE is_internal = TRUE
  LIMIT 1;

  IF v_ysquad_account_id IS NOT NULL THEN
    INSERT INTO dashboard.account_members (account_id, user_id, role)
    VALUES (v_ysquad_account_id, NEW.id, 'client')
    ON CONFLICT (account_id, user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION dashboard.handle_new_user() IS
  'Trigger AFTER INSERT em auth.users. Vincula novo usuário à account correta com role apropriado.';

DROP TRIGGER IF EXISTS on_auth_user_created_dashboard ON auth.users;
CREATE TRIGGER on_auth_user_created_dashboard
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION dashboard.handle_new_user();

-- -----------------------------------------------------------------------------
-- 16. BOOTSTRAP: cria account ySquad + vincula usuários existentes como owner
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  v_ysquad_id UUID;
BEGIN
  -- Cria ou recupera a account ySquad
  INSERT INTO dashboard.accounts (name, slug, is_internal)
  VALUES ('ySquad', 'ysquad', TRUE)
  ON CONFLICT (slug) DO UPDATE SET is_internal = TRUE
  RETURNING id INTO v_ysquad_id;

  IF v_ysquad_id IS NULL THEN
    SELECT id INTO v_ysquad_id FROM dashboard.accounts WHERE slug = 'ysquad';
  END IF;

  -- Vincula todos os usuários atualmente existentes em auth.users como owner da ySquad
  INSERT INTO dashboard.account_members (account_id, user_id, role)
  SELECT v_ysquad_id, u.id, 'owner'
  FROM auth.users u
  ON CONFLICT (account_id, user_id) DO NOTHING;

  RAISE NOTICE 'Bootstrap concluído. Account ySquad ID: %', v_ysquad_id;
END $$;

COMMIT;
