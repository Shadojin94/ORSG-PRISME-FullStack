import { Mail, AlertTriangle } from "lucide-react"

export function SupportPage() {
    return (
        <div className="max-w-4xl mx-auto py-8 px-4">

            <div className="text-center mb-12">
                <h1 className="text-3xl font-bold text-orsg-darkBlue mb-4">Centre d'Aide & Support</h1>
                <p className="text-gray-600 max-w-xl mx-auto">
                    Besoin d'aide ? Rencontrez-vous technique ? Contactez l'équipe d'administration ou consultez la documentation.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">

                {/* Admin Contact */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-center">
                    <div className="w-16 h-16 bg-blue-50 text-orsg-blue rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mail className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Contacter l'Admin Système</h2>
                    <p className="text-gray-500 text-sm mb-6">
                        Pour toute question relative à votre compte ou aux accès.
                    </p>
                    <button className="bg-orsg-blue text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors w-full">
                        Envoyer un Email
                    </button>
                </div>

                {/* Report Error */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Signaler une erreur</h2>
                    <p className="text-gray-500 text-sm mb-6">
                        Rapportez un bug ou un problème de génération.
                    </p>
                    <button className="bg-white border-2 border-red-100 text-red-600 px-6 py-3 rounded-xl font-bold hover:bg-red-50 transition-colors w-full">
                        Ouvrir un Ticket
                    </button>
                </div>

            </div>

            <div className="mt-12 bg-gray-50 rounded-xl p-6 text-center border border-gray-200">
                <p className="text-sm text-gray-500">
                    Documentation technique disponible sur <a href="/docs" className="text-orsg-blue hover:underline font-bold">Référentiel BDI</a>
                </p>
            </div>

        </div>
    )
}
