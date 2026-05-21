import { Skeleton } from "@/components/ui/skeleton";
import { DashboardHeader } from "@/components/layout/dashboard-header";

export default function DashboardLoading() {
  return (
    <div className="space-y-10">
      <DashboardHeader
        title="Welcome back"
        description="Your system design workspace"
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
