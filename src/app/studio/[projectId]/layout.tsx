export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-dvh min-h-screen-safe overflow-hidden bg-background">
      {children}
    </div>
  );
}
