import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, tokenStorage, setUnauthorizedHandler } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Enquanto true, ainda estamos revalidando o token guardado: evita piscar a
  // tela de login para quem ja esta autenticado.
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  // Qualquer 401 vindo da API derruba a sessao.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      tokenStorage.clear();
      setUser(null);
    });
  }, []);

  // Na carga inicial, revalida o token do localStorage contra a API.
  useEffect(() => {
    let active = true;

    async function restoreSession() {
      if (!tokenStorage.get()) {
        if (active) setLoading(false);
        return;
      }

      try {
        const { user: currentUser } = await api.me();
        if (active) setUser(currentUser);
      } catch {
        tokenStorage.clear();
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    restoreSession();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const { user: loggedUser, token } = await api.login(credentials);
    tokenStorage.set(token);
    setUser(loggedUser);
  }, []);

  const register = useCallback(async (data) => {
    const { user: newUser, token } = await api.register(data);
    tokenStorage.set(token);
    setUser(newUser);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth precisa estar dentro de AuthProvider.');
  return context;
}
