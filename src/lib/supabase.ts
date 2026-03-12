import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://xxzupolczwyrtnunzjhf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4enVwb2xjend5cnRudW56amhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MDA5OTgsImV4cCI6MjA2OTI3Njk5OH0.YURX65fJg4-FV35RInZnsh18zxpW4Lx3X9IN_McpkuU";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
