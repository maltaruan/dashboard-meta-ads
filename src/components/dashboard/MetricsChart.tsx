import { useMemo, useState } from "react";
import type { MetaAdsInsight } from "@/types/meta";
import { MetricKey, ALL_METRICS } from "@/pages/Index";
import { formatMetric } from "@/components/dashboard/KpiCards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const CHART_COLORS = [
  "hsl(152, 60%, 46%)",
  "hsl(217, 91%, 60%)",
  "hsl(280, 65%, 60%)",
  "hsl(35, 92%, 55%)",
  "hsl(350, 80%, 60%)",
  "hsl(190, 80%, 45%)",
  "hsl(45, 95%, 55%)",
  "hsl(0, 75%, 55%)",
];

interface MetricsChartProps {
  data: MetaAdsInsight[];
  metrics: MetricKey[];
}

export function MetricsChart({ data, metrics }: MetricsChartProps) {
  const [activeMetric, setActiveMetric] = useState<MetricKey | "all">("all");

  const chartData = useMemo(() => {
    const grouped = new Map<string, Record<string, number>>();
    data.forEach((row) => {
      const date = row.date_start;
      if (!grouped.has(date)) grouped.set(date, {});
      const g = grouped.get(date)!;
      metrics.forEach((key) => {
        g[key] = (g[key] ?? 0) + Number(row[key] ?? 0);
      });
      // count for averages
      g["_count"] = (g["_count"] ?? 0) + 1;
    });

    const avgMetrics: MetricKey[] = ["cpm", "ctr", "cpc", "frequency"];

    return Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, vals]) => {
        const entry: Record<string, any> = { date };
        metrics.forEach((key) => {
          entry[key] = avgMetrics.includes(key) ? vals[key] / (vals["_count"] || 1) : vals[key];
        });
        return entry;
      });
  }, [data, metrics]);

  const visibleMetrics = activeMetric === "all" ? metrics : [activeMetric];

  return (
    <Card className="border bg-card shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base font-semibold">Análise de Performance</CardTitle>
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => setActiveMetric("all")}
              className={`px-3 py-1 text-xs rounded-full border transition-all ${
                activeMetric === "all"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40"
              }`}
            >
              Todas
            </button>
            {metrics.map((key) => (
              <button
                key={key}
                onClick={() => setActiveMetric(key)}
                className={`px-3 py-1 text-xs rounded-full border transition-all ${
                  activeMetric === key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:border-primary/40"
                }`}
              >
                {ALL_METRICS.find((m) => m.key === key)!.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(v) => {
                const d = new Date(v);
                return `${d.getDate()}/${d.getMonth() + 1}`;
              }}
            />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--card-foreground))",
              }}
              formatter={(value: number, name: string) => {
                const key = name as MetricKey;
                return [formatMetric(key, value), ALL_METRICS.find((m) => m.key === key)?.label ?? key];
              }}
              labelFormatter={(label) => {
                const d = new Date(label);
                return d.toLocaleDateString("pt-BR");
              }}
            />
            {visibleMetrics.length > 1 && <Legend />}
            {visibleMetrics.map((key, i) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={key}
                stroke={CHART_COLORS[ALL_METRICS.findIndex((m) => m.key === key) % CHART_COLORS.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
