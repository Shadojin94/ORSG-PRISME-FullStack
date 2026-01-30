import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight, Loader2, ShieldCheck, Mail } from "lucide-react"
import { cn } from "@/lib/utils"

export function LoginPage() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState<'email' | 'code'>('email')
    const [email, setEmail] = useState("")
    const [code, setCode] = useState("")

    const [error, setError] = useState("")

    const DEMO_CODE = "30012026"

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email.trim()) return

        setLoading(true)
        setError("")
        // Simulation envoi du code par email
        await new Promise(resolve => setTimeout(resolve, 800))
        setLoading(false)
        setStep('code')
    }

    const handleCodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!code.trim()) return

        setLoading(true)
        setError("")
        // Vérification du code démo
        await new Promise(resolve => setTimeout(resolve, 500))

        // Vérifier le code (enlever les espaces)
        const cleanCode = code.replace(/\s/g, '')
        if (cleanCode === DEMO_CODE) {
            localStorage.setItem("demo_authenticated", "true")
            navigate("/dashboard")
        } else {
            setError("Code incorrect. Veuillez réessayer.")
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden">

            {/* Background Decor - ORSG Colors */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orsg-yellow via-orsg-green to-orsg-blue" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-orsg-blue/5 rounded-full blur-3xl" />
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-orsg-green/5 rounded-full blur-3xl" />

            <div className="w-full max-w-md p-8 relative z-10">

                {/* Logo / Header */}
                <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="flex justify-center mb-6">
                        <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
                            <div className="flex items-center gap-1 scale-125">
                                <div className="w-2 h-8 bg-orsg-yellow rounded-l-sm"></div>
                                <div className="w-2 h-8 bg-orsg-green"></div>
                                <div className="w-2 h-8 bg-orsg-blue rounded-r-sm"></div>
                            </div>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Visus</h1>
                    <p className="text-gray-500">Portail de Génération & Analyse BDI</p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 animate-in fade-in zoom-in-95 duration-500 delay-150">

                    {/* Step Indicator */}
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all",
                            step === 'email'
                                ? "bg-orsg-blue text-white"
                                : "bg-orsg-green text-white"
                        )}>
                            1
                        </div>
                        <div className={cn(
                            "w-12 h-1 rounded-full transition-all",
                            step === 'code' ? "bg-orsg-green" : "bg-gray-200"
                        )} />
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all",
                            step === 'code'
                                ? "bg-orsg-green text-white"
                                : "bg-gray-200 text-gray-400"
                        )}>
                            2
                        </div>
                    </div>

                    {step === 'email' ? (
                        <form onSubmit={handleEmailSubmit} className="space-y-6">
                            <div className="text-center mb-4">
                                <h3 className="text-xl font-bold text-gray-800">Connexion Sécurisée</h3>
                                <p className="text-sm text-gray-500 mt-2">
                                    Entrez votre email pour recevoir un code d'authentification
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 ml-1">Email professionnel</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-orsg-blue transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoComplete="off"
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-orsg-blue/20 focus:border-orsg-blue transition-all duration-200"
                                        placeholder="prenom.nom@orsg.fr"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !email.trim()}
                                className={cn(
                                    "w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2",
                                    "bg-gradient-to-r from-orsg-blue to-blue-600 shadow-orsg-blue/20 hover:from-blue-600 hover:to-blue-700 focus:ring-orsg-blue"
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
                                <div className="w-12 h-12 bg-orsg-green/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <ShieldCheck className="w-6 h-6 text-orsg-green" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">Code envoyé !</h3>
                                <p className="text-sm text-gray-500 mt-2">
                                    Un code à 6 chiffres a été envoyé à <br />
                                    <span className="font-medium text-orsg-blue">{email}</span>
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 ml-1">Code d'authentification</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <ShieldCheck className="h-5 w-5 text-gray-400 group-focus-within:text-orsg-green transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => { setCode(e.target.value.replace(/[^0-9]/g, '')); setError(""); }}
                                        autoComplete="off"
                                        autoFocus
                                        maxLength={8}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-orsg-green/20 focus:border-orsg-green transition-all duration-200 font-mono tracking-widest text-center text-lg"
                                        placeholder="••••••••"
                                    />
                                </div>
                                {error && (
                                    <p className="text-sm text-red-500 text-center mt-2">{error}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !code.trim()}
                                className={cn(
                                    "w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2",
                                    "bg-gradient-to-r from-orsg-green to-green-600 shadow-orsg-green/20 hover:from-green-600 hover:to-green-700 focus:ring-orsg-green"
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
                                onClick={() => { setStep('email'); setCode(''); }}
                                className="w-full text-sm text-gray-500 hover:text-gray-800 py-2"
                            >
                                ← Modifier l'adresse email
                            </button>
                        </form>
                    )}
                </div>

                <p className="mt-8 text-center text-xs text-gray-400">
                    © 2024 ORSG-CTPS. Système sécurisé.
                </p>

            </div>
        </div>
    )
}
