import { useMemo, useState } from "react";
import type { MetaAdsInsight } from "@/types/meta";
import { MetricKey, ALL_METRICS } from "@/pages/Index";
import { formatMetric } from "@/components/dashboard/KpiCards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 25;

interface DataTableProps {
  data: MetaAdsInsight[];
  metrics: MetricKey[];
}

type SortConfig = { key: string; dir: "asc" | "desc" } | null;

export function DataTable({ data, metrics }: DataTableProps) {
  const [sort, setSort] = useState<SortConfig>(null);
  const [page, setPage] = useState(0);

  // Aggregate rows by date + campaign + adset + ad
  const rows = useMemo(() => {
    const map = new Map<string, Record<string, any>>();
    const avgMetrics: MetricKey[] = ["cpm", "ctr", "cpc", "frequency"];

    data.forEach((row) => {
      const key = `${row.date_start}|${row.campaign_name}|${row.adset_name}|${row.ad_name}`;
      if (!map.has(key)) {
        map.set(key, {
          date_start: row.date_start,
          campaign_name: row.campaign_name,
          adset_name: row.adset_name,
          ad_name: row.ad_name,
          _count: 0,
        });
        metrics.forEach((m) => {
          map.get(key)![m] = 0;
        });
      }
      const g = map.get(key)!;
      g._count++;
      metrics.forEach((m) => {
        g[m] += Number(row[m] ?? 0);
      });
    });

    return Array.from(map.values()).map((row) => {
      avgMetrics.forEach((m) => {
        if (metrics.includes(m)) {
          row[m] = row[m] / (row._count || 1);
        }
      });
      return row;
    });
  }, [data, metrics]);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    return [...rows].sort((a, b) => {
      const av = a[sort.key] ?? "";
      const bv = b[sort.key] ?? "";
      const cmp = typeof av === "number" ? av - (bv as number) : String(av).localeCompare(String(bv));
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [rows, sort]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const pageData = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (key: string) => {
    setSort((prev) => {
      if (prev?.key === key) return { key, dir: prev.dir === "asc" ? "desc" : "asc" };
      return { key, dir: "asc" };
    });
    setPage(0);
  };

  const SortableHeader = ({ label, colKey }: { label: string; colKey: string }) => (
    <TableHead className="cursor-pointer select-none whitespace-nowrap" onClick={() => toggleSort(colKey)}>
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
      </div>
    </TableHead>
  );

  return (
    <Card className="border bg-card shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Dados detalhados</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader label="Data" colKey="date_start" />
                <SortableHeader label="Campaign" colKey="campaign_name" />
                <SortableHeader label="Ad Set" colKey="adset_name" />
                <SortableHeader label="Ad" colKey="ad_name" />
                {metrics.map((key) => (
                  <SortableHeader key={key} label={ALL_METRICS.find((m) => m.key === key)!.label} colKey={key} />
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageData.map((row, i) => (
                <TableRow key={i}>
                  <TableCell className="whitespace-nowrap text-sm">
                    {new Date(row.date_start).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-sm max-w-[200px] truncate">{row.campaign_name}</TableCell>
                  <TableCell className="text-sm max-w-[180px] truncate">{row.adset_name}</TableCell>
                  <TableCell className="text-sm max-w-[180px] truncate">{row.ad_name}</TableCell>
                  {metrics.map((key) => (
                    <TableCell key={key} className="text-sm text-right whitespace-nowrap">
                      {formatMetric(key, row[key] ?? 0)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              {sorted.length} registros — Página {page + 1} de {totalPages}
            </p>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" disabled={page === 0} onClick={() => setPage(page - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
