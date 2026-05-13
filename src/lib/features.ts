// Feature flags do dashboard.
// Quando uma feature depende de dado que ainda não está disponível
// (ex: metrics_cache vazia antes do Sprint 3), a flag fica false.
// Sprint 3 vira essa flag para true e refatora o que estiver atrás dela.

export const FEATURES = {
  // Habilita queries a métricas (metrics_cache).
  // Quando false, hooks retornam loading state permanente sem fazer fetch.
  METRICS_QUERIES: false,
} as const;
