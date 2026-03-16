import { useMemo } from "react";
import { MetaAdsInsight } from "@/lib/supabase";
import { MetricKey, ALL_METRICS } from "@/pages/Index";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Eye, MousePointerClick, DollarSign, BarChart2, Percent, Repeat } from "lucide-react";

const ICON_CONFIGS: Record<MetricKey, { icon: React.ElementType; bg: string; fg: string }> = {
  impressions: { icon: Eye, bg: "bg-primary/10", fg: "text-primary" },
  reach: { icon: BarChart2, bg: "bg-primary/10", fg: "text-primary" },
  clicks: { icon: MousePointerClick, bg: "bg-primary/10", fg: "text-primary" },
  spend: { icon: DollarSign, bg: "hsl(35 92% 55% / 0.1)", fg: "hsl(35 92% 45%)" },
  cpm: { icon: TrendingUp, bg: "bg-primary/10", fg: "text-primary" },
  ctr: { icon: Percent, bg: "bg-primary/10", fg: "text-primary" },
  cpc: { icon: DollarSign, bg: "bg-primary/10", fg: "text-primary" },
  frequency: { icon: Repeat, bg: "bg-primary/10", fg: "text-primary" },
};

export function formatMetric(key: MetricKey, value: number): string {
  switch (key) {
    case "spend":
    case "cpm":
    case "cpc":
      return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case "ctr":
    case "frequency":
      return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    default:
      return value.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
  }
}

function computeTotal(data: MetaAdsInsight[], key: MetricKey): number {
  if (key === "cpm" || key === "ctr" || key === "cpc" || key === "frequency") {
    const sum = data.reduce((acc, r) => acc + Number(r[key] ?? 0), 0);
    return data.length > 0 ? sum / data.length : 0;
  }
  return data.reduce((acc, r) => acc + Number(r[key] ?? 0), 0);
}

interface KpiCardsProps {
  data: MetaAdsInsight[];
  metrics: MetricKey[];
  previousData?: MetaAdsInsight[];
}

export function KpiCards({ data, metrics, previousData }: KpiCardsProps) {
  const comparisons = useMemo(() => {
    if (!previousData || previousData.length === 0) return null;
    const result: Record<MetricKey, number> = {} as any;
    metrics.forEach((key) => {
      const current = computeTotal(data, key);
      const previous = computeTotal(previousData, key);
      result[key] = previous > 0 ? ((current - previous) / previous) * 100 : 0;
    });
    return result;
  }, [data, previousData, metrics]);

  return (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground mb-3">
        Visão Geral · <span className="text-xs">Arraste para reorganizar</span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metrics.map((key) => {
          const total = computeTotal(data, key);
          const meta = ALL_METRICS.find((m) => m.key === key)!;
          const config = ICON_CONFIGS[key];
          const Icon = config.icon;
          const change = comparisons?.[key];

          return (
            <Card key={key} className="border bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center bg-primary/10`}>
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{meta.label}</span>
                </div>
                <p className="text-xl font-bold text-card-foreground mb-1">
                  {formatMetric(key, total)}
                </p>
                {change !== undefined && change !== null && (
                  <div className={`flex items-center gap-1 text-xs ${change >= 0 ? "text-primary" : "text-destructive"}`}>
                    {change >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span>{change >= 0 ? "+" : ""}{change.toFixed(1)}%</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
