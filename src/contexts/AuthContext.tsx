import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  hasActiveSubscription?: boolean;
  subscriptionPlan?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    name?: string;
    phone?: string;
    countryCode?: string;
    phoneCountryPrefix?: string;
    affiliateCode?: string;
    affiliateSource?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isInitializing = useRef(true);
  const isProcessingAuth = useRef(false);

  const getUserWithRole = useCallback(async (authUser: SupabaseUser): Promise<User> => {
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_user_role_and_subscription', {
        user_uuid: authUser.id
      });

      if (!rpcError && rpcData && Array.isArray(rpcData) && rpcData.length > 0) {
        const info = rpcData[0];
        return {
          id: authUser.id,
          email: authUser.email!,
          name: authUser.user_metadata?.name,
          role: info.role || 'user',
          hasActiveSubscription: info.has_active_subscription || false,
          subscriptionPlan: info.subscription_plan
        };
      }
    } catch (err) {
      console.warn('RPC failed, using default role:', err);
    }

    return {
      id: authUser.id,
      email: authUser.email!,
      name: authUser.user_metadata?.name,
      role: 'user',
      hasActiveSubscription: false
    };
  }, []);

  const ensureCustomerExists = useCallback(async (authUser: SupabaseUser) => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/ensure-customer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          user_id: authUser.id,
          email: authUser.email!,
          phone: authUser.user_metadata?.phone || null,
          country_code: authUser.user_metadata?.country_code || null,
          phone_country_prefix: authUser.user_metadata?.phone_country_prefix || null
        })
      });

      if (!response.ok) {
        console.warn('ensureCustomerExists returned non-OK status');
      }
    } catch (error) {
      console.warn('ensureCustomerExists failed (non-critical):', error);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (mounted && session?.user) {
          try {
            await ensureCustomerExists(session.user);
            const userWithRole = await getUserWithRole(session.user);
            if (mounted) {
              setUser(userWithRole);
            }
          } catch (error) {
            if (mounted) {
              setUser({
                id: session.user.id,
                email: session.user.email!,
                name: session.user.user_metadata?.name,
                role: 'user'
              });
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (mounted) {
          setLoading(false);
          isInitializing.current = false;
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted || isInitializing.current || isProcessingAuth.current) {
        return;
      }

      if (event === 'SIGNED_IN' && session?.user) {
        try {
          await ensureCustomerExists(session.user);
          const userWithRole = await getUserWithRole(session.user);
          if (mounted) {
            setUser(userWithRole);
          }
        } catch (error) {
          if (mounted) {
            setUser({
              id: session.user.id,
              email: session.user.email!,
              name: session.user.user_metadata?.name,
              role: 'user'
            });
          }
        }
      } else if (event === 'SIGNED_OUT') {
        if (mounted) {
          setUser(null);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [getUserWithRole, ensureCustomerExists]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      isProcessingAuth.current = true;

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        const userWithRole = await getUserWithRole(data.user);
        setUser(userWithRole);

        ensureCustomerExists(data.user).catch(console.error);
      }
    } finally {
      isProcessingAuth.current = false;
    }
  }, [getUserWithRole, ensureCustomerExists]);

  const register = useCallback(async (data: {
    email: string;
    password: string;
    name?: string;
    phone?: string;
    countryCode?: string;
    phoneCountryPrefix?: string;
    affiliateCode?: string;
    affiliateSource?: string;
  }) => {
    try {
      isProcessingAuth.current = true;

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            phone: data.phone,
            country_code: data.countryCode,
            phone_country_prefix: data.phoneCountryPrefix
          }
        }
      });

      if (error) throw error;

      if (authData.user) {
        await ensureCustomerExists(authData.user);

        // Process affiliate attribution if code exists
        if (data.affiliateCode) {
          try {
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData?.session?.access_token) {
              await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/affiliate-track`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${sessionData.session.access_token}`,
                  'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
                },
                body: JSON.stringify({
                  affiliate_code: data.affiliateCode,
                  source: data.affiliateSource || 'direct'
                })
              });

              // Clear the ref cookie after successful attribution
              document.cookie = 'ref=; Path=/; Max-Age=0';
            }
          } catch (trackingError) {
            console.error('Error tracking affiliate:', trackingError);
            // Don't block registration if tracking fails
          }
        }

        const userWithRole = await getUserWithRole(authData.user);
        setUser(userWithRole);
      }
    } finally {
      isProcessingAuth.current = false;
    }
  }, [getUserWithRole, ensureCustomerExists]);

  const logout = useCallback(async () => {
    try {
      isProcessingAuth.current = true;

      // Clear user state immediately
      setUser(null);

      // Sign out from Supabase
      await supabase.auth.signOut({ scope: 'local' });

      // Clear any local storage items except navigation state
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !key.startsWith('sb-')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      sessionStorage.clear();
    } catch (error) {
      console.error('Logout failed:', error);

      // Even if there's an error, force clear state
      setUser(null);
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !key.startsWith('sb-')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      sessionStorage.clear();
    } finally {
      isProcessingAuth.current = false;
    }
  }, []);

  const value: AuthContextType = useMemo(() => ({
    user,
    loading,
    login,
    register,
    logout
  }), [user, loading, login, register, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
