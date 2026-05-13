// Generated manually from migration 20260513214351_create_dashboard_schema.sql
// (PostgREST schema cache wasn't reachable when running
// `supabase gen types typescript --linked --schema dashboard` — the
// `dashboard` schema isn't yet listed in Project Settings → API → Exposed
// Schemas. Once it is, re-run that command to regenerate this file.)

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  dashboard: {
    Tables: {
      accounts: {
        Row: {
          id: string
          name: string
          slug: string
          is_internal: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          is_internal?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          is_internal?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      account_members: {
        Row: {
          id: string
          account_id: string
          user_id: string
          role: 'owner' | 'operator' | 'client'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          account_id: string
          user_id: string
          role: 'owner' | 'operator' | 'client'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          account_id?: string
          user_id?: string
          role?: 'owner' | 'operator' | 'client'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_members_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          id: string
          account_id: string
          provider: 'meta_ads' | 'google_ads' | 'youtube' | 'ga4'
          external_account_id: string | null
          external_account_name: string | null
          status: 'disconnected' | 'connected' | 'error' | 'expired'
          last_sync_at: string | null
          last_error: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          account_id: string
          provider: 'meta_ads' | 'google_ads' | 'youtube' | 'ga4'
          external_account_id?: string | null
          external_account_name?: string | null
          status?: 'disconnected' | 'connected' | 'error' | 'expired'
          last_sync_at?: string | null
          last_error?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          account_id?: string
          provider?: 'meta_ads' | 'google_ads' | 'youtube' | 'ga4'
          external_account_id?: string | null
          external_account_name?: string | null
          status?: 'disconnected' | 'connected' | 'error' | 'expired'
          last_sync_at?: string | null
          last_error?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integrations_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      oauth_tokens: {
        Row: {
          id: string
          integration_id: string
          account_id: string
          access_token: string
          refresh_token: string | null
          token_type: string
          expires_at: string | null
          scope: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          integration_id: string
          account_id: string
          access_token: string
          refresh_token?: string | null
          token_type?: string
          expires_at?: string | null
          scope?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          integration_id?: string
          account_id?: string
          access_token?: string
          refresh_token?: string | null
          token_type?: string
          expires_at?: string | null
          scope?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "oauth_tokens_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: true
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oauth_tokens_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      metrics_cache: {
        Row: {
          id: string
          account_id: string
          integration_id: string
          provider: 'meta_ads' | 'google_ads' | 'youtube' | 'ga4'
          metric_date: string
          dimension_key: string
          dimension_value: string
          metrics: Json
          fetched_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          account_id: string
          integration_id: string
          provider: 'meta_ads' | 'google_ads' | 'youtube' | 'ga4'
          metric_date: string
          dimension_key: string
          dimension_value: string
          metrics: Json
          fetched_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          account_id?: string
          integration_id?: string
          provider?: 'meta_ads' | 'google_ads' | 'youtube' | 'ga4'
          metric_date?: string
          dimension_key?: string
          dimension_value?: string
          metrics?: Json
          fetched_at?: string
          expires_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "metrics_cache_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metrics_cache_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_logs: {
        Row: {
          id: string
          account_id: string
          integration_id: string | null
          provider: string
          status: 'success' | 'partial' | 'error'
          records_synced: number
          duration_ms: number | null
          error_message: string | null
          metadata: Json
          started_at: string
          finished_at: string | null
        }
        Insert: {
          id?: string
          account_id: string
          integration_id?: string | null
          provider: string
          status: 'success' | 'partial' | 'error'
          records_synced?: number
          duration_ms?: number | null
          error_message?: string | null
          metadata?: Json
          started_at?: string
          finished_at?: string | null
        }
        Update: {
          id?: string
          account_id?: string
          integration_id?: string | null
          provider?: string
          status?: 'success' | 'partial' | 'error'
          records_synced?: number
          duration_ms?: number | null
          error_message?: string | null
          metadata?: Json
          started_at?: string
          finished_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sync_logs_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sync_logs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      client_metric_visibility: {
        Row: {
          id: string
          account_id: string
          provider: 'meta_ads' | 'google_ads' | 'youtube' | 'ga4'
          metric_key: string
          is_visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          account_id: string
          provider: 'meta_ads' | 'google_ads' | 'youtube' | 'ga4'
          metric_key: string
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          account_id?: string
          provider?: 'meta_ads' | 'google_ads' | 'youtube' | 'ga4'
          metric_key?: string
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_metric_visibility_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_user_account_ids: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      current_user_has_role: {
        Args: { p_account_id: string; p_roles: string[] }
        Returns: boolean
      }
      handle_new_user: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      set_updated_at: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
