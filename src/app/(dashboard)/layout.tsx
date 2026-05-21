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
    <div className="relative flex min-h-screen-safe">
      <AnimatedBackground />
      <Sidebar />
      <main className="relative z-[1] min-w-0 flex-1 overflow-y-auto pt-14 safe-top lg:pt-0">
        <PageTransition>
          <div className="mx-auto max-w-6xl px-4 py-6 safe-x sm:px-6 sm:py-8 lg:px-10 lg:py-10">
            {children}
          </div>
        </PageTransition>
      </main>
    </div>
  );
}
