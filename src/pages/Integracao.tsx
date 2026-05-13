import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { ThemeToggle } from '@/components/dashboard/ThemeToggle';
import { ExternalLink, Plug, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Integration = {
  id: string;
  account_id: string;
  provider: 'meta_ads' | 'google_ads' | 'youtube' | 'ga4';
  external_account_name: string | null;
  status: 'disconnected' | 'connected' | 'error' | 'expired';
  last_sync_at: string | null;
  last_error: string | null;
  accounts: { name: string; slug: string };
};

const STATUS_VARIANT: Record<Integration['status'], { label: string; classes: string }> = {
  connected: {
    label: 'Conectado',
    classes: 'text-emerald-700 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-800',
  },
  disconnected: {
    label: 'Desconectado',
    classes: 'text-orange-600 border-orange-300 bg-orange-50 dark:bg-orange-950/30 dark:border-orange-800',
  },
  error: {
    label: 'Erro',
    classes: 'text-red-700 border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-800',
  },
  expired: {
    label: 'Expirado',
    classes: 'text-amber-700 border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800',
  },
};

export default function Integracao() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const status = searchParams.get('status');
    const reason = searchParams.get('reason');
    if (status === 'success') {
      toast.success('Integração conectada com sucesso');
      setSearchParams({});
    } else if (status === 'error') {
      toast.error(`Falha ao conectar: ${reason ?? 'erro desconhecido'}`);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    void loadIntegrations();
  }, []);

  async function loadIntegrations() {
    setLoading(true);
    const { data, error } = await supabase
      .from('integrations')
      .select('id, account_id, provider, external_account_name, status, last_sync_at, last_error, accounts(name, slug)')
      .order('provider');

    if (error) {
      toast.error('Falha ao carregar integrações');
      console.error(error);
      setLoading(false);
      return;
    }

    setIntegrations((data ?? []) as unknown as Integration[]);
    setLoading(false);
  }

  async function handleConnect(integration: Integration) {
    setConnectingId(integration.id);
    try {
      const { data, error } = await supabase.functions.invoke('meta-oauth-start', {
        body: { integration_id: integration.id },
      });

      if (error) throw error;
      if (!data?.authorize_url) throw new Error('Resposta inválida do servidor');

      window.location.href = data.authorize_url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha ao iniciar conexão');
      setConnectingId(null);
    }
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 backdrop-blur px-6 py-3">
            <h1 className="text-lg font-semibold">Integrações</h1>
            <ThemeToggle />
          </div>

          <div className="max-w-3xl mx-auto py-10 px-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Conexões com plataformas</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Conecte as contas de cada cliente para começar a sincronizar métricas.
              </p>
            </div>

            {loading && <p className="text-sm text-muted-foreground">Carregando integrações...</p>}

            {!loading && integrations.length === 0 && (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  Nenhuma integração configurada ainda.
                </CardContent>
              </Card>
            )}

            {!loading &&
              integrations.map((integration) => {
                const statusInfo = STATUS_VARIANT[integration.status];
                return (
                  <Card key={integration.id}>
                    <CardContent className="flex items-center gap-4 py-5">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <Plug className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">{integration.accounts.name}</span>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-sm">{providerLabel(integration.provider)}</span>
                          <Badge variant="outline" className={`text-xs ${statusInfo.classes}`}>
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {integration.last_error
                            ? `Erro: ${integration.last_error}`
                            : integration.last_sync_at
                              ? `Última sincronização: ${new Date(integration.last_sync_at).toLocaleString('pt-BR')}`
                              : 'Aguardando primeira conexão'}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleConnect(integration)}
                        disabled={connectingId === integration.id || integration.provider !== 'meta_ads'}
                        size="sm"
                      >
                        {connectingId === integration.id ? (
                          'Abrindo...'
                        ) : integration.status === 'connected' ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Reconectar
                          </>
                        ) : integration.status === 'error' ? (
                          <>
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Tentar de novo
                          </>
                        ) : (
                          <>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Conectar
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

function providerLabel(provider: Integration['provider']): string {
  return {
    meta_ads: 'Meta Ads',
    google_ads: 'Google Ads',
    youtube: 'YouTube',
    ga4: 'GA4',
  }[provider];
}
