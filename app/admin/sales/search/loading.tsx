import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function SalesSearchLoading() {
  return (
    <div className="space-y-6">
      {/* Filter Card Skeleton */}
      <Card className="p-6">
        <Skeleton className="h-8 w-24 mb-4" />
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </Card>

      {/* Table Skeleton */}
      <Card className="p-4">
        <Skeleton className="h-[400px] w-full" />
      </Card>
    </div>
  );
}
