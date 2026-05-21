import { Skeleton } from "@/components/ui/skeleton";

export default function BlueprintLoading() {
  return (
    <div className="space-y-4 sm:space-y-8">
      <Skeleton className="h-10 w-64" />
      <div className="flex gap-8">
        <Skeleton className="hidden h-96 w-56 lg:block" />
        <Skeleton className="h-96 flex-1" />
      </div>
    </div>
  );
}
