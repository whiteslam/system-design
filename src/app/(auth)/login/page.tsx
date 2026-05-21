import { LoginForm } from "@/features/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <LoginForm
      redirectTo={params.redirect}
      authError={params.error}
      authErrorDetail={params.message}
    />
  );
}
