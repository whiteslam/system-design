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
