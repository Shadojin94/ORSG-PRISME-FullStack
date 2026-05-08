import { useState } from "react"
import { Sidebar } from "./Sidebar"
import { Menu } from "lucide-react"
import { BackendHealthBanner } from "@/components/BackendHealthBanner"

interface AppLayoutProps {
    children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="min-h-screen bg-background text-foreground font-sans antialiased">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center p-4 bg-[#1a4b8c] text-white fixed top-0 left-0 right-0 z-40 shadow-sm transition-all duration-300">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <span className="ml-4 font-bold text-lg">Data Visus</span>
            </div>

            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <main className="md:ml-64 min-h-screen transition-all duration-300 relative pt-16 md:pt-0">
                <BackendHealthBanner />
                {children}
            </main>
        </div>
    )
}
