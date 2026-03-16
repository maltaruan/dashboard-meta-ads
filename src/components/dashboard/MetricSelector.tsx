import { useState } from "react";
import { ALL_METRICS, MetricKey } from "@/pages/Index";
import { cn } from "@/lib/utils";
import { SlidersHorizontal, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface MetricSelectorProps {
  selected: MetricKey[];
  onChange: (metrics: MetricKey[]) => void;
}

export function MetricSelector({ selected, onChange }: MetricSelectorProps) {
  const toggle = (key: MetricKey) => {
    if (selected.includes(key)) {
      if (selected.length <= 1) return;
      onChange(selected.filter((m) => m !== key));
    } else {
      onChange([...selected, key]);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2 text-sm">
          <SlidersHorizontal className="h-4 w-4" />
          Métricas
          <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
            {selected.length}
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-3" align="start">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground mb-2">Selecione as métricas</p>
          {ALL_METRICS.map((m) => (
            <label
              key={m.key}
              className="flex items-center gap-2 cursor-pointer text-sm hover:text-foreground text-muted-foreground"
            >
              <Checkbox
                checked={selected.includes(m.key)}
                onCheckedChange={() => toggle(m.key)}
              />
              <span>{m.label}</span>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
