import { MetaAdsInsight } from "@/lib/supabase";
import { MetricKey, ALL_METRICS } from "@/pages/Index";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Eye, MousePointerClick, DollarSign, BarChart2, Percent, Repeat } from "lucide-react";

const ICONS: Record<MetricKey, React.ReactNode> = {
  impressions: <Eye className="h-4 w-4" />,
  reach: <BarChart2 className="h-4 w-4" />,
  clicks: <MousePointerClick className="h-4 w-4" />,
  spend: <DollarSign className="h-4 w-4" />,
  cpm: <TrendingUp className="h-4 w-4" />,
  ctr: <Percent className="h-4 w-4" />,
  cpc: <DollarSign className="h-4 w-4" />,
  frequency: <Repeat className="h-4 w-4" />,
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
}

export function KpiCards({ data, metrics }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((key) => {
        const total = computeTotal(data, key);
        const meta = ALL_METRICS.find((m) => m.key === key)!;
        return (
          <Card key={key} className="border bg-card shadow-sm">
            <CardContent className="pt-5 pb-4 px-5">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                {ICONS[key]}
                <span className="text-xs font-medium uppercase tracking-wider">{meta.label}</span>
              </div>
              <p className="text-2xl font-bold text-card-foreground">{formatMetric(key, total)}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
