import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface ActionCardProps {
    to: string
    icon: any
    color: string
    bg: string
    borderColor: string
    title: string
    description: string
    linkText?: string
}

export function ActionCard({ to, icon: Icon, color, bg, borderColor, title, description, linkText = "Consulter" }: ActionCardProps) {
    return (
        <Link to={to} className="group h-full block">
            <div className={cn(
                "bg-white rounded-2xl p-6 border border-gray-100 shadow-sm transition-all h-full flex flex-col hover:border-2",
                borderColor,
                "hover:shadow-lg hover:-translate-y-1"
            )}>
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform", bg)}>
                    <Icon className={cn("w-7 h-7", color)} />
                </div>
                <h3 className={cn("text-xl font-bold mb-3 transition-colors", "group-hover:text-gray-900 text-gray-800")}>
                    {title}
                </h3>
                <p className="text-gray-500 mb-6 flex-grow leading-relaxed">
                    {description}
                </p>
                <div className={cn(
                    "flex items-center text-sm font-bold opacity-70 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0",
                    color // Ensure color class is applied
                )}>
                    {linkText} <ArrowRight className="w-4 h-4 ml-1" />
                </div>
            </div>
        </Link>
    )
}
