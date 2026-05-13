import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { Button } from '@/components/ui/button';

export function AuthenticatedLayout() {
  const { user, signOut } = useAuth();
  const { data: account } = useCurrentAccount();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-14 items-center justify-between border-b px-6">
        <Link to="/" className="flex items-center gap-3 text-sm font-medium">
          <span>Dashboard ySquad</span>
          {account && (
            <span className="text-xs text-muted-foreground">— {account.name}</span>
          )}
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{user?.email}</span>
          <Button variant="ghost" size="sm" onClick={signOut}>
            Sair
          </Button>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
