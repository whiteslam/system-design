import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero";
import { Features } from "@/components/sections/features";
import { DemoPreview } from "@/components/sections/demo-preview";
import { HowItWorks } from "@/components/sections/how-it-works";
import { CTA } from "@/components/sections/cta";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="relative w-full">
        <Hero />
        <Features />
        <DemoPreview />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
