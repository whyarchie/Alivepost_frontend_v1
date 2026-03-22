import { Footer } from "@/components/footer"
import { Navigation } from "@/components/navigation"
import { CTASection } from "@/components/cta-section"

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <div className="flex flex-col min-h-screen">
            <Navigation />
            <main className="flex-1">
                {children}
            </main>
            <CTASection />
            <Footer />
        </div>
    )
}
