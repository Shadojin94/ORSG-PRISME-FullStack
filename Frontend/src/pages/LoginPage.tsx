import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight, Loader2, ShieldCheck, Mail, KeyRound, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"

type Step = 'email' | 'choose' | 'code' | 'password' | 'forgot'

export function LoginPage() {
    const navigate = useNavigate()
    const { sendCode, verifyCode, loginWithPassword, forgotPassword, isAuthenticated } = useAuth()
    const videoRef = useRef<HTMLVideoElement>(null)
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState<Step>('email')
    const [email, setEmail] = useState("")
    const [code, setCode] = useState("")
    const [password, setPassword] = useState("")
    const [videoLoaded, setVideoLoaded] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [isDevCode, setIsDevCode] = useState(false)

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

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!email.trim()) return
        setError("")
        setStep('choose')
    }

    const handleSendOTP = async () => {
        setLoading(true)
        setError("")

        const result = await sendCode(email.trim())

        setLoading(false)
        if (result.success) {
            setStep('code')
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
            setError(result.error || "Code incorrect. Veuillez reessayer.")
            setLoading(false)
        }
    }

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!password.trim()) return

        setLoading(true)
        setError("")

        const result = await loginWithPassword(email.trim(), password)

        if (result.success) {
            navigate("/dashboard", { replace: true })
        } else {
            setError(result.error || "Email ou mot de passe incorrect")
            setLoading(false)
        }
    }

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        setSuccess("")

        const result = await forgotPassword(email.trim())

        setLoading(false)
        if (result.success) {
            setSuccess(result.message || "Un mot de passe temporaire a ete envoye a votre adresse email.")
        } else {
            setError(result.error || "Erreur lors de la reinitialisation")
        }
    }

    const goBack = () => {
        setError("")
        setSuccess("")
        if (step === 'code' || step === 'password') setStep('choose')
        else if (step === 'forgot') setStep('password')
        else if (step === 'choose') setStep('email')
    }

    const stepNumber = step === 'email' ? 1 : 2

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

            {/* Video Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/70 z-[1]" />

            {/* Glow accents */}
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
                            stepNumber >= 1
                                ? "bg-ors-blue text-white shadow-ors-blue/40"
                                : "bg-white/15 text-gray-400 border border-white/30"
                        )}>
                            1
                        </div>
                        <div className={cn(
                            "w-12 h-1 rounded-full transition-all",
                            stepNumber >= 2 ? "bg-ors-green" : "bg-white/20"
                        )} />
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all",
                            stepNumber >= 2
                                ? "bg-ors-green text-white shadow-lg shadow-ors-green/40"
                                : "bg-white/15 text-gray-400 border border-white/30"
                        )}>
                            2
                        </div>
                    </div>

                    {/* STEP: EMAIL */}
                    {step === 'email' && (
                        <form onSubmit={handleEmailSubmit} className="space-y-6">
                            <div className="text-center mb-4">
                                <h3 className="text-xl font-bold text-white">Connexion Securisee</h3>
                                <p className="text-sm text-gray-300 mt-2">
                                    Entrez votre email pour vous connecter
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
                                {error && (
                                    <p className="text-sm text-red-400 text-center mt-2">{error}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={!email.trim()}
                                className={cn(
                                    "w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent",
                                    "bg-gradient-to-r from-ors-blue to-blue-600 shadow-ors-blue/30 hover:from-blue-600 hover:to-blue-700 focus:ring-ors-blue hover:shadow-ors-blue/50"
                                )}
                            >
                                Continuer <ArrowRight className="ml-2 w-4 h-4" />
                            </button>
                        </form>
                    )}

                    {/* STEP: CHOOSE METHOD */}
                    {step === 'choose' && (
                        <div className="space-y-5">
                            <div className="text-center mb-4">
                                <h3 className="text-xl font-bold text-white">Methode de connexion</h3>
                                <p className="text-sm text-gray-300 mt-2">
                                    <span className="font-semibold text-sky-400">{email}</span>
                                </p>
                            </div>

                            <button
                                onClick={handleSendOTP}
                                disabled={loading}
                                className={cn(
                                    "w-full flex items-center gap-4 py-4 px-5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-[1.01]",
                                    loading && "opacity-70 cursor-not-allowed"
                                )}
                            >
                                <div className="w-10 h-10 rounded-full bg-ors-blue/20 flex items-center justify-center flex-shrink-0">
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 text-ors-blue animate-spin" />
                                    ) : (
                                        <Mail className="w-5 h-5 text-ors-blue" />
                                    )}
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-sm">Code par email</div>
                                    <div className="text-xs text-gray-400">Recevoir un code a 6 chiffres</div>
                                </div>
                                <ArrowRight className="w-4 h-4 ml-auto text-gray-400" />
                            </button>

                            <button
                                onClick={() => { setError(""); setStep('password'); }}
                                className="w-full flex items-center gap-4 py-4 px-5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-[1.01]"
                            >
                                <div className="w-10 h-10 rounded-full bg-ors-green/20 flex items-center justify-center flex-shrink-0">
                                    <KeyRound className="w-5 h-5 text-ors-green" />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-sm">Mot de passe</div>
                                    <div className="text-xs text-gray-400">Se connecter avec un mot de passe</div>
                                </div>
                                <ArrowRight className="w-4 h-4 ml-auto text-gray-400" />
                            </button>

                            {error && (
                                <p className="text-sm text-red-400 text-center">{error}</p>
                            )}

                            <button
                                type="button"
                                onClick={() => { setStep('email'); setError(''); }}
                                className="w-full text-sm text-gray-400 hover:text-white py-2 transition-colors flex items-center justify-center gap-1"
                            >
                                <ArrowLeft className="w-3 h-3" /> Modifier l'adresse email
                            </button>
                        </div>
                    )}

                    {/* STEP: OTP CODE */}
                    {step === 'code' && (
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
                                onClick={goBack}
                                className="w-full text-sm text-gray-400 hover:text-white py-2 transition-colors flex items-center justify-center gap-1"
                            >
                                <ArrowLeft className="w-3 h-3" /> Retour
                            </button>
                        </form>
                    )}

                    {/* STEP: PASSWORD */}
                    {step === 'password' && (
                        <form onSubmit={handlePasswordSubmit} className="space-y-6">
                            <div className="text-center mb-4">
                                <div className="w-12 h-12 bg-ors-green/20 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-ors-green/20">
                                    <KeyRound className="w-6 h-6 text-ors-green" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Mot de passe</h3>
                                <p className="text-sm text-gray-300 mt-2">
                                    <span className="font-semibold text-sky-400">{email}</span>
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-white ml-1">Mot de passe</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <KeyRound className="h-5 w-5 text-gray-400 group-focus-within:text-ors-green transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value); setError(""); }}
                                        autoComplete="current-password"
                                        autoFocus
                                        className="block w-full pl-10 pr-3 py-3 border border-white/25 rounded-xl leading-5 bg-white/20 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:bg-white/30 focus:ring-2 focus:ring-ors-green/50 focus:border-ors-green/70 transition-all duration-200"
                                        placeholder="Votre mot de passe"
                                    />
                                </div>
                                {error && (
                                    <p className="text-sm text-red-400 text-center mt-2">{error}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !password.trim()}
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

                            <div className="flex flex-col gap-2">
                                <button
                                    type="button"
                                    onClick={() => { setStep('forgot'); setError(''); setSuccess(''); }}
                                    className="w-full text-sm text-amber-400/80 hover:text-amber-300 py-1 transition-colors"
                                >
                                    Mot de passe oublie ?
                                </button>
                                <button
                                    type="button"
                                    onClick={goBack}
                                    className="w-full text-sm text-gray-400 hover:text-white py-1 transition-colors flex items-center justify-center gap-1"
                                >
                                    <ArrowLeft className="w-3 h-3" /> Retour
                                </button>
                            </div>
                        </form>
                    )}

                    {/* STEP: FORGOT PASSWORD */}
                    {step === 'forgot' && (
                        <form onSubmit={handleForgotPassword} className="space-y-6">
                            <div className="text-center mb-4">
                                <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/20">
                                    <Mail className="w-6 h-6 text-amber-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Reinitialiser le mot de passe</h3>
                                <p className="text-sm text-gray-300 mt-2">
                                    Un mot de passe temporaire sera envoye a<br />
                                    <span className="font-semibold text-sky-400">{email}</span>
                                </p>
                            </div>

                            {success ? (
                                <div className="space-y-4">
                                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                                        <p className="text-sm text-green-400 text-center">{success}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => { setStep('password'); setPassword(''); setSuccess(''); }}
                                        className={cn(
                                            "w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white transition-all transform hover:scale-[1.02]",
                                            "bg-gradient-to-r from-ors-green to-green-600 shadow-ors-green/30 hover:from-green-600 hover:to-green-700"
                                        )}
                                    >
                                        Se connecter avec le mot de passe temporaire <ArrowRight className="ml-2 w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {error && (
                                        <p className="text-sm text-red-400 text-center">{error}</p>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={cn(
                                            "w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed",
                                            "bg-gradient-to-r from-amber-500 to-amber-600 shadow-amber-500/30 hover:from-amber-600 hover:to-amber-700"
                                        )}
                                    >
                                        {loading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                Envoyer un mot de passe temporaire <Mail className="ml-2 w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </>
                            )}

                            <button
                                type="button"
                                onClick={goBack}
                                className="w-full text-sm text-gray-400 hover:text-white py-2 transition-colors flex items-center justify-center gap-1"
                            >
                                <ArrowLeft className="w-3 h-3" /> Retour
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
