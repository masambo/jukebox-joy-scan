import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Bar {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  description: string | null;
  address: string | null;
}

interface ManagerBarContextType {
  bar: Bar | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

const ManagerBarContext = createContext<ManagerBarContextType | undefined>(undefined);

export function ManagerBarProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [bar, setBar] = useState<Bar | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBar = async () => {
    if (!user) {
      setBar(null);
      setLoading(false);
      return;
    }

    // Get the bar this manager is assigned to
    const { data: barManager, error: bmError } = await supabase
      .from('bar_managers')
      .select('bar_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (bmError || !barManager) {
      setBar(null);
      setLoading(false);
      return;
    }

    const { data: barData, error: barError } = await supabase
      .from('bars')
      .select('*')
      .eq('id', barManager.bar_id)
      .single();

    if (barError) {
      setBar(null);
    } else {
      setBar(barData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBar();
  }, [user]);

  return (
    <ManagerBarContext.Provider value={{ bar, loading, refetch: fetchBar }}>
      {children}
    </ManagerBarContext.Provider>
  );
}

export function useManagerBar() {
  const context = useContext(ManagerBarContext);
  if (context === undefined) {
    throw new Error('useManagerBar must be used within a ManagerBarProvider');
  }
  return context;
}
