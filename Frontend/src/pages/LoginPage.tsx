import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { pb } from "@/lib/pocketbase"
import { Lock, User, ArrowRight, Loader2, KeyRound, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

export function LoginPage() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [authMethod, setAuthMethod] = useState<'password' | 'code'>('password')
    const [view, setView] = useState<'login' | 'forgot'>('login')

    const [error, setError] = useState<string | null>(null)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        // Extract values from form
        const form = e.target as HTMLFormElement
        const emailInput = form.querySelector('input[type="text"]') as HTMLInputElement
        const passwordInput = form.querySelector('input[type="password"]') as HTMLInputElement

        const email = emailInput?.value
        const password = passwordInput?.value

        try {
            // Attempt Admin Auth (since we just created an admin)
            // For production with end-users, you would use:
            // await pb.collection('users').authWithPassword(email, password);
            await pb.admins.authWithPassword(email, password);

            // If successful
            navigate("/dashboard")
        } catch (err: any) {
            console.error("Login failed:", err)
            // Show real error for debugging
            const msg = err?.originalError?.message || err?.message || "Erreur inconnue";
            setError(`Debug: ${msg}`)
        } finally {
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
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 animate-in fade-in zoom-in-95 duration-500 delay-150 relative">

                    {/* View Switcher: Forgot Password */}
                    {view === 'forgot' ? (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-gray-800">Mot de passe oublié ?</h3>
                                <p className="text-sm text-gray-500 mt-2">Entrez votre email pour recevoir un lien de réinitialisation.</p>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-orsg-blue/20 focus:border-orsg-blue"
                                    placeholder="Email professionnel"
                                />
                            </div>
                            <button className="w-full py-3 bg-orsg-blue text-white rounded-xl font-bold hover:bg-blue-600 transition-colors">
                                Envoyer le lien
                            </button>
                            <button onClick={() => setView('login')} className="w-full text-sm text-gray-500 hover:text-gray-800">
                                Retour à la connexion
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleLogin} className="space-y-6">

                            {/* Auth Method Tabs */}
                            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl mb-6">
                                <button
                                    type="button"
                                    onClick={() => setAuthMethod('password')}
                                    className={`text-xs font-bold py-2 rounded-lg transition-all ${authMethod === 'password' ? 'bg-white text-orsg-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Mot de passe
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAuthMethod('code')}
                                    className={`text-xs font-bold py-2 rounded-lg transition-all ${authMethod === 'code' ? 'bg-white text-orsg-green shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Code Authentification
                                </button>
                            </div>

                            <div className="space-y-2">
                                {/* Error Message */}
                                {error && (
                                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center animate-in fade-in slide-in-from-top-2">
                                        <span className="font-bold mr-1">Erreur:</span> {error}
                                    </div>
                                )}
                                <label className="text-sm font-medium text-gray-700 ml-1">Identifiant / Email</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400 group-focus-within:text-orsg-blue transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-orsg-blue/20 focus:border-orsg-blue transition-all duration-200"
                                        placeholder="ex: admin.orsg"
                                        defaultValue="admin"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                {authMethod === 'password' ? (
                                    <>
                                        <label className="text-sm font-medium text-gray-700 ml-1">Mot de passe</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-orsg-green transition-colors" />
                                            </div>
                                            <input
                                                type="password"
                                                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-orsg-green/20 focus:border-orsg-green transition-all duration-200"
                                                placeholder="••••••••"
                                                defaultValue="password"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <label className="text-sm font-medium text-gray-700 ml-1">Code de Sécurité (Reçu par Email)</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <ShieldCheck className="h-5 w-5 text-gray-400 group-focus-within:text-orsg-green transition-colors" />
                                            </div>
                                            <input
                                                type="text"
                                                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-orsg-green/20 focus:border-orsg-green transition-all duration-200 font-mono tracking-widest text-center"
                                                placeholder="123 456"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center">
                                    <input id="remember-me" type="checkbox" className="h-4 w-4 text-orsg-blue focus:ring-orsg-blue border-gray-300 rounded" />
                                    <label htmlFor="remember-me" className="ml-2 block text-gray-500">Se souvenir</label>
                                </div>
                                {authMethod === 'password' && (
                                    <button type="button" onClick={() => setView('forgot')} className="font-medium text-orsg-blue hover:text-blue-600 transition-colors">
                                        Oublié ?
                                    </button>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={cn(
                                    "w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2",
                                    authMethod === 'password' ? "bg-gradient-to-r from-orsg-blue to-blue-600 shadow-orsg-blue/20 hover:from-blue-600 hover:to-blue-700 focus:ring-orsg-blue"
                                        : "bg-gradient-to-r from-orsg-green to-green-600 shadow-orsg-green/20 hover:from-green-600 hover:to-green-700 focus:ring-orsg-green"
                                )}
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        {authMethod === 'password' ? 'Connexion' : 'Valider le code'} <ArrowRight className="ml-2 w-4 h-4" />
                                    </>
                                )}
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
