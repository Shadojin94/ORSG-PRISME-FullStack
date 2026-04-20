import { createContext, useContext, useState, useEffect, useCallback, createElement } from 'react';
import type { ReactNode } from 'react';
import { pb, currentUser, isAdmin as checkAdmin } from '@/lib/pocketbase';
import type { PrismeUser } from '@/lib/pocketbase';

interface CheckEmailResult {
    success: boolean;
    error?: string;
    otp_enabled?: boolean;
    can_use_password?: boolean;
}

interface AuthContextType {
    user: PrismeUser | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    loading: boolean;
    checkEmail: (email: string) => Promise<CheckEmailResult>;
    sendCode: (email: string) => Promise<{ success: boolean; error?: string; dev_code?: string }>;
    verifyCode: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
    loginWithPassword: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    forgotPassword: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<PrismeUser | null>(null);
    const [loading, setLoading] = useState(true);

    // Sync state from pb.authStore
    const syncUser = useCallback(() => {
        const u = currentUser();
        setUser(u);
    }, []);

    // On mount: check if auth is still valid
    useEffect(() => {
        async function init() {
            const token = pb.authStore.token;
            // Dev token bypass — don't try to refresh against PocketBase
            if (token && token.startsWith('dev_token_')) {
                syncUser();
            } else if (pb.authStore.isValid) {
                try {
                    await pb.collection('users').authRefresh();
                    syncUser();
                } catch {
                    pb.authStore.clear();
                    setUser(null);
                }
            }
            setLoading(false);
        }
        init();
    }, [syncUser]);

    // Listen for auth store changes
    useEffect(() => {
        const unsub = pb.authStore.onChange(() => {
            syncUser();
        });
        return () => { unsub(); };
    }, [syncUser]);

    const checkEmail = useCallback(async (email: string): Promise<CheckEmailResult> => {
        try {
            const res = await fetch('/api/auth/check-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                return { success: false, error: data.error || 'Adresse email non reconnue' };
            }
            return { success: true, otp_enabled: data.otp_enabled, can_use_password: data.can_use_password };
        } catch {
            return { success: false, error: 'Impossible de contacter le serveur' };
        }
    }, []);

    const sendCode = useCallback(async (email: string) => {
        try {
            const res = await fetch('/api/auth/send-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                return { success: false, error: data.error || 'Erreur lors de l\'envoi du code' };
            }
            return { success: true, dev_code: data.dev_code };
        } catch {
            return { success: false, error: 'Impossible de contacter le serveur' };
        }
    }, []);

    const verifyCode = useCallback(async (email: string, code: string) => {
        try {
            const res = await fetch('/api/auth/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                return { success: false, error: data.error || 'Code invalide' };
            }
            // Save the PocketBase auth token received from backend
            pb.authStore.save(data.token, data.record);
            // Clean up old demo flag
            localStorage.removeItem('demo_authenticated');
            syncUser();
            return { success: true };
        } catch {
            return { success: false, error: 'Impossible de contacter le serveur' };
        }
    }, [syncUser]);

    const loginWithPassword = useCallback(async (email: string, password: string) => {
        try {
            const res = await fetch('/api/auth/login-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                return { success: false, error: data.error || 'Email ou mot de passe incorrect' };
            }
            pb.authStore.save(data.token, data.record);
            localStorage.removeItem('demo_authenticated');
            syncUser();
            return { success: true };
        } catch {
            return { success: false, error: 'Impossible de contacter le serveur' };
        }
    }, [syncUser]);

    const forgotPassword = useCallback(async (email: string) => {
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                return { success: false, error: data.error || 'Erreur lors de la reinitialisation' };
            }
            return { success: true, message: data.message };
        } catch {
            return { success: false, error: 'Impossible de contacter le serveur' };
        }
    }, []);

    const logout = useCallback(() => {
        pb.authStore.clear();
        localStorage.removeItem('demo_authenticated');
        sessionStorage.clear();
        setUser(null);
    }, []);

    const refreshUser = useCallback(async () => {
        if (pb.authStore.isValid) {
            try {
                await pb.collection('users').authRefresh();
                syncUser();
            } catch {
                // ignore
            }
        }
    }, [syncUser]);

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user && (pb.authStore.isValid || (pb.authStore.token || '').startsWith('dev_token_')),
        isAdmin: checkAdmin(),
        loading,
        checkEmail,
        sendCode,
        verifyCode,
        loginWithPassword,
        forgotPassword,
        logout,
        refreshUser,
    };

    return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth(): AuthContextType {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return ctx;
}
