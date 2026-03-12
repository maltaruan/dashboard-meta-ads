import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase, MetaAdsInsight } from "@/lib/supabase";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { MetricSelector } from "@/components/dashboard/MetricSelector";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { MetricsChart } from "@/components/dashboard/MetricsChart";
import { DataTable } from "@/components/dashboard/DataTable";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3 } from "lucide-react";

export type MetricKey = "impressions" | "reach" | "clicks" | "spend" | "cpm" | "ctr" | "cpc" | "frequency";

export const ALL_METRICS: { key: MetricKey; label: string }[] = [
  { key: "impressions", label: "Impressions" },
  { key: "reach", label: "Reach" },
  { key: "clicks", label: "Clicks" },
  { key: "spend", label: "Spend" },
  { key: "cpm", label: "CPM" },
  { key: "ctr", label: "CTR" },
  { key: "cpc", label: "CPC" },
  { key: "frequency", label: "Frequency" },
];

const getInitialMetrics = (): MetricKey[] => {
  try {
    const saved = localStorage.getItem("meta-ads-metrics");
    if (saved) {
      const parsed = JSON.parse(saved) as MetricKey[];
      if (parsed.length > 0) return parsed;
    }
  } catch {}
  return ["impressions", "spend", "ctr", "cpc"];
};

const Index = () => {
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [selectedAdSets, setSelectedAdSets] = useState<string[]>([]);
  const [selectedAds, setSelectedAds] = useState<string[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<MetricKey[]>(getInitialMetrics);

  useEffect(() => {
    localStorage.setItem("meta-ads-metrics", JSON.stringify(selectedMetrics));
  }, [selectedMetrics]);

  const { data: rawData, isLoading } = useQuery({
    queryKey: ["meta-ads-insights"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meta_ads_insights")
        .select("*")
        .order("date_start", { ascending: true });
      if (error) throw error;
      return data as MetaAdsInsight[];
    },
  });

  const filteredData = useMemo(() => {
    if (!rawData) return [];
    return rawData.filter((row) => {
      if (dateRange.from && new Date(row.date_start) < dateRange.from) return false;
      if (dateRange.to && new Date(row.date_start) > dateRange.to) return false;
      if (selectedCampaigns.length > 0 && !selectedCampaigns.includes(row.campaign_name)) return false;
      if (selectedAdSets.length > 0 && !selectedAdSets.includes(row.adset_name)) return false;
      if (selectedAds.length > 0 && !selectedAds.includes(row.ad_name)) return false;
      return true;
    });
  }, [rawData, dateRange, selectedCampaigns, selectedAdSets, selectedAds]);

  const campaigns = useMemo(() => [...new Set(rawData?.map((r) => r.campaign_name) ?? [])].sort(), [rawData]);
  const adSets = useMemo(() => {
    const source = selectedCampaigns.length > 0 ? rawData?.filter((r) => selectedCampaigns.includes(r.campaign_name)) : rawData;
    return [...new Set(source?.map((r) => r.adset_name) ?? [])].sort();
  }, [rawData, selectedCampaigns]);
  const ads = useMemo(() => {
    let source = rawData ?? [];
    if (selectedCampaigns.length > 0) source = source.filter((r) => selectedCampaigns.includes(r.campaign_name));
    if (selectedAdSets.length > 0) source = source.filter((r) => selectedAdSets.includes(r.adset_name));
    return [...new Set(source.map((r) => r.ad_name))].sort();
  }, [rawData, selectedCampaigns, selectedAdSets]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-bold text-foreground">Meta Ads Dashboard</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container py-6 space-y-6">
        <FilterBar
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          campaigns={campaigns}
          selectedCampaigns={selectedCampaigns}
          onCampaignsChange={setSelectedCampaigns}
          adSets={adSets}
          selectedAdSets={selectedAdSets}
          onAdSetsChange={setSelectedAdSets}
          ads={ads}
          selectedAds={selectedAds}
          onAdsChange={setSelectedAds}
        />

        <MetricSelector selected={selectedMetrics} onChange={setSelectedMetrics} />

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mb-4 opacity-40" />
            <p className="text-lg font-medium">Nenhum dado encontrado</p>
            <p className="text-sm">Ajuste os filtros para visualizar os dados.</p>
          </div>
        ) : (
          <>
            <KpiCards data={filteredData} metrics={selectedMetrics} />
            <MetricsChart data={filteredData} metrics={selectedMetrics} />
            <DataTable data={filteredData} metrics={selectedMetrics} />
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
