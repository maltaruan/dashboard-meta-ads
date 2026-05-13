// Domain types — Meta Ads.
// Este formato existe por compatibilidade com os componentes legados
// (Index, KpiCards, MetricsChart, DataTable, ConversionFunnel).
// No Sprint 3 será substituído por uma camada que lê de dashboard.metrics_cache
// (JSON polimórfico) e mapeia para o shape correto por provider.

export type MetaAdsInsight = {
  account_id: string;
  campaign_id: string;
  campaign_name: string;
  adset_id: string;
  adset_name: string;
  ad_id: string;
  ad_name: string;
  objective: string;
  impressions: number;
  reach: number;
  clicks: number;
  spend: number;
  cpm: number;
  ctr: number;
  cpc: number;
  frequency: number;
  date_start: string;
  date_stop: string;
};
