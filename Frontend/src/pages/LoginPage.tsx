import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight, Loader2, ShieldCheck, Mail } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"

export function LoginPage() {
    const navigate = useNavigate()
    const { sendCode, verifyCode, isAuthenticated } = useAuth()
    const videoRef = useRef<HTMLVideoElement>(null)
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState<'email' | 'code'>('email')
    const [email, setEmail] = useState("")
    const [code, setCode] = useState("")
    const [videoLoaded, setVideoLoaded] = useState(false)
    const [error, setError] = useState("")
    const [isDevCode, setIsDevCode] = useState(false)

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate("/dashboard", { replace: true })
        }
    }, [isAuthenticated, navigate])

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(() => {})
        }
    }, [])

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email.trim()) return

        setLoading(true)
        setError("")

        const result = await sendCode(email.trim())

        setLoading(false)
        if (result.success) {
            setStep('code')
            // Dev mode: auto-fill the code if returned by server
            if (result.dev_code) {
                setCode(result.dev_code)
                setIsDevCode(true)
            } else {
                setIsDevCode(false)
            }
        } else {
            setError(result.error || "Erreur lors de l'envoi du code")
        }
    }

    const handleCodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!code.trim()) return

        setLoading(true)
        setError("")

        const cleanCode = code.replace(/\s/g, '')
        const result = await verifyCode(email.trim(), cleanCode)

        if (result.success) {
            navigate("/dashboard", { replace: true })
        } else {
            setError(result.error || "Code incorrect. Veuillez réessayer.")
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black">

            {/* Background Video */}
            <video
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                onLoadedData={() => setVideoLoaded(true)}
                className={cn(
                    "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000",
                    videoLoaded ? "opacity-100" : "opacity-0"
                )}
            >
                <source src="/bg-video.mp4" type="video/mp4" />
            </video>

            {/* Video Overlay - dark gradient for readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/70 z-[1]" />

            {/* Subtle animated glow accents */}
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-ors-blue/20 rounded-full blur-3xl z-[2] animate-pulse" />
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-ors-green/15 rounded-full blur-3xl z-[2] animate-pulse" style={{ animationDelay: '2s' }} />

            {/* Top color bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-ors-yellow via-ors-green to-ors-blue z-[3]" />

            {/* Main content */}
            <div className="w-full max-w-md px-6 sm:px-8 relative z-10">

                {/* Logo / Header */}
                <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="flex justify-center mb-6">
                        <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white/20">
                            <div className="flex items-center gap-1 scale-125">
                                <div className="w-2 h-8 bg-ors-yellow rounded-l-sm"></div>
                                <div className="w-2 h-8 bg-ors-green"></div>
                                <div className="w-2 h-8 bg-ors-blue rounded-r-sm"></div>
                            </div>
                        </div>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 drop-shadow-lg">Data Visus</h1>
                    <p className="text-white/70 text-sm sm:text-base">Portail de Gestion & Analyse BDI</p>
                </div>

                {/* Login Form - Glass morphism */}
                <div className="bg-gray-900/80 backdrop-blur-2xl rounded-2xl shadow-[0_8px_60px_rgba(0,0,0,0.6)] border border-white/20 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-500 delay-150 ring-1 ring-white/10">

                    {/* Step Indicator */}
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-lg",
                            step === 'email'
                                ? "bg-ors-blue text-white shadow-ors-blue/40"
                                : "bg-ors-green text-white shadow-ors-green/40"
                        )}>
                            1
                        </div>
                        <div className={cn(
                            "w-12 h-1 rounded-full transition-all",
                            step === 'code' ? "bg-ors-green" : "bg-white/20"
                        )} />
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all",
                            step === 'code'
                                ? "bg-ors-green text-white shadow-lg shadow-ors-green/40"
                                : "bg-white/15 text-gray-400 border border-white/30"
                        )}>
                            2
                        </div>
                    </div>

                    {step === 'email' ? (
                        <form onSubmit={handleEmailSubmit} className="space-y-6">
                            <div className="text-center mb-4">
                                <h3 className="text-xl font-bold text-white">Connexion Securisee</h3>
                                <p className="text-sm text-gray-300 mt-2">
                                    Entrez votre email pour recevoir un code d'authentification
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-white ml-1">Email professionnel</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-ors-blue transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoComplete="email"
                                        className="block w-full pl-10 pr-3 py-3 border border-white/25 rounded-xl leading-5 bg-white/20 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:bg-white/30 focus:ring-2 focus:ring-ors-blue/50 focus:border-ors-blue/70 transition-all duration-200"
                                        placeholder="prenom.nom@orsg.fr"
                                    />
                                </div>
                                {error && step === 'email' && (
                                    <p className="text-sm text-red-400 text-center mt-2">{error}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !email.trim()}
                                className={cn(
                                    "w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent",
                                    "bg-gradient-to-r from-ors-blue to-blue-600 shadow-ors-blue/30 hover:from-blue-600 hover:to-blue-700 focus:ring-ors-blue hover:shadow-ors-blue/50"
                                )}
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Recevoir mon code <ArrowRight className="ml-2 w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleCodeSubmit} className="space-y-6">
                            <div className="text-center mb-4">
                                <div className="w-12 h-12 bg-ors-green/20 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-ors-green/20">
                                    <ShieldCheck className="w-6 h-6 text-ors-green" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Code envoye !</h3>
                                <p className="text-sm text-gray-300 mt-2">
                                    {isDevCode ? (
                                        <>Code pre-rempli automatiquement<br /><span className="text-xs text-amber-400">(mode dev — SMTP non configure)</span></>
                                    ) : (
                                        <>Un code a 6 chiffres a ete envoye a <br />
                                        <span className="font-semibold text-sky-400">{email}</span></>
                                    )}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-white ml-1">Code d'authentification</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <ShieldCheck className="h-5 w-5 text-gray-400 group-focus-within:text-ors-green transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => { setCode(e.target.value.replace(/[^0-9]/g, '')); setError(""); }}
                                        autoComplete="off"
                                        autoFocus
                                        maxLength={6}
                                        className="block w-full pl-10 pr-3 py-3 border border-white/25 rounded-xl leading-5 bg-white/20 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:bg-white/30 focus:ring-2 focus:ring-ors-green/50 focus:border-ors-green/70 transition-all duration-200 font-mono tracking-widest text-center text-lg"
                                        placeholder="••••••"
                                    />
                                </div>
                                {error && (
                                    <p className="text-sm text-red-400 text-center mt-2">{error}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !code.trim()}
                                className={cn(
                                    "w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent",
                                    "bg-gradient-to-r from-ors-green to-green-600 shadow-ors-green/30 hover:from-green-600 hover:to-green-700 focus:ring-ors-green hover:shadow-ors-green/50"
                                )}
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Se connecter <ArrowRight className="ml-2 w-4 h-4" />
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => { setStep('email'); setCode(''); setError(''); }}
                                className="w-full text-sm text-gray-400 hover:text-white py-2 transition-colors"
                            >
                                &larr; Modifier l'adresse email
                            </button>
                        </form>
                    )}
                </div>

                <p className="mt-8 text-center text-xs text-gray-500">
                    &copy; 2026 ORSG-CTPS. Systeme securise.
                </p>

            </div>
        </div>
    )
}
