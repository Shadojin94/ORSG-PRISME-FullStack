import { useState, useEffect, useCallback } from "react"
import { Mail, Send, Loader2, CheckCircle2, AlertCircle, Clock, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { pb } from "@/lib/pocketbase"
import type { SupportTicket } from "@/lib/pocketbase"

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
        <div className="max-w-4xl mx-auto py-8 px-4">

            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-orsg-darkBlue mb-4">Centre d'Aide & Support</h1>
                <p className="text-gray-600 max-w-xl mx-auto">
                    Besoin d'aide ? Soumettez un ticket de support ou contactez directement l'administration.
                </p>
            </div>

            {/* Ticket Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-orsg-blue" />
                    Nouveau ticket de support
                </h2>

                {submitted && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700 text-sm">
                        <CheckCircle2 className="w-5 h-5" />
                        Ticket créé avec succès ! Nous reviendrons vers vous rapidement.
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sujet *</label>
                        <input
                            type="text"
                            value={form.subject}
                            onChange={(e) => setForm({ ...form, subject: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orsg-blue/20 outline-none"
                            placeholder="Décrivez brièvement votre problème..."
                            maxLength={200}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                            <select
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orsg-blue/20 outline-none"
                            >
                                {CATEGORIES.map(c => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                            <select
                                value={form.priority}
                                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orsg-blue/20 outline-none"
                            >
                                {PRIORITIES.map(p => (
                                    <option key={p.value} value={p.value}>{p.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orsg-blue/20 outline-none resize-none"
                            placeholder="Décrivez votre problème en détail (étapes pour reproduire, messages d'erreur, etc.)..."
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-orsg-blue hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-md transition-colors flex items-center gap-2 disabled:opacity-60"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            Envoyer le ticket
                        </button>
                    </div>
                </form>
            </div>

            {/* Tickets List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orsg-blue" />
                    Mes tickets ({tickets.length})
                </h2>

                {loadingTickets ? (
                    <div className="py-6 text-center">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
                    </div>
                ) : tickets.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-6">
                        Aucun ticket de support. Soumettez un ticket ci-dessus si vous avez besoin d'aide.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {tickets.map(ticket => {
                            const status = STATUS_LABELS[ticket.status] || STATUS_LABELS.open
                            const priority = PRIORITIES.find(p => p.value === ticket.priority)
                            return (
                                <div key={ticket.id} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-900 text-sm">{ticket.subject}</h4>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ticket.description}</p>
                                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                                                <span>{new Date(ticket.created).toLocaleDateString('fr-FR')} {new Date(ticket.created).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                                                <span>&bull;</span>
                                                <span>{CATEGORIES.find(c => c.value === ticket.category)?.label}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 ml-4">
                                            {priority && (
                                                <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", priority.color)}>
                                                    {priority.label}
                                                </span>
                                            )}
                                            <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", status.color)}>
                                                {status.label}
                                            </span>
                                        </div>
                                    </div>
                                    {ticket.admin_notes && (
                                        <div className="mt-3 p-2 bg-blue-50 rounded-lg text-xs text-blue-800">
                                            <strong>Réponse admin :</strong> {ticket.admin_notes}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Contact Admin */}
            <div className="grid md:grid-cols-2 gap-6">
                <a
                    href="mailto:naissa.chateau@ors-guyane.org?subject=[Data Visus] Demande de support"
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-center block"
                >
                    <div className="w-12 h-12 bg-blue-50 text-orsg-blue rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">Contacter l'Admin</h3>
                    <p className="text-gray-500 text-sm">naissa.chateau@ors-guyane.org</p>
                </a>

                <a
                    href="/docs"
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-center block"
                >
                    <div className="w-12 h-12 bg-green-50 text-orsg-green rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">Documentation</h3>
                    <p className="text-gray-500 text-sm">Référentiel BDI & guide d'utilisation</p>
                </a>
            </div>

        </div>
    )
}
