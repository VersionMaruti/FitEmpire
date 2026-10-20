import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { EcosystemHubSection } from '@/components/EcosystemHubSection';
import { AppShowcase } from '@/components/AppShowcase';
import { EcosystemSuite } from '@/components/EcosystemSuite';
import { GymExplorer } from '@/components/GymExplorer';
import { PricingSection } from '@/components/PricingSection';
import { CorporateSection } from '@/components/CorporateSection';
import { PartnerSection } from '@/components/PartnerSection';
import { Testimonials } from '@/components/Testimonials';
import { FAQ } from '@/components/FAQ';
import { Footer } from '@/components/Footer';

export default function HomePage() {
    return (
        <>
            <Navbar />
            <main>
                <HeroSection />
                <EcosystemHubSection />
                <AppShowcase />
                <EcosystemSuite />
                <GymExplorer />
                <PricingSection />
                <CorporateSection />
                <PartnerSection />
                <Testimonials />
                <FAQ />
            </main>
            <Footer />
        </>
    );
}
