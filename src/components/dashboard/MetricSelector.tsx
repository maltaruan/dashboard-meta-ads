import { ALL_METRICS, MetricKey } from "@/pages/Index";
import { cn } from "@/lib/utils";

interface MetricSelectorProps {
  selected: MetricKey[];
  onChange: (metrics: MetricKey[]) => void;
}

export function MetricSelector({ selected, onChange }: MetricSelectorProps) {
  const toggle = (key: MetricKey) => {
    if (selected.includes(key)) {
      if (selected.length <= 1) return; // keep at least 1
      onChange(selected.filter((m) => m !== key));
    } else {
      onChange([...selected, key]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {ALL_METRICS.map((m) => {
        const active = selected.includes(m.key);
        return (
          <button
            key={m.key}
            onClick={() => toggle(m.key)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all border",
              active
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
            )}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
