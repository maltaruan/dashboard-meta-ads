import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";
import { ExternalLink, Key, Shield, ArrowRight, Info, Plug } from "lucide-react";

export default function Integracao() {
  const [appId, setAppId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [adAccountId, setAdAccountId] = useState("");
  const [connecting, setConnecting] = useState(false);

  const handleConnect = () => {
    setConnecting(true);
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

          <div className="max-w-2xl mx-auto py-10 px-6">
            <h1 className="text-2xl font-bold text-foreground">Integração Meta Ads</h1>
            <p className="text-muted-foreground mt-1">Conecte sua conta para importar dados automaticamente</p>

            {/* Status Card */}
            <Card className="mt-8">
              <CardContent className="flex items-center gap-4 py-5">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <Plug className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">Meta Business Suite</span>
                    <Badge variant="outline" className="text-orange-600 border-orange-300 bg-orange-50 dark:bg-orange-950/30 dark:border-orange-800 text-xs">
                      Desconectado
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Configure as credenciais para iniciar a sincronização</p>
                </div>
              </CardContent>
            </Card>

            {/* Configuration Steps */}
            <h2 className="text-lg font-semibold text-foreground mt-10 mb-6">Configuração</h2>

            <Card>
              <CardContent className="py-8 space-y-10">
                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-foreground">Acesse o Meta for Developers</p>
                      <p className="text-sm text-muted-foreground">Crie um app no Meta for Developers para obter seu App ID e Access Token.</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2" asChild>
                      <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                        Abrir Meta for Developers
                      </a>
                    </Button>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <div className="space-y-3 flex-1">
                    <div>
                      <p className="font-medium text-foreground">Insira o App ID</p>
                      <p className="text-sm text-muted-foreground">O ID do seu aplicativo Meta.</p>
                    </div>
                    <div className="flex items-center gap-2 max-w-md">
                      <Key className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <Input
                        placeholder="Ex: 1234567890"
                        value={appId}
                        onChange={(e) => setAppId(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                    3
                  </div>
                  <div className="space-y-3 flex-1">
                    <div>
                      <p className="font-medium text-foreground">Insira o Access Token</p>
                      <p className="text-sm text-muted-foreground">Token de acesso com permissões ads_read e ads_management.</p>
                    </div>
                    <div className="flex items-center gap-2 max-w-md">
                      <Shield className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <Input
                        placeholder="Cole seu Access Token aqui"
                        type="password"
                        value={accessToken}
                        onChange={(e) => setAccessToken(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                    4
                  </div>
                  <div className="space-y-3 flex-1">
                    <div>
                      <p className="font-medium text-foreground">Ad Account ID (opcional)</p>
                      <p className="text-sm text-muted-foreground">Se não informado, será detectado automaticamente.</p>
                    </div>
                    <div className="flex items-center gap-2 max-w-md">
                      <Key className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <Input
                        placeholder="Ex: act_1234567890"
                        value={adAccountId}
                        onChange={(e) => setAdAccountId(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                    5
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-foreground">Conectar e Sincronizar</p>
                      <p className="text-sm text-muted-foreground">Após inserir as credenciais, clique para conectar.</p>
                    </div>
                    <Button className="gap-2" onClick={handleConnect} disabled={connecting}>
                      <ArrowRight className="h-4 w-4" />
                      {connecting ? "Conectando..." : "Conectar Meta Ads"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="mt-6">
              <CardContent className="flex gap-3 py-4">
                <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground text-sm">Sobre a segurança e consumo</p>
                  <p className="text-sm text-muted-foreground">
                    Suas credenciais são armazenadas de forma segura. Os dados são atualizados a cada 15 minutos com cache inteligente, respeitando os limites de rate-limit da API Meta para evitar custos desnecessários.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
