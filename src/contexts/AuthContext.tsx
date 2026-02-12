import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth as useClerkAuth, useSignIn, useSignUp, useUser } from '@clerk/clerk-react';
import { getStoredUser, setStoredUser, clearStoredUser } from '../utils/storage';
import { ensureAuthUser } from '../api/auth';
import { setAuthTokenProvider } from '../api/client';
import type { StoredUser, Country } from '../types';

interface EmailLoginPayload {
  mode: 'sign-in' | 'sign-up';
  name: string;
  email: string;
  password: string;
  country: Country;
}

interface AuthContextType {
  user: StoredUser | null;
  isLoading: boolean;
  hasActiveSession: boolean;
  isAuthenticated: boolean;
  loginWithEmail: (payload: EmailLoginPayload) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { isLoaded, isSignedIn, getToken, signOut } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const { signIn, setActive: setSignInActive } = useSignIn();
  const { signUp, setActive: setSignUpActive } = useSignUp();
  const clerkJwtTemplate = import.meta.env.VITE_CLERK_JWT_TEMPLATE as string | undefined;

  const toStoredUser = useCallback((appUser: { id: number; name: string; email: string; country: Country }) => {
    const storedUser: StoredUser = {
      id: appUser.id,
      name: appUser.name,
      email: appUser.email,
      country: appUser.country,
    };
    setStoredUser(storedUser);
    setUser(storedUser);
    return storedUser;
  }, []);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored) {
      setUser(stored);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    setAuthTokenProvider(async () => {
      if (clerkJwtTemplate) {
        try {
          const templateToken = await getToken({ template: clerkJwtTemplate });
          if (templateToken) {
            return templateToken;
          }
        } catch {
          // Fall back to default session token if template retrieval fails.
        }
      }
      return getToken();
    });

    return () => {
      setAuthTokenProvider(null);
    };
  }, [isLoaded, getToken, clerkJwtTemplate]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      clearStoredUser();
      setUser(null);
      setIsLoading(false);
      return;
    }

    const email = clerkUser?.primaryEmailAddress?.emailAddress ?? clerkUser?.emailAddresses[0]?.emailAddress;
    if (!email) {
      console.error('[Auth] No email found for Clerk user');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    console.log('[Auth] Syncing user with backend:', email);
    void ensureAuthUser({
      name: clerkUser?.fullName || clerkUser?.firstName || 'Advent User',
      email,
      country: 'GLOBAL',
    })
      .then((appUser) => {
        console.log('[Auth] Backend sync successful:', appUser);
        toStoredUser(appUser);
      })
      .catch((error: unknown) => {
        console.error('[Auth] Failed to sync authenticated user with backend:', error);
        console.error('[Auth] Make sure your backend is running at', import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081');
        const status = typeof error === 'object' && error !== null && 'status' in error
          ? (error as { status?: number }).status
          : undefined;
        if (status === 401 || status === 403) {
          console.error('[Auth] Backend rejected auth token. Check Clerk JWT backend config (.env) and token template.');
        }
        clearStoredUser();
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isLoaded, isSignedIn, clerkUser, toStoredUser]);

  const loginWithEmail = useCallback(async (payload: EmailLoginPayload) => {
    if (!isLoaded) {
      throw new Error('Authentication is still loading');
    }

    const { mode, name, email, password, country } = payload;

    if (!email.trim() || !password.trim()) {
      throw new Error('Email and password are required');
    }

    if (mode === 'sign-up' && !name.trim()) {
      throw new Error('Name is required for sign up');
    }

    setIsLoading(true);

    try {
      if (mode === 'sign-up') {
        if (!signUp || !setSignUpActive) {
          throw new Error('Sign up is not available right now');
        }

        const result = await signUp.create({
          emailAddress: email.trim(),
          password,
          firstName: name.trim(),
        });

        if (result.status !== 'complete' || !result.createdSessionId) {
          throw new Error('Email verification is required before sign in');
        }

        await setSignUpActive({ session: result.createdSessionId });
      } else {
        if (!signIn || !setSignInActive) {
          throw new Error('Sign in is not available right now');
        }

        const result = await signIn.create({
          identifier: email.trim(),
          password,
        });

        if (result.status !== 'complete' || !result.createdSessionId) {
          throw new Error('Unable to sign in with email and password');
        }

        await setSignInActive({ session: result.createdSessionId });
      }

      const appUser = await ensureAuthUser({
        name: name.trim() || clerkUser?.fullName || 'Advent User',
        email: email.trim(),
        country,
      });

      toStoredUser(appUser);
    } finally {
      setIsLoading(false);
    }
  }, [clerkUser?.fullName, isLoaded, setSignInActive, setSignUpActive, signIn, signUp, toStoredUser]);

  const loginWithGoogle = useCallback(async () => {
    if (!signIn) {
      throw new Error('Google sign-in is not available right now');
    }

    await signIn.authenticateWithRedirect({
      strategy: 'oauth_google',
      redirectUrl: '/sso-callback',
      redirectUrlComplete: '/',
    });
  }, [signIn]);

  const logout = useCallback(async () => {
    await signOut();
    clearStoredUser();
    setUser(null);
  }, [signOut]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      hasActiveSession: Boolean(isLoaded && isSignedIn),
      isAuthenticated: Boolean(isLoaded && isSignedIn),
      loginWithEmail,
      loginWithGoogle,
      logout,
    }),
    [user, isLoading, isLoaded, isSignedIn, loginWithEmail, loginWithGoogle, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
