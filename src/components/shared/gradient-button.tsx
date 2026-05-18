import Link from "next/link";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GradientButtonProps extends ButtonProps {
  href?: string;
}

export function GradientButton({
  href,
  children,
  className,
  ...props
}: GradientButtonProps) {
  const button = (
    <Button
      variant="gradient"
      size="lg"
      className={cn("font-semibold", className)}
      {...props}
    >
      {children}
    </Button>
  );

  if (href) {
    return <Link href={href}>{button}</Link>;
  }

  return button;
}
