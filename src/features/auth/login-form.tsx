"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type AuthActionState } from "@/actions/auth";
import { AuthDivider } from "@/features/auth/auth-divider";
import { GoogleSignInButton } from "@/features/auth/google-sign-in-button";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const initialState: AuthActionState = {};

interface LoginFormProps {
  redirectTo?: string;
  authError?: string | null;
  authErrorDetail?: string | null;
}

export function LoginForm({
  redirectTo = "/dashboard",
  authError,
  authErrorDetail,
}: LoginFormProps) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const oauthError = getAuthErrorMessage(authError, authErrorDetail);

  return (
    <Card className="w-full max-w-md border-border/50 bg-card/40 backdrop-blur-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-xl sm:text-2xl">Welcome back</CardTitle>
        <CardDescription>Sign in to your ArchFlow AI account</CardDescription>
      </CardHeader>
      <CardContent>
        <GoogleSignInButton redirectTo={redirectTo} />
        <AuthDivider />
        <form action={formAction} className="space-y-4">
          {(state.error || oauthError) && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error ?? oauthError}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@company.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              name="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>
          <Button
            type="submit"
            variant="gradient"
            className="w-full"
            disabled={pending}
          >
            {pending ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
