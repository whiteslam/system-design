/** Maps Supabase OAuth API errors to actionable copy. */
export function formatOAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes("provider is not enabled") ||
    lower.includes("unsupported provider")
  ) {
    return "Google sign-in is not enabled in Supabase. Open your project → Authentication → Providers → Google, turn it on, and add your Google Client ID & Secret.";
  }
  return message;
}

export function getAuthErrorMessage(
  code: string | null | undefined,
  detail?: string | null
): string | null {
  if (!code) return null;

  switch (code) {
    case "auth_callback":
      return detail ?? "Google sign-in was cancelled or failed. Please try again.";
    case "configuration":
      return "Authentication is not configured. Contact support.";
    default:
      return detail ?? "Something went wrong. Please try again.";
  }
}
