import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";

interface FilterBarProps {
  dateRange: { from?: Date; to?: Date };
  onDateRangeChange: (range: { from?: Date; to?: Date }) => void;
  campaigns: string[];
  selectedCampaigns: string[];
  onCampaignsChange: (v: string[]) => void;
  adSets: string[];
  selectedAdSets: string[];
  onAdSetsChange: (v: string[]) => void;
  ads: string[];
  selectedAds: string[];
  onAdsChange: (v: string[]) => void;
}

function MultiSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (val: string) => {
    onChange(selected.includes(val) ? selected.filter((s) => s !== val) : [...selected, val]);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-start gap-2 min-w-[180px] text-sm">
          {label}
          {selected.length > 0 && (
            <Badge variant="secondary" className="ml-auto text-xs px-1.5 py-0">
              {selected.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <CommandInput placeholder={`Buscar ${label.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>Nenhum resultado.</CommandEmpty>
            <CommandGroup>
              {selected.length > 0 && (
                <CommandItem onSelect={() => onChange([])} className="text-xs text-muted-foreground">
                  <X className="h-3 w-3 mr-2" /> Limpar seleção
                </CommandItem>
              )}
              {options.map((opt) => (
                <CommandItem key={opt} onSelect={() => toggle(opt)}>
                  <Checkbox checked={selected.includes(opt)} className="mr-2" />
                  <span className="truncate text-sm">{opt}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function FilterBar({
  dateRange,
  onDateRangeChange,
  campaigns,
  selectedCampaigns,
  onCampaignsChange,
  adSets,
  selectedAdSets,
  onAdSetsChange,
  ads,
  selectedAds,
  onAdsChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Date Range */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("justify-start text-sm gap-2 min-w-[220px]", !dateRange.from && "text-muted-foreground")}>
            <CalendarIcon className="h-4 w-4" />
            {dateRange.from ? (
              dateRange.to ? (
                `${format(dateRange.from, "dd/MM/yy")} — ${format(dateRange.to, "dd/MM/yy")}`
              ) : (
                format(dateRange.from, "dd/MM/yyyy")
              )
            ) : (
              "Período"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={dateRange as any}
            onSelect={(range: any) => onDateRangeChange(range ?? {})}
            numberOfMonths={2}
            className="p-3 pointer-events-auto"
          />
          {(dateRange.from || dateRange.to) && (
            <div className="p-2 border-t">
              <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => onDateRangeChange({})}>
                Limpar datas
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      <MultiSelect label="Campaign" options={campaigns} selected={selectedCampaigns} onChange={onCampaignsChange} />
      <MultiSelect label="Ad Set" options={adSets} selected={selectedAdSets} onChange={onAdSetsChange} />
      <MultiSelect label="Ad" options={ads} selected={selectedAds} onChange={onAdsChange} />
    </div>
  );
}
