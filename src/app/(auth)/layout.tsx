import { AnimatedBackground } from "@/components/shared/animated-background";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen-safe items-center justify-center px-4 py-10 safe-x sm:px-6 sm:py-12">
      <AnimatedBackground />
      <div className="relative z-[1] w-full max-w-md">{children}</div>
    </div>
  );
}
