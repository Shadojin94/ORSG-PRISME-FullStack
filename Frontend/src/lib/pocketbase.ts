import PocketBase from 'pocketbase';
import type { RecordModel } from 'pocketbase';

// PocketBase URL: use /pb proxy in production (PB is internal to Docker)
// In dev, connect directly to localhost:8090
const PB_URL = import.meta.env.VITE_PB_URL || (
    import.meta.env.DEV ? 'http://127.0.0.1:8090' : '/pb'
);

export const pb = new PocketBase(PB_URL);

// Disable auto-cancellation (causes issues with React strict mode)
pb.autoCancellation(false);

// ===== TypeScript Interfaces =====

export interface PrismeUser extends RecordModel {
    email: string;
    name: string;
    phone: string;
    organization: string;
    department: string;
    role: 'admin' | 'expert' | 'analyste' | 'utilisateur' | 'invite';
    status: 'active' | 'inactive';
    avatar: string;
    otp_enabled: boolean;
    personal_password_hash?: string;
}

export interface SupportTicket extends RecordModel {
    subject: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: 'account' | 'generation' | 'bug' | 'question' | 'other';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    user: string;
    admin_notes: string;
}

// ===== Helpers =====

export function currentUser(): PrismeUser | null {
    if (!pb.authStore.isValid) return null;
    // SDK 0.21.x uses .model, SDK 0.22+ uses .record
    const record = (pb.authStore as any).record || (pb.authStore as any).model;
    return record as PrismeUser || null;
}

export function isAdmin(): boolean {
    const user = currentUser();
    return user?.role === 'admin';
}

export function userInitials(user: PrismeUser | null): string {
    if (!user?.name) return '?';
    return user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export function roleLabelFr(role: string): string {
    const labels: Record<string, string> = {
        admin: 'Administrateur',
        expert: 'Expert',
        analyste: 'Analyste',
        utilisateur: 'Utilisateur',
        invite: 'Invité',
    };
    return labels[role] || role;
}
