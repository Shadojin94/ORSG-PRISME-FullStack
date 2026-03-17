import { createContext, useContext, useState, useEffect, useCallback, createElement } from 'react';
import type { ReactNode } from 'react';
import { pb, currentUser, isAdmin as checkAdmin } from '@/lib/pocketbase';
import type { PrismeUser } from '@/lib/pocketbase';

interface AuthContextType {
    user: PrismeUser | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    loading: boolean;
    sendCode: (email: string) => Promise<{ success: boolean; error?: string }>;
    verifyCode: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
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
            if (pb.authStore.isValid) {
                try {
                    // Refresh token and get latest user data
                    await pb.collection('users').authRefresh();
                    syncUser();
                } catch {
                    // Token expired or invalid
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
            return { success: true };
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
        isAuthenticated: !!user && pb.authStore.isValid,
        isAdmin: checkAdmin(),
        loading,
        sendCode,
        verifyCode,
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
