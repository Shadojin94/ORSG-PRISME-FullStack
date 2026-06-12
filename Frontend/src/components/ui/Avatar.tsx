import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { getAvatarUrl } from "@/services/api"
import { userInitials } from "@/lib/pocketbase"
import type { PrismeUser } from "@/lib/pocketbase"

interface AvatarProps {
    user: PrismeUser | null
    className?: string
    // Force le rechargement de l'image apres un upload
    version?: number | string
}

// Avatar utilisateur : affiche la photo si elle existe cote serveur,
// sinon un degrade avec les initiales. Le serveur renvoie 404 quand
// aucune photo n'a ete televersee, ce qui declenche le fallback.
export function Avatar({ user, className, version }: AvatarProps) {
    const [errored, setErrored] = useState(false)
    const userId = user?.id || ""

    // Reessaie de charger l'image quand l'utilisateur ou la version change
    useEffect(() => {
        setErrored(false)
    }, [userId, version])

    const showImage = !!userId && !errored

    return (
        <div
            className={cn(
                "flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#1a4b8c] to-[#3bb3a9] font-black text-white",
                className
            )}
        >
            {showImage ? (
                <img
                    src={getAvatarUrl(userId, version)}
                    alt={user?.name || "Avatar"}
                    className="h-full w-full object-cover"
                    onError={() => setErrored(true)}
                />
            ) : (
                <span>{userInitials(user)}</span>
            )}
        </div>
    )
}
