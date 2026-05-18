import { AnimatedBackground } from "@/components/shared/animated-background";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-6 py-12">
      <AnimatedBackground />
      {children}
    </div>
  );
}
