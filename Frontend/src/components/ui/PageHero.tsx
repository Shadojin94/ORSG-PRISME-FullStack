import { motion } from "framer-motion"
import type { ReactNode } from "react"

interface PageHeroProps {
    icon?: any
    eyebrow?: string
    title: string
    description?: string
    actions?: ReactNode
    children?: ReactNode
}

// En-tete de page premium reutilisable : gradient ORSG, blobs decoratifs,
// pastille eyebrow et zone d'actions. Aligne sur le hero du tableau de bord.
export function PageHero({ icon: Icon, eyebrow, title, description, actions, children }: PageHeroProps) {
    return (
        <motion.section
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl shadow-xl"
            style={{
                background: "linear-gradient(135deg, #1a4b8c 0%, #2a6499 45%, #3bb3a9 100%)",
            }}
        >
            {/* Blobs decoratifs */}
            <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 -translate-y-20 translate-x-20 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-1/3 h-48 w-48 translate-y-16 rounded-full bg-[#f5c542]/30 blur-2xl" />

            <div className="relative flex flex-col gap-6 p-6 md:flex-row md:items-end md:justify-between md:p-10">
                <div className="text-white">
                    {eyebrow && (
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 backdrop-blur-sm">
                            {Icon && <Icon className="h-3.5 w-3.5 text-[#f5c542]" />}
                            <span className="text-[11px] font-black uppercase tracking-[0.18em]">{eyebrow}</span>
                        </div>
                    )}
                    <h1 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">{title}</h1>
                    {description && (
                        <p className="mt-3 max-w-xl text-base leading-7 text-white/85">{description}</p>
                    )}
                </div>
                {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
            </div>
            {children}
        </motion.section>
    )
}
