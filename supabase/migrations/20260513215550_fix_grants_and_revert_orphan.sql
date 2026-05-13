-- =============================================================================
-- Migration: fix_grants_and_revert_orphan
-- Corrige:
--   1. Grants faltantes em tabelas do schema dashboard
--   2. Reverte artefatos criados pela migration órfã 20260316172646 em public/auth
--   3. Define default privileges para tabelas futuras do schema dashboard
-- Idempotente: pode ser executada múltiplas vezes sem erro.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. GRANTS retroativos nas tabelas existentes do schema dashboard
-- -----------------------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA dashboard TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA dashboard TO service_role;

-- Sequences (para colunas SERIAL/identity, embora estejamos usando UUID — defesa futura)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA dashboard TO authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 2. DEFAULT PRIVILEGES — tabelas futuras já nascem com grant
-- -----------------------------------------------------------------------------
ALTER DEFAULT PRIVILEGES IN SCHEMA dashboard
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA dashboard
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA dashboard
  GRANT USAGE, SELECT ON SEQUENCES TO authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 3. REVERSÃO da migration órfã 20260316172646
-- Remove artefatos criados em public/auth que não pertencem ao dashboard.
-- -----------------------------------------------------------------------------

-- 3.1 Remove o trigger em auth.users criado pela órfã
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3.2 Remove a função handle_new_user em public (a do schema dashboard permanece)
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 3.3 Remove a tabela public.profiles (dado ainda não está em uso)
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 3.4 Remove a função utilitária public.update_updated_at_column
-- (a do schema dashboard.set_updated_at permanece)
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

COMMIT;
