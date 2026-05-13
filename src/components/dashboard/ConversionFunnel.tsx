import { useMemo } from "react";
import type { MetaAdsInsight } from "@/types/meta";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ConversionFunnelProps {
  data: MetaAdsInsight[];
}

export function ConversionFunnel({ data }: ConversionFunnelProps) {
  const funnel = useMemo(() => {
    const impressions = data.reduce((a, r) => a + Number(r.impressions ?? 0), 0);
    const clicks = data.reduce((a, r) => a + Number(r.clicks ?? 0), 0);
    const reach = data.reduce((a, r) => a + Number(r.reach ?? 0), 0);

    const steps = [
      { label: "Impressões", value: impressions, pct: 100 },
      { label: "Alcance", value: reach, pct: impressions > 0 ? (reach / impressions) * 100 : 0 },
      { label: "Cliques", value: clicks, pct: impressions > 0 ? (clicks / impressions) * 100 : 0 },
    ];

    return steps;
  }, [data]);

  const maxValue = funnel[0]?.value || 1;

  const formatValue = (v: number) => {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
    return v.toLocaleString("pt-BR");
  };

  return (
    <Card className="border bg-card shadow-sm h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Funil de Conversão</CardTitle>
        <p className="text-xs text-muted-foreground">Da impressão ao resultado final</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {funnel.map((step, i) => {
          const barWidth = Math.max((step.value / maxValue) * 100, 5);
          const dropPct = i > 0 ? step.pct : null;

          return (
            <div key={step.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-foreground">{step.label}</span>
                <span className="text-sm font-medium text-foreground">{formatValue(step.value)}</span>
              </div>
              <div className="w-full h-6 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: i === 0 ? "hsl(var(--primary))" : `hsl(var(--primary) / ${1 - i * 0.25})`,
                  }}
                />
              </div>
              {dropPct !== null && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-muted-foreground">
                    ↓ {step.pct.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          );
        })}

        <div className="pt-2 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Taxa de conversão (Impressão → Clique)</span>
            <span className="font-semibold text-primary">
              {funnel[2] ? funnel[2].pct.toFixed(2) : "0.00"}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
