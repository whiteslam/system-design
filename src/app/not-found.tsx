import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="text-6xl font-bold gradient-text">404</h1>
      <p className="mt-4 text-muted-foreground">Page not found</p>
      <Button variant="gradient" className="mt-8" asChild>
        <Link href="/">Go home</Link>
      </Button>
    </div>
  );
}
