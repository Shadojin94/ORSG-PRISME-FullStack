import { cn } from "@/lib/utils"

interface StatsCardProps {
    icon: any
    color: string
    bg: string
    value: string
    label: string
}

export function StatsCard({ icon: Icon, color, bg, value, label }: StatsCardProps) {
    return (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", bg)}>
                    <Icon className={cn("w-6 h-6", color)} />
                </div>
            </div>
            <div>
                <div className="text-3xl font-bold text-gray-900 tracking-tight mb-1">{value}</div>
                <div className="text-sm font-medium text-gray-500">{label}</div>
            </div>
        </div>
    )
}
