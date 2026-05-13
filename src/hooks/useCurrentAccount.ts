import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type CurrentAccount = {
  id: string;
  name: string;
  role: 'owner' | 'operator' | 'client';
};

export function useCurrentAccount() {
  const { user, isLoading: authLoading } = useAuth();

  return useQuery({
    queryKey: ['current-account', user?.id],
    enabled: !!user && !authLoading,
    queryFn: async (): Promise<CurrentAccount | null> => {
      if (!user) return null;

      const { data, error } = await (supabase as any)
        .from('account_members')
        .select('role, account_id, accounts(id, name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data || !data.accounts) return null;

      const accounts = data.accounts as { id: string; name: string };
      return {
        id: accounts.id,
        name: accounts.name,
        role: data.role as CurrentAccount['role'],
      };
    },
  });
}
