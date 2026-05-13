# Audit Report — Dashboard Meta Ads (Supabase xxzupolczwyrtnunzjhf)

**Data:** 2026-05-13T20:48:23Z
**Executor:** Claude Code (Opus 4.7)
**Modo:** somente leitura, nenhuma modificação realizada no banco ou no código

---

## 1. Ambiente
- Node version: `v25.9.0`
- Supabase CLI version: `2.98.1` (release v2.98.2 disponível)
- Project linkado: **sim** — `xxzupolczwyrtnunzjhf` (confirmado em `supabase/.temp/linked-project.json` e `supabase/.temp/project-ref`)
- Método de execução SQL: `supabase db query --linked --agent no --output csv` (9 chamadas individuais, uma por seção — `\echo` não é suportado fora do `psql`)
- `psql` não está instalado localmente. `supabase status` falhou por falta de Docker, mas o trabalho foi feito 100% contra o remoto via Management API.
- Repositório foi clonado de `https://github.com/maltaruan/dashboard-meta-ads.git` para `/Users/ruanmalta/dashboard-meta-ads` no início desta sessão (o diretório não existia antes).

## 2. Schemas existentes
Schemas user-defined (excluindo `pg_temp_*`/`pg_toast_temp_*` que são privados de sessão):

| schema_name |
|---|
| `agente_noticias` |
| `cron` |
| `jarvis` |
| `prospeccao` |
| `public` |
| `sinuca` |

> Foram observados também 114 schemas temporários (`pg_temp_NN` / `pg_toast_temp_NN`) — todos vazios e descartáveis, criados por conexões transitórias e listados aqui apenas para registro.

## 3. Tabelas e contagem de linhas

| schema | table | row_count |
|---|---|---|
| agente_noticias | abordagens | 3 |
| agente_noticias | coletas_log | 7 |
| agente_noticias | formatos | 412 |
| agente_noticias | ganchos | 1018 |
| agente_noticias | ideias | 36 |
| agente_noticias | lotes_sinapses | 7 |
| agente_noticias | noticias | 148 |
| agente_noticias | roteiros | 5 |
| agente_noticias | sinapses | 63 |
| cron | job | 0 |
| cron | job_run_details | 83 |
| jarvis | briefings | 0 |
| jarvis | conversations | 0 |
| jarvis | facts | 6 |
| jarvis | messages | 0 |
| jarvis | scheduled_tasks | 0 |
| jarvis | tool_calls | 0 |
| prospeccao | _backup_teste_wf02 | 0 |
| prospeccao | agendamentos | 0 |
| prospeccao | bairros | 170 |
| prospeccao | buffer_mensagens | 0 |
| prospeccao | cidades | 40 |
| prospeccao | copy_followup | 9 |
| prospeccao | erro_logs | 11 |
| prospeccao | leads | 420 |
| prospeccao | leads_atendimento_wpp_ysquad | 3 |
| prospeccao | leads_historico | 0 |
| prospeccao | logs_disparo | 0 |
| prospeccao | n8n_chat_histories | 0 |
| prospeccao | places_api_cache | 0 |
| prospeccao | produtos_ysquad | 3 |
| prospeccao | prospeccao_estados | 17 |
| prospeccao | workflow_execucoes | 0 |
| public | agentes | 14 |
| public | agentes_alertas | 0 |
| public | agentes_atividades | 0 |
| public | agentes_handoffs | 0 |
| public | agentes_metricas_diarias | 0 |
| public | agentes_status | 14 |
| public | buffer_mensagens | 0 |
| public | cotacao_cambio | 1 |
| public | erro_logs | 3 |
| public | jarvis_memory | 0 |
| public | pontos_escritorio | 9 |
| public | precos_modelos | 7 |
| sinuca | analises | 0 |
| sinuca | leads | 0 |
| sinuca | mensagens | 0 |

## 4. Estrutura das tabelas

#### `agente_noticias.abordagens`

| column | type | nullable | default |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `sinapse_id` | uuid | NO |  |
| `formato_id` | uuid | YES |  |
| `gancho_id` | uuid | YES |  |
| `proposta` | text | NO |  |
| `notas` | text | YES |  |
| `status` | USER-DEFINED | NO | 'ideia'::agente_noticias.status_ideia |
| `prompt_usado` | text | YES |  |
| `modelo_usado` | text | YES |  |
| `tokens_input` | integer | YES |  |
| `tokens_output` | integer | YES |  |
| `criado_em` | timestamp with time zone | NO | now() |
| `atualizado_em` | timestamp with time zone | NO | now() |

#### `agente_noticias.coletas_log`

| column | type | nullable | default |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `executado_em` | timestamp with time zone | YES | now() |
| `total_inseridas` | integer | YES | 0 |
| `total_duplicadas` | integer | YES | 0 |
| `total_descartadas` | integer | YES | 0 |
| `breakdown_por_vertical` | jsonb | YES |  |
| `verticais_com_erro` | jsonb | YES |  |
| `duracao_ms` | integer | YES |  |
| `status` | text | YES | 'sucesso'::text |

#### `agente_noticias.feed_noticias`

| column | type | nullable | default |
|---|---|---|---|
| `id` | uuid | YES |  |
| `tipo` | text | YES |  |
| `titulo` | text | YES |  |
| `fonte_url` | text | YES |  |
| `fonte` | text | YES |  |
| `vertical` | text | YES |  |
| `thumbnail_url` | text | YES |  |
| `sintese` | text | YES |  |
| `angulo` | text | YES |  |
| `tags` | ARRAY | YES |  |
| `metricas` | jsonb | YES |  |
| `lido` | boolean | YES |  |
| `data_pub` | text | YES |  |
| `criado_em` | timestamp with time zone | YES |  |
| `total_ideias` | bigint | YES |  |

#### `agente_noticias.feed_sinapses`

| column | type | nullable | default |
|---|---|---|---|
| `id` | uuid | YES |  |
| `lote_id` | uuid | YES |  |
| `lote_rodado_em` | timestamp with time zone | YES |  |
| `lote_status` | USER-DEFINED | YES |  |
| `tema_tecnico` | text | YES |  |
| `nucleo_popular` | text | YES |  |
| `tipo_cruzamento` | text | YES |  |
| `tensao_central` | text | YES |  |
| `abertura_proposta` | text | YES |  |
| `framework_nomeado` | text | YES |  |
| `fecho_proposto` | text | YES |  |
| `justificativa_cruzamento` | text | YES |  |
| `status` | USER-DEFINED | YES |  |
| `qualidade` | USER-DEFINED | YES |  |
| `aval_nucleo_popular` | USER-DEFINED | YES |  |
| `aval_tensao_central` | USER-DEFINED | YES |  |
| `aval_encaixe` | USER-DEFINED | YES |  |
| `feedback_motivo` | text | YES |  |
| `avaliado_em` | timestamp with time zone | YES |  |
| `criado_em` | timestamp with time zone | YES |  |
| `noticia_ancora_titulo` | text | YES |  |
| `noticia_ancora_vertical` | text | YES |  |
| `total_abordagens` | bigint | YES |  |

#### `agente_noticias.formatos`

| column | type | nullable | default |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `numero` | integer | YES |  |
| `nome` | text | NO |  |
| `descricao` | text | YES |  |
| `estrutura` | text | YES |  |
| `ativo` | boolean | YES | true |
| `criado_em` | timestamp with time zone | YES | now() |
| `objetivo` | ARRAY | YES |  |
| `tipo_midia` | text | YES |  |
| `plataforma` | ARRAY | YES |  |
| `bunker_origem` | integer | YES |  |
| `etapa_funil` | text | YES |  |
| `referencia_url` | text | YES |  |
| `referencia_drive` | text | YES |  |
| `data_publicacao` | date | YES |  |
| `notion_page_id` | text | YES |  |
| `fonte` | text | YES | 'laboratorio_roteiros_filipe_penoni'::text |

#### `agente_noticias.ganchos`

| column | type | nullable | default |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `numero` | integer | NO |  |
| `texto` | text | NO |  |
| `mecanismo` | USER-DEFINED | NO |  |
| `exemplo` | text | YES |  |
| `ativo` | boolean | YES | true |
| `criado_em` | timestamp with time zone | YES | now() |

#### `agente_noticias.ideias`

| column | type | nullable | default |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `noticia_id` | uuid | YES |  |
| `formato_id` | uuid | YES |  |
| `gancho_id` | uuid | YES |  |
| `angulo` | text | NO |  |
| `status` | USER-DEFINED | NO | 'ideia'::agente_noticias.status_ideia |
| `notas` | text | YES |  |
| `criado_em` | timestamp with time zone | YES | now() |
| `atualizado_em` | timestamp with time zone | YES | now() |

#### `agente_noticias.lotes_sinapses`

| column | type | nullable | default |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `rodado_em` | timestamp with time zone | NO | now() |
| `status` | USER-DEFINED | NO | 'gerando'::agente_noticias.status_lote_sinapse |
| `prompt_usado` | text | YES |  |
| `modelo_usado` | text | YES |  |
| `tokens_input` | integer | YES |  |
| `tokens_output` | integer | YES |  |
| `duracao_ms` | integer | YES |  |
| `contexto_feedback` | jsonb | YES |  |
| `noticias_referencia` | ARRAY | YES |  |
| `erro` | text | YES |  |
| `criado_em` | timestamp with time zone | NO | now() |
| `atualizado_em` | timestamp with time zone | NO | now() |

#### `agente_noticias.noticias`

| column | type | nullable | default |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `titulo` | text | NO |  |
| `link` | text | YES |  |
| `fonte` | text | YES |  |
| `vertical` | text | YES |  |
| `resumo_bruto` | text | YES |  |
| `data_pub` | text | YES |  |
| `sintese` | text | YES |  |
| `angulo` | text | YES |  |
| `aproveitavel` | boolean | YES | true |
| `status` | text | YES | 'novo'::text |
| `tipo` | text | NO | 'noticia'::text |
| `thumbnail_url` | text | YES |  |
| `tags` | ARRAY | YES | '{}'::text[] |
| `metricas` | jsonb | YES | '{}'::jsonb |
| `lido` | boolean | YES | false |
| `arquivado` | boolean | YES | false |
| `criado_em` | timestamp with time zone | YES | now() |
| `relevancia` | text | YES | 'baixa'::text |
| `atualizado_em` | timestamp with time zone | YES | now() |

#### `agente_noticias.painel_abordagens`

| column | type | nullable | default |
|---|---|---|---|
| `id` | uuid | YES |  |
| `sinapse_id` | uuid | YES |  |
| `tema_tecnico` | text | YES |  |
| `nucleo_popular` | text | YES |  |
| `tensao_central` | text | YES |  |
| `proposta` | text | YES |  |
| `notas` | text | YES |  |
| `status` | USER-DEFINED | YES |  |
| `formato_id` | uuid | YES |  |
| `formato_nome` | text | YES |  |
| `formato_descricao` | text | YES |  |
| `formato_etapa_funil` | text | YES |  |
| `formato_plataforma` | ARRAY | YES |  |
| `gancho_id` | uuid | YES |  |
| `gancho_texto` | text | YES |  |
| `gancho_mecanismo` | USER-DEFINED | YES |  |
| `roteiro_id` | uuid | YES |  |
| `roteiro_status` | USER-DEFINED | YES |  |
| `criado_em` | timestamp with time zone | YES |  |

#### `agente_noticias.painel_ideias`

| column | type | nullable | default |
|---|---|---|---|
| `id` | uuid | YES |  |
| `status` | USER-DEFINED | YES |  |
| `angulo` | text | YES |  |
| `notas` | text | YES |  |
| `criado_em` | timestamp with time zone | YES |  |
| `atualizado_em` | timestamp with time zone | YES |  |
| `noticia_tipo` | text | YES |  |
| `noticia_titulo` | text | YES |  |
| `noticia_url` | text | YES |  |
| `noticia_vertical` | text | YES |  |
| `noticia_sintese` | text | YES |  |
| `formato_numero` | integer | YES |  |
| `formato_nome` | text | YES |  |
| `formato_midia` | text | YES |  |
| `formato_objetivo` | ARRAY | YES |  |
| `gancho_numero` | integer | YES |  |
| `gancho_texto` | text | YES |  |
| `gancho_mecanismo` | USER-DEFINED | YES |  |
| `roteiro_id` | uuid | YES |  |
| `roteiro_status` | USER-DEFINED | YES |  |

#### `agente_noticias.roteiros`

| column | type | nullable | default |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `ideia_id` | uuid | YES |  |
| `titulo_trabalho` | text | NO |  |
| `gancho_texto` | text | YES |  |
| `desenvolvimento` | text | YES |  |
| `cta` | text | YES |  |
| `obs_producao` | text | YES |  |
| `status` | USER-DEFINED | NO | 'rascunho'::agente_noticias.status_roteiro |
| `versao` | integer | NO | 1 |
| `criado_em` | timestamp with time zone | YES | now() |
| `atualizado_em` | timestamp with time zone | YES | now() |
| `conteudo_markdown` | text | YES |  |
| `conteudo_blocos` | jsonb | YES |  |
| `prompt_usado` | text | YES |  |
| `modelo_usado` | text | YES |  |
| `tokens_input` | integer | YES |  |
| `tokens_output` | integer | YES |  |
| `gerado_em` | timestamp with time zone | YES |  |
| `publicado_em` | timestamp with time zone | YES |  |
| `plataforma_publicacao` | text | YES |  |
| `url_publicacao` | text | YES |  |
| `id_video_plataforma` | text | YES |  |
| `metricas_12h` | jsonb | YES |  |
| `metricas_24h` | jsonb | YES |  |
| `metricas_48h` | jsonb | YES |  |
| `metricas_5d` | jsonb | YES |  |
| `qualificacao_manual` | smallint | YES |  |
| `observacao_pos_publicacao` | text | YES |  |
| `abordagem_id` | uuid | YES |  |
| `origem_tipo` | text | NO | 'noticia'::text |

#### `agente_noticias.sinapses`

| column | type | nullable | default |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `lote_id` | uuid | NO |  |
| `tema_tecnico` | text | NO |  |
| `nucleo_popular` | text | NO |  |
| `tipo_cruzamento` | text | YES |  |
| `tensao_central` | text | NO |  |
| `abertura_proposta` | text | YES |  |
| `framework_nomeado` | text | YES |  |
| `fecho_proposto` | text | YES |  |
| `noticia_ancora_id` | uuid | YES |  |
| `status` | USER-DEFINED | NO | 'gerada'::agente_noticias.status_sinapse |
| `qualidade` | USER-DEFINED | YES |  |
| `feedback_motivo` | text | YES |  |
| `aval_nucleo_popular` | USER-DEFINED | YES |  |
| `aval_tensao_central` | USER-DEFINED | YES |  |
| `aval_encaixe` | USER-DEFINED | YES |  |
| `avaliado_em` | timestamp with time zone | YES |  |
| `criado_em` | timestamp with time zone | NO | now() |
| `atualizado_em` | timestamp with time zone | NO | now() |
| `justificativa_cruzamento` | text | YES |  |

#### `cron.job`

| column | type | nullable | default |
|---|---|---|---|
| `jobid` | bigint | NO | nextval('cron.jobid_seq'::regclass) |
| `schedule` | text | NO |  |
| `command` | text | NO |  |
| `nodename` | text | NO | 'localhost'::text |
| `nodeport` | integer | NO | inet_server_port() |
| `database` | text | NO | current_database() |
| `username` | text | NO | CURRENT_USER |
| `active` | boolean | NO | true |
| `jobname` | text | YES |  |

#### `cron.job_run_details`

| column | type | nullable | default |
|---|---|---|---|
| `jobid` | bigint | YES |  |
| `runid` | bigint | NO | nextval('cron.runid_seq'::regclass) |
| `job_pid` | integer | YES |  |
| `database` | text | YES |  |
| `username` | text | YES |  |
| `command` | text | YES |  |
| `status` | text | YES |  |
| `return_message` | text | YES |  |
| `start_time` | timestamp with time zone | YES |  |
| `end_time` | timestamp with time zone | YES |  |

#### `jarvis.briefings`

| column | type | nullable | default |
|---|---|---|---|
| `id` | uuid | NO | uuid_generate_v4() |
| `user_id` | text | NO | 'ruan'::text |
| `briefing_date` | date | NO |  |
| `briefing_type` | text | NO | 'morning'::text |
| `content` | text | NO |  |
| `calendar_data` | jsonb | YES |  |
| `email_data` | jsonb | YES |  |
| `tasks_data` | jsonb | YES |  |
| `delivered_at` | timestamp with time zone | YES |  |
| `acknowledged_at` | timestamp with time zone | YES |  |
| `created_at` | timestamp with time zone | NO | now() |

#### `jarvis.conversations`

| column | type | nullable | default |
|---|---|---|---|
| `id` | uuid | NO | uuid_generate_v4() |
| `user_id` | text | NO | 'ruan'::text |
| `channel` | text | NO | 'telegram'::text |
| `channel_chat_id` | text | YES |  |
| `started_at` | timestamp with time zone | NO | now() |
| `last_message_at` | timestamp with time zone | NO | now() |
| `message_count` | integer | NO | 0 |
| `metadata` | jsonb | YES | '{}'::jsonb |

#### `jarvis.facts`

| column | type | nullable | default |
|---|---|---|---|
| `id` | uuid | NO | uuid_generate_v4() |
| `user_id` | text | NO | 'ruan'::text |
| `category` | text | NO |  |
| `key` | text | NO |  |
| `value` | text | NO |  |
| `confidence` | double precision | YES | 1.0 |
| `source_message_id` | uuid | YES |  |
| `created_at` | timestamp with time zone | NO | now() |
| `updated_at` | timestamp with time zone | NO | now() |
| `expires_at` | timestamp with time zone | YES |  |
| `metadata` | jsonb | YES | '{}'::jsonb |

#### `jarvis.messages`

| column | type | nullable | default |
|---|---|---|---|
| `id` | uuid | NO | uuid_generate_v4() |
| `conversation_id` | uuid | YES |  |
| `user_id` | text | NO | 'ruan'::text |
| `role` | text | NO |  |
| `content` | text | NO |  |
| `input_type` | text | YES | 'text'::text |
| `tokens_input` | integer | YES |  |
| `tokens_output` | integer | YES |  |
| `model` | text | YES |  |
| `embedding` | USER-DEFINED | YES |  |
| `created_at` | timestamp with time zone | NO | now() |
| `metadata` | jsonb | YES | '{}'::jsonb |

#### `jarvis.recent_history`

| column | type | nullable | default |
|---|---|---|---|
| `id` | uuid | YES |  |
| `user_id` | text | YES |  |
| `role` | text | YES |  |
| `content` | text | YES |  |
| `created_at` | timestamp with time zone | YES |  |
| `recency_rank` | bigint | YES |  |

#### `jarvis.scheduled_tasks`

| column | type | nullable | default |
|---|---|---|---|
| `id` | uuid | NO | uuid_generate_v4() |
| `user_id` | text | NO | 'ruan'::text |
| `task_type` | text | NO |  |
| `cron_expression` | text | YES |  |
| `next_run_at` | timestamp with time zone | YES |  |
| `last_run_at` | timestamp with time zone | YES |  |
| `last_run_status` | text | YES |  |
| `is_active` | boolean | NO | true |
| `config` | jsonb | YES | '{}'::jsonb |
| `created_at` | timestamp with time zone | NO | now() |

#### `jarvis.tool_calls`

| column | type | nullable | default |
|---|---|---|---|
| `id` | uuid | NO | uuid_generate_v4() |
| `message_id` | uuid | YES |  |
| `user_id` | text | NO | 'ruan'::text |
| `tool_name` | text | NO |  |
| `input` | jsonb | NO |  |
| `output` | jsonb | YES |  |
| `status` | text | NO | 'pending'::text |
| `error_message` | text | YES |  |
| `duration_ms` | integer | YES |  |
| `created_at` | timestamp with time zone | NO | now() |

#### `prospeccao._backup_teste_wf02`

| column | type | nullable | default |
|---|---|---|---|
| `lead_id` | uuid | NO |  |
| `telefone_original` | text | YES |  |
| `nome_original` | text | YES |  |
| `status_original` | text | YES |  |
| `nicho` | text | YES |  |
| `backup_em` | timestamp with time zone | YES | now() |

#### `prospeccao.agendamentos`

| column | type | nullable | default |
|---|---|---|---|
| `id` | integer | NO | nextval('prospeccao.agendamentos_id_seq'::regclass) |
| `telefone` | text | NO |  |
| `nome` | text | YES |  |
| `assunto` | text | YES |  |
| `evento_id` | text | YES |  |
| `data_formatada` | text | YES |  |
| `status` | text | YES | 'confirmado'::text |
| `created_at` | timestamp with time zone | YES | now() |

#### `prospeccao.bairros`

| column | type | nullable | default |
|---|---|---|---|
| `id` | integer | NO | nextval('prospeccao.bairros_id_seq'::regclass) |
| `estado` | character varying | NO |  |
| `cidade` | character varying | NO |  |
| `bairro` | character varying | NO |  |
| `ordem` | integer | NO |  |
| `ativo` | boolean | YES | true |
| `criado_em` | timestamp with time zone | YES | now() |

#### `prospeccao.buffer_mensagens`

| column | type | nullable | default |
|---|---|---|---|
| `id` | integer | NO | nextval('prospeccao.buffer_mensagens_id_seq'::regclass) |
| `telefone` | text | NO |  |
| `mensagem` | text | YES |  |
| `tipo` | text | YES | 'texto'::text |
| `created_at` | timestamp with time zone | YES | now() |
| `execution_id` | text | YES |  |

#### `prospeccao.cidades`

| column | type | nullable | default |
|---|---|---|---|
| `id` | integer | NO | nextval('prospeccao.cidades_id_seq'::regclass) |
| `estado` | character varying | NO |  |
| `cidade` | character varying | NO |  |
| `ordem` | integer | NO |  |
| `ativo` | boolean | YES | true |
| `criado_em` | timestamp with time zone | YES | now() |

#### `prospeccao.consumo_places_hoje`

| column | type | nullable | default |
|---|---|---|---|
| `workflow_nome` | text | YES |  |
| `dia` | date | YES |  |
| `execucoes` | bigint | YES |  |
| `total_requests` | bigint | YES |  |
| `total_leads` | bigint | YES |  |
| `total_duplicados` | bigint | YES |  |
| `custo_total_brl` | numeric | YES |  |
| `pct_duplicacao` | numeric | YES |  |

#### `prospeccao.copy_followup`

| column | type | nullable | default |
|---|---|---|---|
| `id` | integer | NO | nextval('prospeccao.copy_followup_id_seq'::regclass) |
| `tentativa` | integer | NO |  |
| `canal` | text | NO |  |
| `assunto` | text | YES |  |
| `mensagem` | text | NO |  |
| `ativo` | boolean | YES | true |
| `criado_em` | timestamp with time zone | YES | now() |

#### `prospeccao.erro_logs`

| column | type | nullable | default |
|---|---|---|---|
| `id` | integer | NO | nextval('prospeccao.erro_logs_id_seq'::regclass) |
| `execution_id` | text | YES |  |
| `erro` | text | YES |  |
| `telefone` | text | YES |  |
| `node_origem` | text | YES |  |
| `created_at` | timestamp with time zone | YES | now() |

#### `prospeccao.leads`

| column | type | nullable | default |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `nome` | text | NO |  |
| `telefone` | text | NO |  |
| `email` | text | YES |  |
| `cidade` | text | YES |  |
| `estado` | text | YES |  |
| `bairro` | text | YES |  |
| `segmento` | text | YES |  |
| `nicho` | USER-DEFINED | YES | 'outro'::lead_nicho |
| `place_id` | text | YES |  |
| `endereco` | text | YES |  |
| `website` | text | YES |  |
| `rating` | numeric | YES |  |
| `total_ratings` | integer | YES |  |
| `status` | USER-DEFINED | YES | 'prospectado'::lead_status |
| `produto_interesse` | USER-DEFINED | YES | 'indefinido'::lead_produto |
| `clickup_task_id` | text | YES |  |
| `whatsapp_enviado_em` | timestamp with time zone | YES |  |
| `email_enviado_em` | timestamp with time zone | YES |  |
| `tentativas_email` | integer | YES | 0 |
| `ultimo_contato_whatsapp` | timestamp with time zone | YES |  |
| `ultimo_contato_email` | timestamp with time zone | YES |  |
| `respondeu_em` | timestamp with time zone | YES |  |
| `observacoes` | text | YES |  |
| `criado_em` | timestamp with time zone | YES | now() |
| `atualizado_em` | timestamp with time zone | YES | now() |
| `whatsapp_enviado` | boolean | YES | false |
| `email_enviado` | boolean | YES | false |
| `primeiro_contato_em` | timestamp with time zone | YES |  |
| `tentativas_whatsapp` | integer | YES | 0 |
| `clickup_task_url` | text | YES |  |
| `motivo_descarte` | text | YES |  |
| `humano_assumiu` | boolean | NO | false |
| `humano_assumiu_em` | timestamp with time zone | YES |  |

#### `prospeccao.leads_atendimento_wpp_ysquad`

| column | type | nullable | default |
|---|---|---|---|
| `id` | integer | NO | nextval('prospeccao.leads_id_seq'::regclass) |
| `nome` | text | YES |  |
| `telefone` | text | NO |  |
| `status` | text | YES | 'novo'::text |
| `origem` | text | YES | 'whatsapp'::text |
| `created_at` | timestamp with time zone | YES | now() |

#### `prospeccao.leads_historico`

| column | type | nullable | default |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `lead_id` | uuid | YES |  |
| `canal` | text | NO |  |
| `tipo` | text | NO |  |
| `conteudo` | text | YES |  |
| `status_de` | USER-DEFINED | YES |  |
| `status_para` | USER-DEFINED | YES |  |
| `criado_em` | timestamp with time zone | YES | now() |

#### `prospeccao.logs_disparo`

| column | type | nullable | default |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `lead_id` | uuid | YES |  |
| `canal` | text | NO |  |
| `whatsapp_enviado` | boolean | YES | false |
| `email_enviado` | boolean | YES | false |
| `executado_em` | timestamp with time zone | NO | now() |
| `erro` | text | YES |  |

#### `prospeccao.n8n_chat_histories`

| column | type | nullable | default |
|---|---|---|---|
| `id` | integer | NO | nextval('prospeccao.n8n_chat_histories_id_seq'::regclass) |
| `session_id` | text | NO |  |
| `message` | jsonb | NO |  |
| `created_at` | timestamp with time zone | YES | now() |

#### `prospeccao.places_api_cache`

| column | type | nullable | default |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `cidade` | text | NO |  |
| `bairro` | text | NO |  |
| `nicho` | text | NO |  |
| `estado` | text | NO |  |
| `leads_retornados` | integer | YES | 0 |
| `leads_novos` | integer | YES | 0 |
| `leads_duplicados` | integer | YES | 0 |
| `requests_feitos` | integer | YES | 1 |
| `ultima_busca` | timestamp with time zone | NO | now() |
| `created_at` | timestamp with time zone | NO | now() |

#### `prospeccao.produtos_ysquad`

| column | type | nullable | default |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `categoria` | text | NO |  |
| `nome` | text | NO |  |
| `descricao` | text | YES |  |
| `entregaveis` | text | YES |  |
| `preco` | text | YES |  |
| `diferenciais` | text | YES |  |
| `objecoes_comuns` | text | YES |  |
| `cta` | text | YES |  |
| `ativo` | boolean | YES | true |
| `criado_em` | timestamp with time zone | YES | now() |

#### `prospeccao.prospeccao_estados`

| column | type | nullable | default |
|---|---|---|---|
| `id` | integer | NO | nextval('prospeccao.prospeccao_estados_id_seq'::regclass) |
| `sigla` | text | NO |  |
| `nome` | text | NO |  |
| `ordem` | integer | NO |  |
| `ativo` | boolean | YES | false |
| `iniciado_em` | timestamp with time zone | YES |  |
| `concluido_em` | timestamp with time zone | YES |  |

#### `prospeccao.vw_disparos_hoje`

| column | type | nullable | default |
|---|---|---|---|
| `total_disparos` | bigint | YES |  |
| `whatsapp_ok` | bigint | YES |  |
| `email_ok` | bigint | YES |  |

#### `prospeccao.workflow_execucoes`

| column | type | nullable | default |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `workflow_nome` | text | NO |  |
| `estado` | text | YES |  |
| `iniciado_em` | timestamp with time zone | NO | now() |
| `finalizado_em` | timestamp with time zone | YES |  |
| `status` | text | NO | 'rodando'::text |
| `requests_feitos` | integer | YES | 0 |
| `leads_inseridos` | integer | YES | 0 |
| `leads_duplicados` | integer | YES | 0 |
| `custo_estimado_brl` | numeric | YES | 0 |
| `motivo_parada` | text | YES |  |
| `erro_detalhe` | text | YES |  |

#### `public.agentes`

| column | type | nullable | default |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `nome` | text | NO |  |
| `cargo` | text | NO |  |
| `departamento` | USER-DEFINED | NO |  |
| `fase` | integer | NO | 1 |
| `avatar_skin` | text | NO | 'default'::text |
| `avatar_cor` | text | NO | '#C8F04D'::text |
| `posicao_mesa_x` | integer | NO |  |
| `posicao_mesa_y` | integer | NO |  |
| `workflow_n8n_id` | text | YES |  |
| `ativo` | boolean | NO | false |
| `pronto_para_ativacao` | boolean | NO | true |
| `observacoes_ativacao` | text | YES |  |
| `provedor_ia_padrao` | USER-DEFINED | YES | 'claude'::provedor_ia |
| `modelo_padrao` | text | YES | 'claude-sonnet-4-6'::text |
| `orcamento_dia` | numeric | YES | 50.00 |
| `privilegio_diretoria` | boolean | YES | false |
| `criado_em` | timestamp with time zone | NO | now() |
| `atualizado_em` | timestamp with time zone | NO | now() |
| `is_diretor` | boolean | YES |  |
| `custo_dia` | numeric | YES | 0 |
| `avatar_cor_cabelo` | text | YES |  |
| `avatar_cor_camisa` | text | YES |  |

#### `public.agentes_alertas`

| column | type | nullable | default |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `agente_id` | uuid | YES |  |
| `tipo` | text | NO |  |
| `severidade` | text | NO |  |
| `titulo` | text | NO |  |
| `resolvido` | boolean | YES | false |
| `created_at` | timestamp with time zone | NO | now() |
| `resolvido_em` | timestamp with time zone | YES |  |
| `mensagem` | text | YES |  |
| `agente_nome` | text | YES |  |

#### `public.agentes_atividades`

| column | type | nullable | default |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `agente_id` | uuid | NO |  |
| `tipo` | USER-DEFINED | NO |  |
| `descricao` | text | YES |  |
| `metadados` | jsonb | YES | '{}'::jsonb |
| `provedor_ia` | USER-DEFINED | YES |  |
| `modelo_usado` | text | YES |  |
| `tokens_input` | integer | YES | 0 |
| `tokens_output` | integer | YES | 0 |
| `custo_usd` | numeric | YES | 0 |
| `custo_brl` | numeric | YES | 0 |
| `duracao_ms` | integer | YES |  |
| `sucesso` | boolean | YES | true |
| `cliente_relacionado` | text | YES |  |
| `execution_id_n8n` | text | YES |  |
| `created_at` | timestamp with time zone | NO | now() |
| `agente_nome` | text | YES |  |

#### `public.agentes_handoffs`

| column | type | nullable | default |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `agente_origem_id` | uuid | NO |  |
| `agente_destino_id` | uuid | NO |  |
| `tipo_handoff` | text | NO |  |
| `payload` | jsonb | NO | '{}'::jsonb |
| `cliente_relacionado` | text | YES |  |
| `status` | text | YES | 'pendente'::text |
| `criado_em` | timestamp with time zone | YES | now() |
| `recebido_em` | timestamp with time zone | YES |  |
| `processado_em` | timestamp with time zone | YES |  |

#### `public.agentes_metricas_diarias`

| column | type | nullable | default |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `agente_id` | uuid | NO |  |
| `data` | date | NO |  |
| `execucoes` | integer | YES | 0 |
| `sucessos` | integer | YES | 0 |
| `erros` | integer | YES | 0 |
| `tokens_input_total` | integer | YES | 0 |
| `tokens_output_total` | integer | YES | 0 |
| `custo_brl_total` | numeric | YES | 0 |
| `leads_qualificados` | integer | YES | 0 |
| `agendamentos` | integer | YES | 0 |
| `vendas_fechadas` | integer | YES | 0 |
| `transferencias_humano` | integer | YES | 0 |
| `conteudos_publicados` | integer | YES | 0 |
| `relatorios_gerados` | integer | YES | 0 |
| `cobrancas_enviadas` | integer | YES | 0 |
| `tempo_ativo_segundos` | integer | YES | 0 |

#### `public.agentes_status`

| column | type | nullable | default |
|---|---|---|---|
| `agente_id` | uuid | NO |  |
| `status` | USER-DEFINED | NO | 'offline'::agente_status |
| `tarefa_atual` | text | YES |  |
| `contexto` | jsonb | YES | '{}'::jsonb |
| `ultimo_heartbeat` | timestamp with time zone | NO | now() |
| `iniciado_em` | timestamp with time zone | YES |  |
| `execution_id_n8n` | text | YES |  |
| `posicao_atual_x` | integer | YES |  |
| `posicao_atual_y` | integer | YES |  |
| `destino_x` | integer | YES |  |
| `destino_y` | integer | YES |  |
| `estado_movimento` | USER-DEFINED | YES | 'parado'::estado_movimento |
| `ponto_destino_codigo` | text | YES |  |
| `voltar_para_mesa_em` | timestamp with time zone | YES |  |
| `animacao` | text | YES | 'idle'::text |

#### `public.buffer_mensagens`

| column | type | nullable | default |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `telefone` | text | NO |  |
| `mensagem` | text | YES |  |
| `processado` | boolean | YES | false |
| `criado_em` | timestamp with time zone | YES | now() |

#### `public.cotacao_cambio`

| column | type | nullable | default |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `moeda` | text | NO |  |
| `valor_brl` | numeric | NO |  |
| `atualizado_em` | timestamp with time zone | YES | now() |

#### `public.erro_logs`

| column | type | nullable | default |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `origem` | text | YES |  |
| `erro` | text | YES |  |
| `telefone` | text | YES |  |
| `tipo` | text | YES |  |
| `criado_em` | timestamp with time zone | YES | now() |

#### `public.jarvis_memory`

| column | type | nullable | default |
|---|---|---|---|
| `id` | bigint | NO | nextval('jarvis_memory_id_seq'::regclass) |
| `user_id` | text | NO | 'ruan'::text |
| `role` | text | NO |  |
| `content` | text | NO |  |
| `created_at` | timestamp with time zone | NO | now() |
| `metadata` | jsonb | YES | '{}'::jsonb |

#### `public.pontos_escritorio`

| column | type | nullable | default |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `codigo` | text | NO |  |
| `nome` | text | NO |  |
| `descricao` | text | YES |  |
| `posicao_x` | integer | NO |  |
| `posicao_y` | integer | NO |  |
| `cor` | text | YES | '#7F77DD'::text |
| `icone` | text | YES |  |
| `significado_visual` | text | YES |  |

#### `public.precos_modelos`

| column | type | nullable | default |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `provedor` | USER-DEFINED | NO |  |
| `modelo` | text | NO |  |
| `custo_token_input_usd` | numeric | NO |  |
| `custo_token_output_usd` | numeric | NO |  |
| `unidade` | text | NO | 'token'::text |
| `ativo` | boolean | YES | true |
| `atualizado_em` | timestamp with time zone | YES | now() |

#### `public.v_agentes_completo`

| column | type | nullable | default |
|---|---|---|---|
| `id` | uuid | YES |  |
| `nome` | text | YES |  |
| `cargo` | text | YES |  |
| `departamento` | USER-DEFINED | YES |  |
| `ativo` | boolean | YES |  |
| `fase` | integer | YES |  |
| `is_diretor` | boolean | YES |  |
| `posicao_mesa_x` | integer | YES |  |
| `posicao_mesa_y` | integer | YES |  |
| `posicao_atual_x` | integer | YES |  |
| `posicao_atual_y` | integer | YES |  |
| `destino_x` | integer | YES |  |
| `destino_y` | integer | YES |  |
| `estado_movimento` | USER-DEFINED | YES |  |
| `animacao` | text | YES |  |
| `status` | USER-DEFINED | YES |  |
| `tarefa_atual` | text | YES |  |
| `ultimo_heartbeat` | timestamp with time zone | YES |  |
| `custo_dia` | numeric | YES |  |
| `orcamento_dia` | numeric | YES |  |
| `avatar_cor` | text | YES |  |
| `avatar_cor_cabelo` | text | YES |  |
| `avatar_cor_camisa` | text | YES |  |
| `observacoes_ativacao` | text | YES |  |

#### `public.v_agentes_reserva`

| column | type | nullable | default |
|---|---|---|---|
| `nome` | text | YES |  |
| `cargo` | text | YES |  |
| `departamento` | USER-DEFINED | YES |  |
| `fase_implementacao` | integer | YES |  |
| `pronto_para_ativacao` | boolean | YES |  |
| `observacoes_ativacao` | text | YES |  |
| `fase_descricao` | text | YES |  |

#### `sinuca.analises`

| column | type | nullable | default |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `lead_id` | uuid | YES |  |
| `agente` | text | YES |  |
| `coluna_destino` | text | YES |  |
| `justificativa` | text | YES |  |
| `acao` | text | YES |  |
| `criado_em` | timestamp with time zone | YES | now() |

#### `sinuca.leads`

| column | type | nullable | default |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `phone` | text | NO |  |
| `nome` | text | YES |  |
| `produto_interesse` | text | YES |  |
| `contexto_uso` | text | YES |  |
| `urgencia` | text | YES |  |
| `objecao` | text | YES |  |
| `agente_ativo` | text | YES | 'sdr'::text |
| `trello_card_id` | text | YES |  |
| `etapa_fup` | text | YES |  |
| `proximo_contato` | date | YES |  |
| `ultimo_contato` | timestamp with time zone | YES |  |
| `criado_em` | timestamp with time zone | YES | now() |
| `atualizado_em` | timestamp with time zone | YES | now() |

#### `sinuca.leads_para_analise`

| column | type | nullable | default |
|---|---|---|---|
| `id` | uuid | YES |  |
| `phone` | text | YES |  |
| `nome` | text | YES |  |
| `produto_interesse` | text | YES |  |
| `contexto_uso` | text | YES |  |
| `urgencia` | text | YES |  |
| `objecao` | text | YES |  |
| `agente_ativo` | text | YES |  |
| `trello_card_id` | text | YES |  |
| `etapa_fup` | text | YES |  |
| `proximo_contato` | date | YES |  |
| `ultimo_contato` | timestamp with time zone | YES |  |
| `criado_em` | timestamp with time zone | YES |  |
| `atualizado_em` | timestamp with time zone | YES |  |
| `historico` | text | YES |  |

#### `sinuca.mensagens`

| column | type | nullable | default |
|---|---|---|---|
| `id` | uuid | NO | gen_random_uuid() |
| `lead_id` | uuid | YES |  |
| `message_id` | text | YES |  |
| `role` | text | NO |  |
| `content` | text | NO |  |
| `criado_em` | timestamp with time zone | YES | now() |



## 5. Row Level Security

### 5.1 Status por tabela

| schemaname | tablename | rls_enabled |
|---|---|---|
| agente_noticias | abordagens | true |
| agente_noticias | coletas_log | true |
| agente_noticias | formatos | true |
| agente_noticias | ganchos | true |
| agente_noticias | ideias | true |
| agente_noticias | lotes_sinapses | true |
| agente_noticias | noticias | true |
| agente_noticias | roteiros | true |
| agente_noticias | sinapses | true |
| cron | job | true |
| cron | job_run_details | true |
| jarvis | briefings | true |
| jarvis | conversations | true |
| jarvis | facts | true |
| jarvis | messages | true |
| jarvis | scheduled_tasks | true |
| jarvis | tool_calls | true |
| prospeccao | _backup_teste_wf02 | true |
| prospeccao | agendamentos | false |
| prospeccao | bairros | false |
| prospeccao | buffer_mensagens | false |
| prospeccao | cidades | false |
| prospeccao | copy_followup | true |
| prospeccao | erro_logs | false |
| prospeccao | leads | false |
| prospeccao | leads_atendimento_wpp_ysquad | false |
| prospeccao | leads_historico | false |
| prospeccao | logs_disparo | false |
| prospeccao | n8n_chat_histories | false |
| prospeccao | places_api_cache | true |
| prospeccao | produtos_ysquad | false |
| prospeccao | prospeccao_estados | false |
| prospeccao | workflow_execucoes | true |
| public | agentes | true |
| public | agentes_alertas | true |
| public | agentes_atividades | true |
| public | agentes_handoffs | true |
| public | agentes_metricas_diarias | true |
| public | agentes_status | true |
| public | buffer_mensagens | false |
| public | cotacao_cambio | true |
| public | erro_logs | false |
| public | jarvis_memory | true |
| public | pontos_escritorio | true |
| public | precos_modelos | true |
| sinuca | analises | false |
| sinuca | leads | false |
| sinuca | mensagens | false |

### 5.2 Policies ativas

#### `agente_noticias.formatos`

| policy | command | permissive | roles | using | with_check |
|---|---|---|---|---|---|
| `acesso autenticado` | ALL | PERMISSIVE | {public} | `(auth.role() = 'authenticated'::text)` | `NULL` |

#### `agente_noticias.ganchos`

| policy | command | permissive | roles | using | with_check |
|---|---|---|---|---|---|
| `acesso autenticado` | ALL | PERMISSIVE | {public} | `(auth.role() = 'authenticated'::text)` | `NULL` |

#### `agente_noticias.ideias`

| policy | command | permissive | roles | using | with_check |
|---|---|---|---|---|---|
| `acesso autenticado` | ALL | PERMISSIVE | {public} | `(auth.role() = 'authenticated'::text)` | `NULL` |

#### `agente_noticias.roteiros`

| policy | command | permissive | roles | using | with_check |
|---|---|---|---|---|---|
| `acesso autenticado` | ALL | PERMISSIVE | {public} | `(auth.role() = 'authenticated'::text)` | `NULL` |

#### `agente_noticias.sinapses`

| policy | command | permissive | roles | using | with_check |
|---|---|---|---|---|---|
| `acesso liberado insert sinapses` | INSERT | PERMISSIVE | {anon,authenticated} | `NULL` | `true` |
| `acesso liberado select sinapses` | SELECT | PERMISSIVE | {anon,authenticated} | `true` | `NULL` |
| `acesso liberado update sinapses` | UPDATE | PERMISSIVE | {anon,authenticated} | `true` | `true` |

#### `cron.job`

| policy | command | permissive | roles | using | with_check |
|---|---|---|---|---|---|
| `cron_job_policy` | ALL | PERMISSIVE | {public} | `(username = CURRENT_USER)` | `NULL` |

#### `cron.job_run_details`

| policy | command | permissive | roles | using | with_check |
|---|---|---|---|---|---|
| `cron_job_run_details_policy` | ALL | PERMISSIVE | {public} | `(username = CURRENT_USER)` | `NULL` |

#### `jarvis.briefings`

| policy | command | permissive | roles | using | with_check |
|---|---|---|---|---|---|
| `Service role full access briefings` | ALL | PERMISSIVE | {service_role} | `true` | `true` |

#### `jarvis.conversations`

| policy | command | permissive | roles | using | with_check |
|---|---|---|---|---|---|
| `Service role full access conversations` | ALL | PERMISSIVE | {service_role} | `true` | `true` |

#### `jarvis.facts`

| policy | command | permissive | roles | using | with_check |
|---|---|---|---|---|---|
| `Service role full access facts` | ALL | PERMISSIVE | {service_role} | `true` | `true` |

#### `jarvis.messages`

| policy | command | permissive | roles | using | with_check |
|---|---|---|---|---|---|
| `Service role full access messages` | ALL | PERMISSIVE | {service_role} | `true` | `true` |

#### `jarvis.scheduled_tasks`

| policy | command | permissive | roles | using | with_check |
|---|---|---|---|---|---|
| `Service role full access scheduled_tasks` | ALL | PERMISSIVE | {service_role} | `true` | `true` |

#### `jarvis.tool_calls`

| policy | command | permissive | roles | using | with_check |
|---|---|---|---|---|---|
| `Service role full access tool_calls` | ALL | PERMISSIVE | {service_role} | `true` | `true` |

#### `public.agentes`

| policy | command | permissive | roles | using | with_check |
|---|---|---|---|---|---|
| `anon_read_agentes` | SELECT | PERMISSIVE | {anon} | `true` | `NULL` |

#### `public.agentes_alertas`

| policy | command | permissive | roles | using | with_check |
|---|---|---|---|---|---|
| `anon_read_agentes_alertas` | SELECT | PERMISSIVE | {anon} | `true` | `NULL` |

#### `public.agentes_atividades`

| policy | command | permissive | roles | using | with_check |
|---|---|---|---|---|---|
| `anon_read_agentes_atividades` | SELECT | PERMISSIVE | {anon} | `true` | `NULL` |

#### `public.agentes_handoffs`

| policy | command | permissive | roles | using | with_check |
|---|---|---|---|---|---|
| `anon_read_agentes_handoffs` | SELECT | PERMISSIVE | {anon} | `true` | `NULL` |

#### `public.agentes_metricas_diarias`

| policy | command | permissive | roles | using | with_check |
|---|---|---|---|---|---|
| `anon_read_agentes_metricas_diarias` | SELECT | PERMISSIVE | {anon} | `true` | `NULL` |

#### `public.agentes_status`

| policy | command | permissive | roles | using | with_check |
|---|---|---|---|---|---|
| `anon_read_agentes_status` | SELECT | PERMISSIVE | {anon} | `true` | `NULL` |

#### `public.cotacao_cambio`

| policy | command | permissive | roles | using | with_check |
|---|---|---|---|---|---|
| `anon_read_cotacao_cambio` | SELECT | PERMISSIVE | {anon} | `true` | `NULL` |

#### `public.jarvis_memory`

| policy | command | permissive | roles | using | with_check |
|---|---|---|---|---|---|
| `Service role full access` | ALL | PERMISSIVE | {service_role} | `true` | `true` |

#### `public.pontos_escritorio`

| policy | command | permissive | roles | using | with_check |
|---|---|---|---|---|---|
| `anon_read_pontos_escritorio` | SELECT | PERMISSIVE | {anon} | `true` | `NULL` |

#### `public.precos_modelos`

| policy | command | permissive | roles | using | with_check |
|---|---|---|---|---|---|
| `anon_read_precos_modelos` | SELECT | PERMISSIVE | {anon} | `true` | `NULL` |


## 6. Funções e Triggers

### 6.1 Funções

#### Funções de aplicação (user-defined)

| schema | function | arguments | return | security | config |
|---|---|---|---|---|---|
| agente_noticias | `atualizar_timestamp` | `` | trigger | INVOKER | NULL |
| agente_noticias | `set_atualizado_em` | `` | trigger | INVOKER | NULL |
| cron | `alter_job` | `job_id bigint, schedule text DEFAULT NULL::text, command text DEFAULT NULL::text, database text DEFAULT NULL::text, username text DEFAULT NULL::text, active boolean DEFAULT NULL::boolean` | void | INVOKER | NULL |
| cron | `job_cache_invalidate` | `` | trigger | INVOKER | NULL |
| cron | `schedule` | `job_name text, schedule text, command text` | bigint | INVOKER | NULL |
| cron | `schedule` | `schedule text, command text` | bigint | INVOKER | NULL |
| cron | `schedule_in_database` | `job_name text, schedule text, command text, database text, username text DEFAULT NULL::text, active boolean DEFAULT true` | bigint | INVOKER | NULL |
| cron | `unschedule` | `job_id bigint` | boolean | INVOKER | NULL |
| cron | `unschedule` | `job_name text` | boolean | INVOKER | NULL |
| jarvis | `clean_old_messages` | `days_to_keep integer DEFAULT 60` | integer | INVOKER | NULL |
| jarvis | `search_messages_semantic` | `query_embedding vector, match_threshold double precision DEFAULT 0.7, match_count integer DEFAULT 5, target_user_id text DEFAULT 'ruan'::text` | TABLE(id uuid, content text, role text, created_at timestamp with time zone, similarity double precision) | INVOKER | NULL |
| jarvis | `set_updated_at` | `` | trigger | INVOKER | NULL |
| jarvis | `update_conversation_on_message` | `` | trigger | INVOKER | NULL |
| prospeccao | `buscar_candidatos_followup` | `limite integer DEFAULT 10` | TABLE(id uuid, nome text, telefone text, email text, cidade text, estado text, segmento text, clickup_task_id text, tentativas_whatsapp integer, tentativas_email integer, ultimo_contato_whatsapp timestamp with time zone, ultimo_contato_email timestamp with time zone, apto_whatsapp boolean, apto_email boolean, proxima_tentativa integer) | DEFINER | search_path=prospeccao, public |
| prospeccao | `deve_buscar_places` | `p_cidade text, p_bairro text, p_nicho text, p_dias_ttl integer DEFAULT 30` | boolean | INVOKER | NULL |
| prospeccao | `limpar_cache_expirado` | `p_dias_ttl integer DEFAULT 30` | integer | INVOKER | NULL |
| prospeccao | `registrar_busca_places` | `p_cidade text, p_bairro text, p_nicho text, p_estado text, p_leads_retornados integer, p_leads_novos integer, p_leads_duplicados integer` | void | INVOKER | NULL |
| prospeccao | `update_atualizado_em` | `` | trigger | INVOKER | NULL |
| public | `array_to_halfvec` | `numeric[], integer, boolean` | halfvec | INVOKER | NULL |
| public | `array_to_halfvec` | `double precision[], integer, boolean` | halfvec | INVOKER | NULL |
| public | `array_to_halfvec` | `real[], integer, boolean` | halfvec | INVOKER | NULL |
| public | `array_to_halfvec` | `integer[], integer, boolean` | halfvec | INVOKER | NULL |
| public | `array_to_sparsevec` | `real[], integer, boolean` | sparsevec | INVOKER | NULL |
| public | `array_to_sparsevec` | `integer[], integer, boolean` | sparsevec | INVOKER | NULL |
| public | `array_to_sparsevec` | `numeric[], integer, boolean` | sparsevec | INVOKER | NULL |
| public | `array_to_sparsevec` | `double precision[], integer, boolean` | sparsevec | INVOKER | NULL |
| public | `array_to_vector` | `real[], integer, boolean` | vector | INVOKER | NULL |
| public | `array_to_vector` | `numeric[], integer, boolean` | vector | INVOKER | NULL |
| public | `array_to_vector` | `double precision[], integer, boolean` | vector | INVOKER | NULL |
| public | `array_to_vector` | `integer[], integer, boolean` | vector | INVOKER | NULL |
| public | `atualiza_metricas_diarias` | `` | trigger | INVOKER | NULL |
| public | `calcular_custo` | `p_provedor provedor_ia, p_modelo text, p_tokens_input integer, p_tokens_output integer` | TABLE(custo_usd numeric, custo_brl numeric) | INVOKER | NULL |
| public | `clean_old_jarvis_memory` | `days_to_keep integer DEFAULT 30` | integer | INVOKER | NULL |
| public | `detectar_agentes_travados` | `` | void | INVOKER | NULL |
| public | `halfvec_accum` | `double precision[], halfvec` | double precision[] | INVOKER | NULL |
| public | `halfvec_add` | `halfvec, halfvec` | halfvec | INVOKER | NULL |
| public | `halfvec_avg` | `double precision[]` | halfvec | INVOKER | NULL |
| public | `halfvec_cmp` | `halfvec, halfvec` | integer | INVOKER | NULL |
| public | `halfvec_combine` | `double precision[], double precision[]` | double precision[] | INVOKER | NULL |
| public | `halfvec_concat` | `halfvec, halfvec` | halfvec | INVOKER | NULL |
| public | `halfvec_eq` | `halfvec, halfvec` | boolean | INVOKER | NULL |
| public | `halfvec_ge` | `halfvec, halfvec` | boolean | INVOKER | NULL |
| public | `halfvec_gt` | `halfvec, halfvec` | boolean | INVOKER | NULL |
| public | `halfvec_in` | `cstring, oid, integer` | halfvec | INVOKER | NULL |
| public | `halfvec_l2_squared_distance` | `halfvec, halfvec` | double precision | INVOKER | NULL |
| public | `halfvec_le` | `halfvec, halfvec` | boolean | INVOKER | NULL |
| public | `halfvec_lt` | `halfvec, halfvec` | boolean | INVOKER | NULL |
| public | `halfvec_mul` | `halfvec, halfvec` | halfvec | INVOKER | NULL |
| public | `halfvec_ne` | `halfvec, halfvec` | boolean | INVOKER | NULL |
| public | `halfvec_negative_inner_product` | `halfvec, halfvec` | double precision | INVOKER | NULL |
| public | `halfvec_out` | `halfvec` | cstring | INVOKER | NULL |
| public | `halfvec_recv` | `internal, oid, integer` | halfvec | INVOKER | NULL |
| public | `halfvec_send` | `halfvec` | bytea | INVOKER | NULL |
| public | `halfvec_spherical_distance` | `halfvec, halfvec` | double precision | INVOKER | NULL |
| public | `halfvec_sub` | `halfvec, halfvec` | halfvec | INVOKER | NULL |
| public | `halfvec_to_float4` | `halfvec, integer, boolean` | real[] | INVOKER | NULL |
| public | `halfvec_to_sparsevec` | `halfvec, integer, boolean` | sparsevec | INVOKER | NULL |
| public | `halfvec_to_vector` | `halfvec, integer, boolean` | vector | INVOKER | NULL |
| public | `halfvec_typmod_in` | `cstring[]` | integer | INVOKER | NULL |
| public | `hnsw_bit_support` | `internal` | internal | INVOKER | NULL |
| public | `hnsw_halfvec_support` | `internal` | internal | INVOKER | NULL |
| public | `hnsw_sparsevec_support` | `internal` | internal | INVOKER | NULL |
| public | `hnswhandler` | `internal` | index_am_handler | INVOKER | NULL |
| public | `ivfflat_bit_support` | `internal` | internal | INVOKER | NULL |
| public | `ivfflat_halfvec_support` | `internal` | internal | INVOKER | NULL |
| public | `ivfflathandler` | `internal` | index_am_handler | INVOKER | NULL |
| public | `jarvis_get_facts` | `p_user_id text DEFAULT 'ruan'::text` | TABLE(category text, key text, value text) | DEFINER | search_path=public, jarvis |
| public | `mover_agente_para_ponto` | `p_agente_id uuid, p_ponto_codigo text, p_voltar_apos_segundos integer DEFAULT 5` | void | INVOKER | NULL |
| public | `populate_agente_nome` | `` | trigger | INVOKER | NULL |
| public | `sparsevec_cmp` | `sparsevec, sparsevec` | integer | INVOKER | NULL |
| public | `sparsevec_eq` | `sparsevec, sparsevec` | boolean | INVOKER | NULL |
| public | `sparsevec_ge` | `sparsevec, sparsevec` | boolean | INVOKER | NULL |
| public | `sparsevec_gt` | `sparsevec, sparsevec` | boolean | INVOKER | NULL |
| public | `sparsevec_in` | `cstring, oid, integer` | sparsevec | INVOKER | NULL |
| public | `sparsevec_l2_squared_distance` | `sparsevec, sparsevec` | double precision | INVOKER | NULL |
| public | `sparsevec_le` | `sparsevec, sparsevec` | boolean | INVOKER | NULL |
| public | `sparsevec_lt` | `sparsevec, sparsevec` | boolean | INVOKER | NULL |
| public | `sparsevec_ne` | `sparsevec, sparsevec` | boolean | INVOKER | NULL |
| public | `sparsevec_negative_inner_product` | `sparsevec, sparsevec` | double precision | INVOKER | NULL |
| public | `sparsevec_out` | `sparsevec` | cstring | INVOKER | NULL |
| public | `sparsevec_recv` | `internal, oid, integer` | sparsevec | INVOKER | NULL |
| public | `sparsevec_send` | `sparsevec` | bytea | INVOKER | NULL |
| public | `sparsevec_to_halfvec` | `sparsevec, integer, boolean` | halfvec | INVOKER | NULL |
| public | `sparsevec_to_vector` | `sparsevec, integer, boolean` | vector | INVOKER | NULL |
| public | `sparsevec_typmod_in` | `cstring[]` | integer | INVOKER | NULL |
| public | `update_atualizado_em` | `` | trigger | INVOKER | NULL |
| public | `vector_accum` | `double precision[], vector` | double precision[] | INVOKER | NULL |
| public | `vector_add` | `vector, vector` | vector | INVOKER | NULL |
| public | `vector_avg` | `double precision[]` | vector | INVOKER | NULL |
| public | `vector_cmp` | `vector, vector` | integer | INVOKER | NULL |
| public | `vector_combine` | `double precision[], double precision[]` | double precision[] | INVOKER | NULL |
| public | `vector_concat` | `vector, vector` | vector | INVOKER | NULL |
| public | `vector_dims` | `vector` | integer | INVOKER | NULL |
| public | `vector_dims` | `halfvec` | integer | INVOKER | NULL |
| public | `vector_eq` | `vector, vector` | boolean | INVOKER | NULL |
| public | `vector_ge` | `vector, vector` | boolean | INVOKER | NULL |
| public | `vector_gt` | `vector, vector` | boolean | INVOKER | NULL |
| public | `vector_in` | `cstring, oid, integer` | vector | INVOKER | NULL |
| public | `vector_l2_squared_distance` | `vector, vector` | double precision | INVOKER | NULL |
| public | `vector_le` | `vector, vector` | boolean | INVOKER | NULL |
| public | `vector_lt` | `vector, vector` | boolean | INVOKER | NULL |
| public | `vector_mul` | `vector, vector` | vector | INVOKER | NULL |
| public | `vector_ne` | `vector, vector` | boolean | INVOKER | NULL |
| public | `vector_negative_inner_product` | `vector, vector` | double precision | INVOKER | NULL |
| public | `vector_norm` | `vector` | double precision | INVOKER | NULL |
| public | `vector_out` | `vector` | cstring | INVOKER | NULL |
| public | `vector_recv` | `internal, oid, integer` | vector | INVOKER | NULL |
| public | `vector_send` | `vector` | bytea | INVOKER | NULL |
| public | `vector_spherical_distance` | `vector, vector` | double precision | INVOKER | NULL |
| public | `vector_sub` | `vector, vector` | vector | INVOKER | NULL |
| public | `vector_to_float4` | `vector, integer, boolean` | real[] | INVOKER | NULL |
| public | `vector_to_halfvec` | `vector, integer, boolean` | halfvec | INVOKER | NULL |
| public | `vector_to_sparsevec` | `vector, integer, boolean` | sparsevec | INVOKER | NULL |
| public | `vector_typmod_in` | `cstring[]` | integer | INVOKER | NULL |
| public | `verifica_orcamento` | `` | trigger | INVOKER | NULL |
| public | `voltar_agentes_para_mesa` | `` | integer | INVOKER | NULL |
| sinuca | `fn_set_atualizado_em` | `` | trigger | INVOKER | NULL |

#### Funções do `pgvector` (extensão, schema `public`) — 30 funções omitidas para clareza

Inclui `array_to_*`, `halfvec_*`, `sparsevec_*`, `vector_*`, `hnsw*`, `ivfflat*`, `l1_distance`, `l2_distance`, `l2_norm`, `l2_normalize`, `cosine_distance`, `inner_product`, `binary_quantize`, `jaccard_distance`, `hamming_distance`, `subvector`, `avg`, `sum`. Todas `INVOKER`, sem `config`.

### 6.2 Triggers

| schema | table | trigger_name | event_manipulation | action_timing |
|---|---|---|---|---|
| agente_noticias | abordagens | trg_abordagens_atualizado_em | UPDATE | BEFORE |
| agente_noticias | ideias | trg_ideias_atualizado_em | UPDATE | BEFORE |
| agente_noticias | lotes_sinapses | trg_lotes_sinapses_atualizado_em | UPDATE | BEFORE |
| agente_noticias | noticias | tr_noticias_updated | UPDATE | BEFORE |
| agente_noticias | roteiros | trg_roteiros_atualizado_em | UPDATE | BEFORE |
| agente_noticias | sinapses | trg_sinapses_atualizado_em | UPDATE | BEFORE |
| jarvis | facts | trg_facts_updated_at | UPDATE | BEFORE |
| jarvis | messages | trg_update_conversation_on_message | INSERT | AFTER |
| prospeccao | leads | lead_criado_clickup | INSERT | AFTER |
| prospeccao | leads | trg_leads_atualizado_em | UPDATE | BEFORE |
| public | agentes_alertas | trg_populate_agente_nome_alertas | INSERT | BEFORE |
| public | agentes_atividades | trg_atualiza_metricas | INSERT | AFTER |
| public | agentes_atividades | trg_populate_agente_nome_atividades | INSERT | BEFORE |
| public | agentes_metricas_diarias | trg_verifica_orcamento | UPDATE | AFTER |
| sinuca | leads | trg_leads_atualizado_em | UPDATE | BEFORE |

## 7. Auth
- Total de usuários em `auth.users`: **2**

## 8. Extensões instaladas

| extname | extversion |
|---|---|
| pg_cron | 1.6.4 |
| pg_net | 0.19.5 |
| pg_stat_statements | 1.11 |
| pgcrypto | 1.3 |
| plpgsql | 1.0 |
| supabase_vault | 0.3.1 |
| uuid-ossp | 1.1 |
| vector | 0.8.0 |

## 9. Migrations

```
Initialising login role...
Connecting to remote database...

  
   Local          | Remote | Time (UTC)          
  ----------------|--------|---------------------
   20260316172646 |        | 2026-03-16 17:26:46 

<claude-code-hint v="1" type="plugin" value="supabase@claude-plugins-official" />
A new version of Supabase CLI is available: v2.98.2 (currently installed v2.98.1)
We recommend updating regularly for new features and bug fixes: https://supabase.com/docs/guides/cli/getting-started#updating-the-supabase-cli
```

> Leitura: existe **1 migração local** (`20260316172646_b1d778d4-7f30-40bc-93a8-82ce8deabccd.sql`) **ainda não aplicada ao remoto** — a coluna `Remote` está vazia. Essa migração cria `public.profiles`, função `public.update_updated_at_column()`, função `public.handle_new_user()` (SECURITY DEFINER), trigger `on_auth_user_created` em `auth.users` e três policies de `profiles`. Nenhum desses objetos existe no banco remoto.

## 10. Edge Functions

```

  
   ID                                   | NAME             | SLUG             | STATUS | VERSION | UPDATED_AT (UTC)    
  --------------------------------------|------------------|------------------|--------|---------|---------------------
   e12971fc-1364-46ac-9f34-b9c27b3f489a | gerar-ideias     | gerar-ideias     | ACTIVE | 9       | 2026-04-23 00:02:13 
   81add7fa-a08c-4e52-a7f3-b28bee0d9a46 | agente-heartbeat | agente-heartbeat | ACTIVE | 8       | 2026-04-25 22:18:23 
   0cab1791-f645-463d-9cbd-6ff22d730ea3 | gerar-roteiro    | gerar-roteiro    | ACTIVE | 11      | 2026-05-11 01:28:56 
   01d59be4-bc22-414b-8495-77349192b516 | gerar-sinapses   | gerar-sinapses   | ACTIVE | 9       | 2026-05-11 01:10:12 
   e311c521-126c-4573-8a30-c7802d44581e | gerar-abordagens | gerar-abordagens | ACTIVE | 6       | 2026-05-11 01:26:33 

<claude-code-hint v="1" type="plugin" value="supabase@claude-plugins-official" />
A new version of Supabase CLI is available: v2.98.2 (currently installed v2.98.1)
We recommend updating regularly for new features and bug fixes: https://supabase.com/docs/guides/cli/getting-started#updating-the-supabase-cli
```

> Todas as 5 edge functions ativas pertencem a outros projetos do workspace (`agente_noticias` / `agentes`). **Nenhuma edge function relacionada a Meta Ads ou OAuth do dashboard existe.**

## 11. Schemas expostos via PostgREST

> Pendente de verificação manual em **Supabase Dashboard → Project Settings → API → Exposed Schemas**. O comando CLI não expõe essa configuração de forma confiável nesta versão (2.98.1).

## 12. Auditoria de código

### 12.1 Imports `@/lib/supabase`
```
src/components/dashboard/ConversionFunnel.tsx:2:import { MetaAdsInsight } from "@/lib/supabase";
src/components/dashboard/KpiCards.tsx:2:import { MetaAdsInsight } from "@/lib/supabase";
src/components/dashboard/MetricsChart.tsx:2:import { MetaAdsInsight } from "@/lib/supabase";
src/components/dashboard/DataTable.tsx:2:import { MetaAdsInsight } from "@/lib/supabase";
src/pages/Index.tsx:3:import { supabase, MetaAdsInsight } from "@/lib/supabase";
```

### 12.2 Imports `@/integrations/supabase`
```
src/integrations/supabase/client.ts:9:// import { supabase } from "@/integrations/supabase/client";
src/pages/GA4.tsx:10:import { supabase } from "@/integrations/supabase/client";
```

### 12.3 Referências ao project ref descartado (carczuzkctggguvgnpwy)
```
.env:1:VITE_SUPABASE_PROJECT_ID="carczuzkctggguvgnpwy"
.env:3:VITE_SUPABASE_URL="https://carczuzkctggguvgnpwy.supabase.co"
supabase/config.toml:1:project_id = "carczuzkctggguvgnpwy"
```

### 12.4 Referências ao project ref oficial (xxzupolczwyrtnunzjhf)
```
supabase/.temp/linked-project.json:1:{"ref":"xxzupolczwyrtnunzjhf","name":"ruan.malta@ysquad.com.br's Project","organization_id":"yrsiratxggusejihxdpd","organization_slug":"yrsiratxggusejihxdpd"}
src/lib/supabase.ts:3:const SUPABASE_URL = "https://xxzupolczwyrtnunzjhf.supabase.co";
```

### 12.5 Conteúdo do `.env`
```
VITE_SUPABASE_PROJECT_ID="carczuzkctggguvgnpwy"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhcmN6dXprY3RnZ2d1dmducHd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2Nzk0MTgsImV4cCI6MjA4OTI1NTQxOH0.zWKMqVdkzAJlLCgLLolCm9l9hIzqXrk9-irsFTQA0-Y"
VITE_SUPABASE_URL="https://carczuzkctggguvgnpwy.supabase.co"
```

### 12.6 Conteúdo do `.gitignore`
```
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
```

### 12.7 Árvore de arquivos de código
```
src/App.tsx
src/components/AppSidebar.tsx
src/components/dashboard/ConversionFunnel.tsx
src/components/dashboard/DataTable.tsx
src/components/dashboard/FilterBar.tsx
src/components/dashboard/KpiCards.tsx
src/components/dashboard/MetricsChart.tsx
src/components/dashboard/MetricSelector.tsx
src/components/dashboard/ThemeToggle.tsx
src/components/NavLink.tsx
src/components/ui/accordion.tsx
src/components/ui/alert-dialog.tsx
src/components/ui/alert.tsx
src/components/ui/aspect-ratio.tsx
src/components/ui/avatar.tsx
src/components/ui/badge.tsx
src/components/ui/breadcrumb.tsx
src/components/ui/button.tsx
src/components/ui/calendar.tsx
src/components/ui/card.tsx
src/components/ui/carousel.tsx
src/components/ui/chart.tsx
src/components/ui/checkbox.tsx
src/components/ui/collapsible.tsx
src/components/ui/command.tsx
src/components/ui/context-menu.tsx
src/components/ui/dialog.tsx
src/components/ui/drawer.tsx
src/components/ui/dropdown-menu.tsx
src/components/ui/form.tsx
src/components/ui/hover-card.tsx
src/components/ui/input-otp.tsx
src/components/ui/input.tsx
src/components/ui/label.tsx
src/components/ui/menubar.tsx
src/components/ui/navigation-menu.tsx
src/components/ui/pagination.tsx
src/components/ui/popover.tsx
src/components/ui/progress.tsx
src/components/ui/radio-group.tsx
src/components/ui/resizable.tsx
src/components/ui/scroll-area.tsx
src/components/ui/select.tsx
src/components/ui/separator.tsx
src/components/ui/sheet.tsx
src/components/ui/sidebar.tsx
src/components/ui/skeleton.tsx
src/components/ui/slider.tsx
src/components/ui/sonner.tsx
src/components/ui/switch.tsx
src/components/ui/table.tsx
src/components/ui/tabs.tsx
src/components/ui/textarea.tsx
src/components/ui/toast.tsx
src/components/ui/toaster.tsx
src/components/ui/toggle-group.tsx
src/components/ui/toggle.tsx
src/components/ui/tooltip.tsx
src/components/ui/use-toast.ts
src/hooks/use-mobile.tsx
src/hooks/use-toast.ts
src/integrations/lovable/index.ts
src/integrations/supabase/client.ts
src/integrations/supabase/types.ts
src/lib/supabase.ts
src/lib/utils.ts
src/main.tsx
src/pages/GA4.tsx
src/pages/Index.tsx
src/pages/Integracao.tsx
src/pages/NotFound.tsx
src/test/example.test.ts
src/test/setup.ts
src/vite-env.d.ts
supabase/config.toml
supabase/migrations/20260316172646_b1d778d4-7f30-40bc-93a8-82ce8deabccd.sql
```

## 13. Anomalias detectadas

### 13.1 Arquitetura paralela de clients Supabase (CRÍTICO)
Coexistem dois clients que apontam para projetos diferentes:

- `src/lib/supabase.ts` — **anon key e URL hardcoded** para `xxzupolczwyrtnunzjhf` (oficial). Declara o type `MetaAdsInsight`. É importado por 5 arquivos: `ConversionFunnel.tsx`, `KpiCards.tsx`, `MetricsChart.tsx`, `DataTable.tsx`, `Index.tsx`.
- `src/integrations/supabase/client.ts` — lê `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` do `.env`, **que apontam para `carczuzkctggguvgnpwy` (descartado)**. É importado por 1 arquivo: `src/pages/GA4.tsx`.

Consequência: rodando o app hoje, a rota `/` (Index) consulta o projeto oficial e a rota `/GA4` consulta um projeto que será descartado. O comportamento depende da página visitada.

### 13.2 Tabelas esperadas pelo código não existem no banco oficial (CRÍTICO)
- `src/lib/supabase.ts` declara o type `MetaAdsInsight` (campos `account_id, campaign_id, adset_id, ad_id, impressions, spend, cpm, ctr, cpc, frequency, ...`). **Nenhuma tabela `meta_ads_*` ou equivalente existe** em `xxzupolczwyrtnunzjhf` — todas as tabelas em `public` pertencem a outros projetos (jarvis, agentes, cotacao_cambio, etc).
- `src/integrations/supabase/types.ts` declara `public.profiles`. A tabela **não existe** no remoto (não aparece em `pg_tables`). Só existirá quando a migração local 20260316172646 for aplicada.

### 13.3 Migração local não aplicada
A migração `supabase/migrations/20260316172646_b1d778d4-7f30-40bc-93a8-82ce8deabccd.sql` cria `public.profiles`, `update_updated_at_column`, `handle_new_user` (SECURITY DEFINER) e trigger `on_auth_user_created`. **Ainda não foi pushada ao remoto** (`supabase migration list` mostra coluna `Remote` vazia).

### 13.4 `.env` versionado e fora do `.gitignore` (segurança)
- `.env` está commitado no repositório (clonado direto do GitHub).
- `.env` **não consta no `.gitignore`** (foi verificado o conteúdo completo do `.gitignore`).
- Embora a anon key seja pública por design, expor publicamente o project ref a ser descartado mantém referências mortas e dificulta a rotação. Mais importante: o padrão do repo aceita `.env` versionado, que será problema quando entrar uma service_role key ou client_secret OAuth.

### 13.5 `supabase/config.toml` aponta para o projeto descartado
```
project_id = "carczuzkctggguvgnpwy"
```
Apesar disso, `supabase link --project-ref xxzupolczwyrtnunzjhf` aceitou e gravou o link em `supabase/.temp/linked-project.json`. Há ambiguidade entre `config.toml` e o link efetivo — operações futuras (`migration new`, `db push`) podem se comportar de forma inesperada dependendo de qual fonte a CLI privilegia em cada contexto.

### 13.6 RLS desabilitado em tabelas com dados (CRÍTICO)
Tabelas com `rowsecurity = false` que **possuem linhas** e/ou estão em schemas potencialmente expostos:

- `prospeccao.bairros` (170 linhas) — RLS off
- `prospeccao.cidades` (40 linhas) — RLS off
- `prospeccao.leads` (420 linhas) — RLS off
- `prospeccao.leads_atendimento_wpp_ysquad` (3 linhas) — RLS off
- `prospeccao.erro_logs` (11 linhas) — RLS off
- `prospeccao.produtos_ysquad` (3 linhas) — RLS off
- `prospeccao.prospeccao_estados` (17 linhas) — RLS off
- `public.erro_logs` (3 linhas) — RLS off, **schema public**, exposto ao PostgREST por padrão. Erros e telefones expostos.
- `sinuca.analises`, `sinuca.leads`, `sinuca.mensagens` — RLS off (vazias hoje, mas vão receber dados)
- Vazias e com RLS off: `prospeccao.agendamentos`, `prospeccao.buffer_mensagens`, `prospeccao.leads_historico`, `prospeccao.logs_disparo`, `prospeccao.n8n_chat_histories`, `public.buffer_mensagens`.

Os schemas `prospeccao` e `sinuca` podem não estar expostos no PostgREST — **verificação manual da seção 11 é crítica** para definir o impacto público real.

### 13.7 Policies frouxas (`USING (true)`)
- `public.agentes`, `public.agentes_alertas`, `public.agentes_atividades`, `public.agentes_handoffs`, `public.agentes_metricas_diarias`, `public.agentes_status`, `public.cotacao_cambio`, `public.pontos_escritorio`, `public.precos_modelos` — todas com policy `SELECT` para role `anon` com `USING (true)`. Leitura pública total dessas tabelas.
- `agente_noticias.sinapses` — `SELECT/INSERT/UPDATE` para `anon, authenticated` com `USING (true)` e `WITH CHECK (true)`. Escrita pública.

Pode ser intencional para apps de leitura pública (dashboard jarvis/agentes), mas vale confirmação explícita.

### 13.8 Funções SECURITY DEFINER
Apenas duas funções `DEFINER` existem hoje, **ambas com `search_path` setado** (mitigação contra hijack):
- `prospeccao.buscar_candidatos_followup` — `search_path=prospeccao, public`
- `public.jarvis_get_facts` — `search_path=public, jarvis`

Nenhuma DEFINER órfã. A migração não aplicada (13.3) introduzirá `public.handle_new_user` que também é DEFINER com `search_path` — OK.

### 13.9 Schema `marketing` ainda não existe
O plano do Sprint 1 prevê criar o schema `marketing`. Confirmado: **não existe nenhum schema `marketing` hoje**. Os 6 schemas user-defined (`agente_noticias, cron, jarvis, prospeccao, public, sinuca`) são todos de outros projetos do workspace. **Este Supabase é compartilhado entre projetos distintos**, não é exclusivo do dashboard.

### 13.10 Dois clients = dois auth states
`src/integrations/supabase/client.ts` configura `persistSession: true, autoRefreshToken: true`. `src/lib/supabase.ts` usa defaults sem opção explícita. Se ambos forem usados na mesma sessão (e hoje **são** — `Index` e `GA4`), haverá dois objetos `supabase` em memória, dois storage keys de auth, comportamentos divergentes de refresh.

### 13.11 Resíduo de output da CLI nos resultados SQL
Cada chamada `supabase db query --linked --agent no --output csv` injeta a linha `<claude-code-hint v="1" type="plugin" value="supabase@claude-plugins-official" />` ao final do output. Não é dado real do banco — foi filtrado nas seções acima. Registrado apenas para futuros usuários da auditoria não confundirem.

## 14. Arquivos temporários criados (a serem apagados)

- `audit_queries.sql`
- `audit_db_raw.txt`
- `audit_columns_md.txt`
- `audit_migrations.txt`
- `audit_functions.txt`
- `audit_imports_old.txt`
- `audit_imports_new.txt`
- `audit_ref_old.txt`
- `audit_ref_new.txt`
- `audit_env.txt`
- `audit_gitignore.txt`
- `audit_tree.txt`
