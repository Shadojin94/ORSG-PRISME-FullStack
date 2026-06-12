import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Mail, Send, Loader2, CheckCircle2, AlertCircle, Clock, MessageSquare, FileText, RefreshCw, LifeBuoy, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { pb } from "@/lib/pocketbase"
import type { SupportTicket } from "@/lib/pocketbase"
import { getLogs } from "@/services/api"
import { PageHero } from "@/components/ui/PageHero"

const CATEGORIES = [
    { value: 'account', label: 'Mon compte' },
    { value: 'generation', label: 'Génération de fichiers' },
    { value: 'bug', label: 'Bug / Erreur' },
    { value: 'question', label: 'Question générale' },
    { value: 'other', label: 'Autre' },
]

const PRIORITIES = [
    { value: 'low', label: 'Basse', color: 'bg-gray-100 text-gray-700' },
    { value: 'medium', label: 'Moyenne', color: 'bg-blue-100 text-blue-700' },
    { value: 'high', label: 'Haute', color: 'bg-orange-100 text-orange-700' },
    { value: 'critical', label: 'Critique', color: 'bg-red-100 text-red-700' },
]

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    open: { label: 'Ouvert', color: 'bg-blue-100 text-blue-700' },
    in_progress: { label: 'En cours', color: 'bg-yellow-100 text-yellow-700' },
    resolved: { label: 'Résolu', color: 'bg-green-100 text-green-700' },
    closed: { label: 'Fermé', color: 'bg-gray-100 text-gray-600' },
}

export function SupportPage() {
    const { user } = useAuth()
    const [tickets, setTickets] = useState<SupportTicket[]>([])
    const [loadingTickets, setLoadingTickets] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState('')

    const [form, setForm] = useState({
        subject: '',
        description: '',
        category: 'question',
        priority: 'medium',
    })

    const loadTickets = useCallback(async () => {
        if (!user) return
        setLoadingTickets(true)
        try {
            const records = await pb.collection('support_tickets').getFullList<SupportTicket>({
                filter: `user="${user.id}"`,
                sort: '-created',
            })
            setTickets(records)
        } catch (err) {
            console.error('Failed to load tickets:', err)
        }
        setLoadingTickets(false)
    }, [user])

    useEffect(() => { loadTickets() }, [loadTickets])

    // Journal technique (logs serveur)
    const [logs, setLogs] = useState<string[]>([])
    const [loadingLogs, setLoadingLogs] = useState(true)
    const [logsError, setLogsError] = useState('')

    const loadLogs = useCallback(async () => {
        setLoadingLogs(true)
        setLogsError('')
        try {
            const lines = await getLogs(200)
            setLogs(lines)
        } catch (err) {
            console.error('Failed to load logs:', err)
            setLogsError("Impossible de charger le journal technique.")
        }
        setLoadingLogs(false)
    }, [])

    useEffect(() => { loadLogs() }, [loadLogs])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return
        if (form.subject.trim().length < 3) {
            setError("Le sujet doit contenir au moins 3 caractères.")
            return
        }
        if (form.description.trim().length < 10) {
            setError("La description doit contenir au moins 10 caractères.")
            return
        }

        setSubmitting(true)
        setError('')
        try {
            await pb.collection('support_tickets').create({
                subject: form.subject.trim(),
                description: form.description.trim(),
                category: form.category,
                priority: form.priority,
                status: 'open',
                user: user.id,
            })
            setForm({ subject: '', description: '', category: 'question', priority: 'medium' })
            setSubmitted(true)
            setTimeout(() => setSubmitted(false), 5000)
            loadTickets()
        } catch (err) {
            console.error('Failed to create ticket:', err)
            setError("Erreur lors de la création du ticket.")
        }
        setSubmitting(false)
    }

    return (
        <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">

            <PageHero
                icon={LifeBuoy}
                eyebrow="Assistance"
                title="Support"
                description="Une question, un bug ou un besoin d'aide ? Ouvrez un ticket ou contactez directement l'administration."
            />

            <div className="grid gap-6 lg:grid-cols-2">

            {/* Ticket Form */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
                <div className="mb-1 flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#1a4b8c]/15 to-[#3bb3a9]/15 text-[#1a4b8c]">
                        <MessageSquare className="h-5 w-5" />
                    </span>
                    <h2 className="text-lg font-black text-[#1a4b8c]">Nouveau ticket de support</h2>
                </div>
                <p className="mb-5 pl-[52px] text-sm text-slate-500">Decrivez votre situation, nous revenons vers vous rapidement.</p>

                {submitted && (
                    <div className="mb-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                        <CheckCircle2 className="h-5 w-5" />
                        Ticket créé avec succès ! Nous reviendrons vers vous rapidement.
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500">Sujet *</label>
                        <input
                            type="text"
                            value={form.subject}
                            onChange={(e) => setForm({ ...form, subject: e.target.value })}
                            className="w-full rounded-lg border border-slate-200 px-4 py-2 outline-none focus:border-[#3bb3a9] focus:ring-2 focus:ring-[#3bb3a9]/20"
                            placeholder="Décrivez brièvement votre problème..."
                            maxLength={200}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500">Catégorie</label>
                            <select
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                className="w-full rounded-lg border border-slate-200 px-4 py-2 outline-none focus:border-[#3bb3a9] focus:ring-2 focus:ring-[#3bb3a9]/20"
                            >
                                {CATEGORIES.map(c => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500">Priorité</label>
                            <select
                                value={form.priority}
                                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                                className="w-full rounded-lg border border-slate-200 px-4 py-2 outline-none focus:border-[#3bb3a9] focus:ring-2 focus:ring-[#3bb3a9]/20"
                            >
                                {PRIORITIES.map(p => (
                                    <option key={p.value} value={p.value}>{p.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-black uppercase tracking-wide text-slate-500">Description *</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            rows={4}
                            className="w-full resize-none rounded-lg border border-slate-200 px-4 py-2 outline-none focus:border-[#3bb3a9] focus:ring-2 focus:ring-[#3bb3a9]/20"
                            placeholder="Décrivez votre problème en détail (étapes pour reproduire, messages d'erreur, etc.)..."
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-2 text-sm text-red-600">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex items-center gap-2 rounded-lg bg-[#1a4b8c] px-5 py-2.5 text-sm font-black text-white shadow-sm transition-all hover:bg-[#153e75] hover:shadow-md disabled:opacity-60"
                        >
                            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            Envoyer le ticket
                        </button>
                    </div>
                </form>
            </motion.div>

            {/* Contact Admin */}
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2 lg:order-last">
                <a
                    href="mailto:naissa.chateau@ors-guyane.org?subject=[Data Visus] Demande de support"
                    className="group block rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                    <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-[#1a4b8c]/15 to-[#3bb3a9]/15 text-[#1a4b8c] transition group-hover:scale-105">
                        <Mail className="h-6 w-6" />
                    </div>
                    <h3 className="mb-1 font-black text-[#1a4b8c]">Contacter l'admin</h3>
                    <p className="text-sm text-slate-500">naissa.chateau@ors-guyane.org</p>
                </a>

                <a
                    href="/docs"
                    className="group block rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                    <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-[#3bb3a9]/15 to-[#4caf50]/15 text-[#3bb3a9] transition group-hover:scale-105">
                        <BookOpen className="h-6 w-6" />
                    </div>
                    <h3 className="mb-1 font-black text-[#1a4b8c]">Documentation</h3>
                    <p className="text-sm text-slate-500">Référentiel BDI & guide d'utilisation</p>
                </a>
            </div>

            {/* Tickets List */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md lg:col-span-2">
                <div className="mb-5 flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#f5c542]/25 to-[#ff9800]/20 text-[#ff9800]">
                        <Clock className="h-5 w-5" />
                    </span>
                    <h2 className="text-lg font-black text-[#1a4b8c]">Mes tickets ({tickets.length})</h2>
                </div>

                {loadingTickets ? (
                    <div className="py-6 text-center">
                        <Loader2 className="mx-auto h-5 w-5 animate-spin text-[#3bb3a9]" />
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-12 text-center">
                        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[#1a4b8c]/10 to-[#3bb3a9]/10 text-[#3bb3a9]">
                            <MessageSquare className="h-7 w-7" />
                        </div>
                        <p className="font-black text-slate-700">Aucun ticket de support</p>
                        <p className="mt-1 text-sm text-slate-500">Soumettez un ticket ci-dessus si vous avez besoin d'aide.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {tickets.map(ticket => {
                            const status = STATUS_LABELS[ticket.status] || STATUS_LABELS.open
                            const priority = PRIORITIES.find(p => p.value === ticket.priority)
                            return (
                                <div key={ticket.id} className="rounded-xl border border-slate-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="text-sm font-black text-slate-900">{ticket.subject}</h4>
                                            <p className="mt-1 line-clamp-2 text-xs text-slate-500">{ticket.description}</p>
                                            <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                                                <span>{new Date(ticket.created).toLocaleDateString('fr-FR')} {new Date(ticket.created).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                                                <span>&bull;</span>
                                                <span>{CATEGORIES.find(c => c.value === ticket.category)?.label}</span>
                                            </div>
                                        </div>
                                        <div className="ml-4 flex items-center gap-2">
                                            {priority && (
                                                <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", priority.color)}>
                                                    {priority.label}
                                                </span>
                                            )}
                                            <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", status.color)}>
                                                {status.label}
                                            </span>
                                        </div>
                                    </div>
                                    {ticket.admin_notes && (
                                        <div className="mt-3 rounded-lg bg-blue-50 p-2 text-xs text-blue-800">
                                            <strong>Réponse admin :</strong> {ticket.admin_notes}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Journal technique */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md lg:col-span-2">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-slate-200 to-slate-100 text-slate-600">
                            <FileText className="h-5 w-5" />
                        </span>
                        <h2 className="text-lg font-black text-[#1a4b8c]">Journal technique</h2>
                    </div>
                    <button
                        onClick={loadLogs}
                        disabled={loadingLogs}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-black text-[#1a4b8c] transition-colors hover:bg-slate-50 disabled:opacity-60"
                    >
                        <RefreshCw className={cn("h-4 w-4", loadingLogs && "animate-spin")} />
                        Rafraîchir
                    </button>
                </div>
                <p className="mb-4 pl-[52px] text-xs text-slate-500">
                    Derniers événements du serveur (générations, connexions, erreurs). Utile pour le suivi des bugs.
                </p>

                {loadingLogs ? (
                    <div className="py-6 text-center">
                        <Loader2 className="mx-auto h-5 w-5 animate-spin text-[#3bb3a9]" />
                    </div>
                ) : logsError ? (
                    <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        {logsError}
                    </div>
                ) : logs.length === 0 ? (
                    <p className="py-6 text-center text-sm text-slate-500">
                        Aucune entrée dans le journal pour le moment.
                    </p>
                ) : (
                    <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-slate-900 p-4 font-mono text-xs text-slate-100">
                        {logs.join('\n')}
                    </pre>
                )}
            </div>

            </div>
        </main>
    )
}
