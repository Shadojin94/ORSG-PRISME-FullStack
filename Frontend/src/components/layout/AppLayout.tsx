import { Sidebar } from "./Sidebar"

interface AppLayoutProps {
    children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans antialiased">
            <Sidebar />
            <main className="ml-64 min-h-screen transition-all duration-300 relative">
                {children}
            </main>
        </div>
    )
}
