import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { ThemeToggle } from '@/components/dashboard/ThemeToggle';

export default function Inteligencia() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 backdrop-blur px-6 py-3">
            <h1 className="text-lg font-semibold">Inteligencia</h1>
            <ThemeToggle />
          </div>
          <div className="max-w-3xl mx-auto py-16 px-6 text-center text-muted-foreground">
            Em breve.
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
