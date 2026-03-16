import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";
import { Activity, Store, MonitorSmartphone, MapPin } from "lucide-react";

const businessTypes = [
  { id: "ecommerce", label: "E-commerce", icon: Store },
  { id: "infoproduto", label: "Infoproduto", icon: MonitorSmartphone },
  { id: "local", label: "Negócio Local", icon: MapPin },
];

export default function GA4() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const handleConnect = () => {
    setConnecting(true);
    // TODO: integrate real Google OAuth
    setTimeout(() => setConnecting(false), 2000);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 backdrop-blur px-6 py-3">
            <div />
            <ThemeToggle />
          </div>

          <div className="max-w-3xl mx-auto py-10 px-6">
            <h1 className="text-2xl font-bold text-foreground">Dashboard Estratégico GA4</h1>
            <p className="text-muted-foreground mt-1">
              Painel inteligente com insights automáticos para escalar seus resultados
            </p>

            {/* Business Type Selector */}
            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tipo de Negócio · <span className="text-destructive">Obrigatório</span>
              </p>
              <div className="flex gap-3 mt-3">
                {businessTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                      selectedType === type.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-foreground hover:bg-muted"
                    }`}
                  >
                    <type.icon className="h-4 w-4" />
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Connect Card */}
            <Card className="mt-8">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <Activity className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Conecte seu Google Analytics</h2>
                <p className="text-muted-foreground text-center mt-2 max-w-md">
                  Autorize o acesso para desbloquear o dashboard estratégico com insights automáticos e análise de performance.
                </p>
                <Button
                  className="mt-6 px-8"
                  size="lg"
                  onClick={handleConnect}
                  disabled={connecting}
                >
                  {connecting ? "Conectando..." : "Conectar Google Analytics"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
