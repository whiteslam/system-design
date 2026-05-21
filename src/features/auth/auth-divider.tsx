export function AuthDivider() {
  return (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border/50" />
      </div>
      <div className="relative flex justify-center text-xs uppercase tracking-wide">
        <span className="bg-card/40 px-2 text-muted-foreground">or</span>
      </div>
    </div>
  );
}
