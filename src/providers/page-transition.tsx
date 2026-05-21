interface PageTransitionProps {
  children: React.ReactNode;
}

/** No opacity animations — they break visibility on iOS Safari before hydration. */
export function PageTransition({ children }: PageTransitionProps) {
  return <div>{children}</div>;
}
