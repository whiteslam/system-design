import { Sidebar } from "@/components/layout/sidebar";
import { AnimatedBackground } from "@/components/shared/animated-background";
import { PageTransition } from "@/providers/page-transition";

/** Auth/DB pages must not be statically prerendered at build (no cookies or env on CI). */
export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen">
      <AnimatedBackground />
      <Sidebar />
      <main className="flex-1 overflow-auto lg:pl-0 pl-0 pt-16 lg:pt-0">
        <PageTransition>
          <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10 lg:py-10">
            {children}
          </div>
        </PageTransition>
      </main>
    </div>
  );
}
