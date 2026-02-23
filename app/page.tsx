
import { HeroSection } from "@/components/hero-section"
import { ProblemsSection } from "@/components/problems-section"
import { SolutionSection } from "@/components/solution-section"
import { ValuePropSection } from "@/components/value-prop-section"
import { FeaturesSection } from "@/components/features-section"
import { StatsSection } from "@/components/stats-section"
import { CTASection } from "@/components/cta-section"


export default function Home() {
  return (
    <main className="relative min-h-screen bg-background">
      <HeroSection />
      <ProblemsSection />
      <SolutionSection />
      <ValuePropSection />
      <FeaturesSection />
      <StatsSection />
      <CTASection />
    </main>
  )
}
